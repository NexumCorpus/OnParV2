'use server'

import { createClient } from '@/lib/supabase/server'
import {
  createSupplier as createSupplierService,
  updateSupplier as updateSupplierService,
  deleteSupplier as deleteSupplierService,
} from '@/lib/services/suppliers'
import { supplierSchema } from '@/lib/utils/validation'
import { logger } from '@/lib/utils/logger'
import type { ActionResult } from '@/types'

async function getAuthenticatedUserId(): Promise<string> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    throw new Error('Not authenticated')
  }
  return user.id
}

export async function createSupplier(formData: FormData): Promise<ActionResult> {
  try {
    const userId = await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      contact_email: (formData.get('contact_email') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
      rating: formData.get('rating') ? Number(formData.get('rating')) : null,
      is_active: formData.get('is_active') === 'true',
    }

    const parsed = supplierSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const supplier = await createSupplierService({ ...parsed.data, user_id: userId })
    return { success: true, data: supplier }
  } catch (err) {
    logger.error({ err, action: 'createSupplier' }, 'Failed to create supplier')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function updateSupplier(id: string, formData: FormData): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()

    const raw = {
      name: formData.get('name') as string,
      contact_email: (formData.get('contact_email') as string) || null,
      contact_phone: (formData.get('contact_phone') as string) || null,
      address: (formData.get('address') as string) || null,
      notes: (formData.get('notes') as string) || null,
      rating: formData.get('rating') ? Number(formData.get('rating')) : null,
      is_active: formData.get('is_active') === 'true',
    }

    const parsed = supplierSchema.safeParse(raw)
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return { success: false, error: firstError?.message ?? 'Validation failed' }
    }

    const supplier = await updateSupplierService(id, parsed.data)
    return { success: true, data: supplier }
  } catch (err) {
    logger.error({ err, id, action: 'updateSupplier' }, 'Failed to update supplier')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}

export async function deleteSupplier(id: string): Promise<ActionResult> {
  try {
    await getAuthenticatedUserId()
    await deleteSupplierService(id)
    return { success: true }
  } catch (err) {
    logger.error({ err, id, action: 'deleteSupplier' }, 'Failed to delete supplier')
    return { success: false, error: 'Something went wrong. Please try again.' }
  }
}
