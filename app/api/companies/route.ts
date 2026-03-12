import { supabaseAdmin } from '@/utils/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const { data: companies, error } = await supabaseAdmin
      .from('companies')
      .select('id, name')
      .order('name')

    if (error) {
      console.error('Failed to fetch companies:', error)
      return NextResponse.json(
        { error: 'Failed to fetch companies' },
        { status: 500 }
      )
    }

    return NextResponse.json({ companies: companies || [] })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
