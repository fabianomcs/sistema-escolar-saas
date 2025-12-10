import { supabase } from '@/lib/supabase'

export async function registrarLog(
  acao: string, 
  detalhes: string, 
  entidade: string = '-', 
  dadosExtras: any = {}
) {
  try {
    // Em um sistema real com login, aqui pegaríamos o usuário da sessão
    // Como estamos no MVP Admin, fixamos um valor ou pegamos do localStorage se tiver
    const usuario = 'Diretoria (Admin)' 

    const { error } = await supabase.from('logs_atividades').insert({
      usuario: usuario,
      acao: acao,
      detalhes: detalhes,
      entidade_afetada: entidade,
      dados_tecnicos: dadosExtras
    })

    if (error) {
        console.error('Erro Supabase Log:', error.message)
    } else {
        console.log(`[LOG SUCESSO] ${acao}`)
    }
    
    console.log(`[LOG] ${acao}: ${detalhes}`)
  } catch (error) {
    console.error('Falha ao registrar log:', error)
    // Não travamos o sistema se o log falhar, apenas avisamos no console
  }
}