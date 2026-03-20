'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/utils/logger'
import type { ActionResult } from '@/types'

// Get all POs for current org
export async function getPurchaseOrders(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    // Fetch POs along with supplier name and creator email
    // Since RLS is active on org_id, it implicitly filters to the user's org
    const { data: pos, error } = await supabase
      .from('purchase_orders')
      .select(`
        *,
        suppliers(name),
        users(email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      logger.error({ err: error, action: 'getPurchaseOrders' }, 'Failed to fetch POs')
      return { success: false, error: 'Failed to fetch purchase orders' }
    }

    return { success: true, data: pos }
  } catch (err) {
    logger.error({ err, action: 'getPurchaseOrders' }, 'Error fetching POs')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Get PO details including line items
export async function getPurchaseOrderDetails(poId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    // Fetch PO
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .select('*, suppliers(name, contact_email)')
      .eq('id', poId)
      .single()

    if (poError || !po) return { success: false, error: 'PO not found' }

    // Fetch Line Items
    const { data: items, error: itemsError } = await supabase
      .from('po_line_items')
      .select('*, inventory_items(name, unit)')
      .eq('po_id', poId)

    if (itemsError) return { success: false, error: 'Failed to fetch line items' }

    return { success: true, data: { po, items } }
  } catch (err) {
    logger.error({ err, poId, action: 'getPurchaseOrderDetails' }, 'Error fetching PO details')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Receive a PO via the RPC function
export async function receivePurchaseOrder(poId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.rpc('receive_purchase_order', {
      p_po_id: poId
    })

    if (error) {
      logger.error({ err: error, poId, action: 'receivePurchaseOrder' }, 'Failed to receive PO')
      return { success: false, error: error.message || 'Failed to receive purchase order' }
    }

    return { success: true }
  } catch (err) {
    logger.error({ err, poId, action: 'receivePurchaseOrder' }, 'Error receiving PO')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Create a draft PO from an array of inventory items
export async function createDraftPO(supplierId: string, items: { id: string, quantity: number, price: number }[]): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    // Get org_id for creating
    const { data: orgMember } = await supabase
      .from('org_members')
      .select('org_id')
      .eq('user_id', user.id)
      .single()

    if (!orgMember) return { success: false, error: 'Organization not found' }

    // Calculate total
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.price), 0)

    // 1. Create the PO
    const { data: po, error: poError } = await supabase
      .from('purchase_orders')
      .insert({
        org_id: orgMember.org_id,
        supplier_id: supplierId,
        created_by: user.id,
        status: 'draft',
        total_amount: totalAmount,
      })
      .select()
      .single()

    if (poError || !po) {
      logger.error({ err: poError, action: 'createDraftPO' }, 'Failed to create PO record')
      return { success: false, error: 'Failed to create purchase order' }
    }

    // 2. Create the line items
    const lineItemsData = items.map(item => ({
      po_id: po.id,
      inventory_item_id: item.id,
      quantity_ordered: item.quantity,
      unit_price: item.price,
      total_price: item.quantity * item.price
    }))

    const { error: lineItemsError } = await supabase
      .from('po_line_items')
      .insert(lineItemsData)

    if (lineItemsError) {
      logger.error({ err: lineItemsError, action: 'createDraftPO' }, 'Failed to create PO line items')
      // Clean up the draft PO so we don't have dangling empty drafts
      await supabase.from('purchase_orders').delete().eq('id', po.id)
      return { success: false, error: 'Failed to add items to purchase order' }
    }

    return { success: true, data: po }
  } catch (err) {
    logger.error({ err, action: 'createDraftPO' }, 'Error creating draft PO')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Mark PO as sent
export async function sendPurchaseOrder(poId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .update({ status: 'sent', updated_at: new Date().toISOString() })
      .eq('id', poId)
      .eq('status', 'draft')
      .select()

    if (error) {
      return { success: false, error: 'Failed to update PO status' }
    }

    if (!data || data.length === 0) {
      return { success: false, error: 'Purchase order not found or is not in draft status' }
    }

    // SIMULATED: Send actual email to supplier here via Resend/SendGrid

    return { success: true }
  } catch (err) {
    logger.error({ err, poId, action: 'sendPurchaseOrder' }, 'Error sending PO')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Get low stock items for a supplier to draft a PO
export async function getLowStockItemsForSupplier(supplierId: string): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    // RLS implicitly filters to user's org
    const { data: items, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('supplier_id', supplierId)
      .is('deleted_at', null)
      
    if (error) {
      logger.error({ err: error, action: 'getLowStockItemsForSupplier' }, 'Failed to fetch items')
      return { success: false, error: 'Failed to fetch items' }
    }

    const lowStockItems = items.filter(i => i.quantity <= i.reorder_point)

    return { success: true, data: lowStockItems }
  } catch (err) {
    logger.error({ err, action: 'getLowStockItemsForSupplier' }, 'Error fetching items')
    return { success: false, error: 'Something went wrong.' }
  }
}

// Get all suppliers for the dropdown
export async function getSuppliersForDropdown(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return { success: false, error: 'Not authenticated' }

    const { data: suppliers, error } = await supabase
      .from('suppliers')
      .select('id, name')
      .order('name')

    if (error) {
      return { success: false, error: 'Failed to fetch suppliers' }
    }

    return { success: true, data: suppliers }
  } catch (err) {
    logger.error({ err, action: 'getSuppliersForDropdown' }, 'Error fetching suppliers')
    return { success: false, error: 'Something went wrong.' }
  }
}
