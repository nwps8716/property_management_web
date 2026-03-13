import { createClient } from '@/utils/supabase/server'
import { ResidentTable } from '@/components/admin/ResidentTable'
import { getResidents, getCommunitiesForUser, getCompaniesForForm } from './actions'
import { redirect } from 'next/navigation'

export default async function ResidentsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
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

  // Only super_admin and property_admin can access
  if (profile.role !== 'super_admin' && profile.role !== 'property_admin') {
    redirect('/dashboard')
  }

  const isSuperAdmin = profile.role === 'super_admin'
  const params = await searchParams
  const selectedCommunityId = typeof params.community === 'string' ? params.community : undefined

  // Fetch data based on role
  const [{ communities, error: communitiesError }, { companies, error: companiesError }] = await Promise.all([
    getCommunitiesForUser(),
    getCompaniesForForm()
  ])

  // For super_admin without selected community: don't fetch residents initially
  // For property_admin: fetch residents based on their managed communities
  let residents: any[] = []
  let residentsError: string | undefined

  if (isSuperAdmin) {
    if (selectedCommunityId) {
      const result = await getResidents(selectedCommunityId)
      residents = result.residents || []
      residentsError = result.error
    }
    // If no community selected, residents stays empty
  } else {
    // property_admin: fetch all residents for their communities
    const result = await getResidents()
    residents = result.residents || []
    residentsError = result.error
  }

  if (communitiesError || companiesError || residentsError) {
    console.error('Errors:', { communitiesError, companiesError, residentsError })
  }

  // Debug logging for super_admin
  if (isSuperAdmin) {
    console.log('[ResidentsPage] Super Admin Debug:', {
      selectedCommunityId,
      communitiesCount: communities?.length,
      residentsCount: residents.length,
      residentsError
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <ResidentTable
        residents={residents}
        communities={communities || []}
        companies={companies || []}
        userRole={profile.role as 'super_admin' | 'property_admin'}
        userCompanyId={profile.company_id || undefined}
        initialCommunityId={selectedCommunityId}
      />
    </div>
  )
}
