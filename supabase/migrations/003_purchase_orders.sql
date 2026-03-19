-- Migration 003: Purchase Orders

------------------------------------------------------------
-- 1. NEW TABLES: purchase_orders and po_line_items
------------------------------------------------------------
CREATE TABLE purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES users(id),
  status text NOT NULL CHECK (status IN ('draft', 'sent', 'partially_received', 'received', 'cancelled')) DEFAULT 'draft',
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  expected_delivery_date date,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  received_at timestamptz
);

CREATE TABLE po_line_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  inventory_item_id uuid NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_ordered numeric(10,2) NOT NULL CHECK (quantity_ordered > 0),
  quantity_received numeric(10,2) NOT NULL DEFAULT 0,
  unit_price decimal(10,2) NOT NULL,
  total_price decimal(10,2) NOT NULL
);

ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE po_line_items ENABLE ROW LEVEL SECURITY;

CREATE TRIGGER trg_purchase_orders_updated_at
  BEFORE UPDATE ON purchase_orders FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

------------------------------------------------------------
-- 2. RLS POLICIES FOR PURCHASE ORDERS
------------------------------------------------------------
CREATE POLICY "po_select_org" ON purchase_orders FOR SELECT TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_insert_org" ON purchase_orders FOR INSERT TO authenticated WITH CHECK (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_update_org" ON purchase_orders FOR UPDATE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()));
CREATE POLICY "po_delete_org" ON purchase_orders FOR DELETE TO authenticated USING (org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid() AND role IN ('owner', 'manager')));

------------------------------------------------------------
-- 3. RLS POLICIES FOR PO LINE ITEMS
------------------------------------------------------------
CREATE POLICY "po_line_select_org" ON po_line_items FOR SELECT TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_insert_org" ON po_line_items FOR INSERT TO authenticated WITH CHECK (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_update_org" ON po_line_items FOR UPDATE TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()))
);
CREATE POLICY "po_line_delete_org" ON po_line_items FOR DELETE TO authenticated USING (
  po_id IN (SELECT id FROM purchase_orders WHERE org_id IN (SELECT org_id FROM org_members WHERE user_id = auth.uid()) AND role IN ('owner', 'manager'))
);

------------------------------------------------------------
-- 4. RPC: receive_purchase_order
------------------------------------------------------------
-- This function marks a PO as received and automatically increments the inventory
CREATE OR REPLACE FUNCTION receive_purchase_order(p_po_id uuid)
RETURNS void AS $$
DECLARE
  v_org_id uuid;
  v_status text;
  line_item record;
BEGIN
  -- Verify PO exists and get org_id
  SELECT org_id, status INTO v_org_id, v_status FROM purchase_orders WHERE id = p_po_id;
  
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Purchase order not found';
  END IF;
  
  IF v_status = 'received' THEN
    RAISE EXCEPTION 'Purchase order is already marked as received';
  END IF;

  -- Verify user has access to this org's POs
  IF NOT EXISTS (SELECT 1 FROM org_members WHERE org_id = v_org_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Not authorized to receive this purchase order';
  END IF;

  -- Mark PO as received
  UPDATE purchase_orders 
  SET status = 'received', received_at = now(), updated_at = now()
  WHERE id = p_po_id;

  -- For each line item, mark it fully received and update inventory
  FOR line_item IN SELECT id, inventory_item_id, quantity_ordered FROM po_line_items WHERE po_id = p_po_id LOOP
    -- Update line item
    UPDATE po_line_items 
    SET quantity_received = line_item.quantity_ordered
    WHERE id = line_item.id;
    
    -- Update inventory (call existing adjust_quantity RPC for safe concurrent updates)
    PERFORM adjust_quantity(line_item.inventory_item_id, line_item.quantity_ordered);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
