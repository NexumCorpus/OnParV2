import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSuppliers } from '@/lib/services/suppliers'
import type { Supplier } from '@/types'
import { SuppliersPageClient } from './suppliers-page-client'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  let suppliers: Supplier[] = []
  try {
    suppliers = await getSuppliers(user.id)
  } catch (error) {
    console.error('[SuppliersPage] Data fetch failed:', error)
  }

  return <SuppliersPageClient initialSuppliers={suppliers} />
}
