'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FinanceiroService } from '@/services/financeiroService'
import { revalidatePath } from 'next/cache'
// Importa o schema de fora (NÃO DEFINA ELE AQUI DENTRO)
import { schemaMatricula } from '@/lib/schemas/matricula'

export type StateMatricula = {
  success: boolean
  message: string | null
  errors?: any
}

export async function matricularAlunoAction(prevState: any, formData: FormData): Promise<StateMatricula> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Ignora erro
          }
        },
      },
    }
  )

  // 1. Verificar Autenticação
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, message: 'Usuário não autenticado' }

  const { data: profile } = await supabase.from('users_profiles').select('escola_id').eq('id', user.id).single()
  if (!profile?.escola_id) return { success: false, message: 'Usuário sem escola vinculada' }

  // 2. Parse e Validação
  const rawData = Object.fromEntries(formData.entries())
  
  const dadosFormatados = {
    ...rawData,
    ano_letivo: Number(rawData.ano_letivo),
    dia_vencimento: Number(rawData.dia_vencimento),
    valor_mensalidade: Number(rawData.valor_mensalidade),
    valor_matricula: Number(rawData.valor_matricula),
    desconto_percentual: Number(rawData.desconto_percentual),
    gerar_cobrancas: rawData.gerar_cobrancas === 'on' || rawData.gerar_cobrancas === 'true'
  }

  // Usa o schema importado
  const validacao = schemaMatricula.safeParse(dadosFormatados)
  
  if (!validacao.success) {
    return {
      success: false,
      message: 'Erro de validação',
      errors: validacao.error.flatten().fieldErrors
    }
  }

  const dados = validacao.data

  // 3. Execução
  try {
    const { data: aluno, error: erroAluno } = await supabase
      .from('alunos')
      .insert({
        escola_id: profile.escola_id,
        nome_completo: dados.nome_completo,
        data_nascimento: dados.data_nascimento,
        cpf_aluno: dados.cpf_aluno,
        turma_id: dados.turma_id,
        turno_contratado: dados.turno_contratado,
        responsavel_id: dados.responsavel_id,
        dia_vencimento: dados.dia_vencimento,
        valor_mensalidade: dados.valor_mensalidade,
        desconto_percentual: dados.desconto_percentual,
        ativo: true
      })
      .select()
      .single()

    if (erroAluno) throw new Error('Erro ao salvar aluno: ' + erroAluno.message)

    if (dados.gerar_cobrancas) {
       const parcelas = FinanceiroService.gerarCarneMatricula({
         anoLetivo: dados.ano_letivo,
         diaVencimento: dados.dia_vencimento,
         turno: dados.turno_contratado,
         valorMatricula: dados.valor_matricula,
         valorMensalidade: dados.valor_mensalidade,
         descontoPercentual: dados.desconto_percentual
       })

       const cobrancasInsert = parcelas.map(p => ({
         escola_id: profile.escola_id,
         aluno_id: aluno.id,
         responsavel_id: dados.responsavel_id,
         descricao: p.descricao,
         valor_original: p.valor_original,
         data_vencimento: p.data_vencimento.toISOString(),
         status: p.status
       }))

       const { error: erroFin } = await supabase.from('cobrancas').insert(cobrancasInsert)
       if (erroFin) console.error('Erro financeiro', erroFin)
    }

    revalidatePath('/alunos')
    revalidatePath('/financeiro')
    
    return { success: true, message: 'Matrícula realizada com sucesso!' }

  } catch (err: any) {
    console.error(err)
    return { success: false, message: err.message || 'Erro interno' }
  }
}