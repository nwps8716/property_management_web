import { createClient } from '@/utils/supabase/server'
import { supabaseAdmin } from '@/utils/supabase/admin'
import { CommunityTable } from '@/components/admin/CommunityTable'
import { getCommunities } from './actions'
import { redirect } from 'next/navigation'

export default async function CommunitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get current user's profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, company_id')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/dashboard')
  }

  const isSuperAdmin = profile.role === 'super_admin'

  // Only super_admin and property_admin can access
  if (profile.role !== 'super_admin' && profile.role !== 'property_admin') {
    redirect('/dashboard')
  }

  // Fetch communities based on role
  const { communities, error } = await getCommunities()

  if (error) {
    console.error('Failed to fetch communities:', error)
  }

  // Fetch companies for the form (super_admin sees all, property_admin sees only their company)
  let companiesQuery = supabaseAdmin
    .from('companies')
    .select('id, name')
    .order('name')

  if (!isSuperAdmin && profile.company_id) {
    companiesQuery = companiesQuery.eq('id', profile.company_id)
  }

  const { data: companies } = await companiesQuery

  return (
    <div className="max-w-6xl mx-auto">
      <CommunityTable
        communities={communities || []}
        companies={companies || []}
        userRole={profile.role as 'super_admin' | 'property_admin'}
        userCompanyId={profile.company_id || undefined}
      />
    </div>
  )
}
