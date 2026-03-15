import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getSuppliers } from '@/lib/services/suppliers'
import { SuppliersPageClient } from './suppliers-page-client'

export default async function SuppliersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const suppliers = await getSuppliers(user.id)

  return <SuppliersPageClient initialSuppliers={suppliers} />
}
