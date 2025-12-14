import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Cliente Admin (com super poderes para criar usuários)
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
    // 1. Buscar todos os responsáveis com CPF válido
    const { data: responsaveis, error: dbError } = await supabaseAdmin
      .from('responsaveis')
      .select('id, nome_completo, cpf, email, telefone_celular')
      .not('cpf', 'is', null)

    if (dbError) throw dbError

    let criados = 0
    let existentes = 0
    let erros = 0

    // 2. Loop para criar logins
    for (const pai of responsaveis) {
      // Limpeza de dados
      const cpfLimpo = pai.cpf.replace(/\D/g, '')
      if (cpfLimpo.length !== 11) continue // Pula CPFs inválidos

      // Definição das Credenciais
      const emailTecnico = `${cpfLimpo}@escolafacil.system`
      
      // Senha: PrimeiroNome + @ + Últimos 4 dígitos do CPF
      const primeiroNome = pai.nome_completo.split(' ')[0]
      const ultimosDigitos = cpfLimpo.slice(-4)
      const senhaGerada = `${primeiroNome}@${ultimosDigitos}`

      // 3. Tenta criar o usuário no Auth
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: emailTecnico,
        password: senhaGerada,
        email_confirm: true, // Já confirma o email automaticamente
        user_metadata: {
          full_name: pai.nome_completo,
          cpf: pai.cpf,
          telefone: pai.telefone_celular,
          tipo_origem: 'MIGRACAO_AUTO'
        }
      })

      if (authError) {
        if (authError.message.includes('already been registered')) {
          existentes++
        } else {
          console.error(`Erro ao criar ${pai.nome_completo}:`, authError.message)
          erros++
        }
      } else {
        // 4. Se criou com sucesso, garante o vinculo e o perfil
        if (authUser.user) {
          // Atualiza perfil para 'responsavel'
          await supabaseAdmin.from('users_profiles').update({
            roles: ['responsavel'],
            nome_completo: pai.nome_completo
          }).eq('id', authUser.user.id)
          
          criados++
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Sincronização concluída',
      stats: { criados, existentes, erros }
    })

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}