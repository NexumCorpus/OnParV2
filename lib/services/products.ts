import { createClient } from '@/lib/supabase/server'
import type { Product } from '@/types'
import { logger } from '@/lib/utils/logger'

export async function lookupByBarcode(barcode: string): Promise<Product | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    logger.error({ err: error, barcode, action: 'lookupByBarcode' }, 'Failed to lookup product by barcode')
    throw new Error('Failed to lookup product')
  }

  return data as Product | null
}
