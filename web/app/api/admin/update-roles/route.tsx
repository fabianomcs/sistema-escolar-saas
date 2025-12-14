import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Cliente Admin (Service Role)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const { userId, roles } = await request.json()

    if (!userId || !Array.isArray(roles)) {
      return NextResponse.json({ success: false, error: 'Dados inválidos' }, { status: 400 })
    }

    // Atualiza os papéis no banco
    const { error } = await supabaseAdmin
      .from('users_profiles')
      .update({ roles: roles })
      .eq('id', userId)

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Erro ao atualizar permissões:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}