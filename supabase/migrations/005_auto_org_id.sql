-- Migration 005: Auto-populate org_id on insert
--
-- Every org-scoped table has `org_id NOT NULL` with no default, but the app's
-- service-layer inserts only set user_id (see lib/services/*). So every create
-- action through the app — add inventory item, supplier, recipe, log waste,
-- purchase order — failed a NOT NULL violation, surfaced to users as the generic
-- "Something went wrong." The seeded demo data set org_id explicitly (as the
-- postgres superuser during setup), which is why the bug was invisible until a
-- real in-app insert.
--
-- Fix: a BEFORE INSERT trigger that fills org_id from the inserting user's org
-- membership when it's left null. Trigger runs before the RLS WITH CHECK is
-- evaluated, so the resulting row also satisfies the org-scoped insert policies.
-- Explicit org_id (e.g. the seed function, service-role admin writes) is left
-- untouched.

CREATE OR REPLACE FUNCTION public.set_org_id_default()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.org_id IS NULL THEN
    SELECT om.org_id INTO NEW.org_id
    FROM org_members om
    WHERE om.user_id = auth.uid()
    ORDER BY om.joined_at
    LIMIT 1;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'inventory_items', 'suppliers', 'recipes', 'waste_events',
    'waste_analysis_snapshots', 'menu_items', 'ai_insights', 'purchase_orders'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_set_org_id ON public.%I', t);
    EXECUTE format(
      'CREATE TRIGGER trg_set_org_id BEFORE INSERT ON public.%I '
      'FOR EACH ROW EXECUTE FUNCTION public.set_org_id_default()', t);
  END LOOP;
END;
$$;
