import { createClient } from '@/lib/supabase/server'
import type { Supplier, CreateSupplierInput } from '@/types'
import { logger } from '@/lib/utils/logger'

export async function getSuppliers(userId: string): Promise<Supplier[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true })

  if (error) {
    logger.error({ err: error, userId, action: 'getSuppliers' }, 'Failed to fetch suppliers')
    throw new Error('Failed to fetch suppliers')
  }

  return (data ?? []) as Supplier[]
}

export async function getSupplier(id: string): Promise<Supplier | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error({ err: error, id, action: 'getSupplier' }, 'Failed to fetch supplier')
    throw new Error('Failed to fetch supplier')
  }

  return data as Supplier | null
}

export async function createSupplier(
  data: CreateSupplierInput & { user_id: string }
): Promise<Supplier> {
  const supabase = await createClient()
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert({
      user_id: data.user_id,
      name: data.name,
      contact_email: data.contact_email ?? null,
      contact_phone: data.contact_phone ?? null,
      address: data.address ?? null,
      notes: data.notes ?? null,
      rating: data.rating ?? null,
      is_active: data.is_active ?? true,
    })
    .select()
    .single()

  if (error) {
    logger.error({ err: error, action: 'createSupplier' }, 'Failed to create supplier')
    throw new Error('Failed to create supplier')
  }

  return supplier as Supplier
}

export async function updateSupplier(
  id: string,
  data: Partial<CreateSupplierInput>
): Promise<Supplier> {
  const supabase = await createClient()
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    logger.error({ err: error, id, action: 'updateSupplier' }, 'Failed to update supplier')
    throw new Error('Failed to update supplier')
  }

  return supplier as Supplier
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) {
    logger.error({ err: error, id, action: 'deleteSupplier' }, 'Failed to delete supplier')
    throw new Error('Failed to delete supplier')
  }
}
