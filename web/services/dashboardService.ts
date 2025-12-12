import { supabase } from '@/lib/supabase'

export const DashboardService = {
  async obterTotais() {
    // 1. Total de Alunos Ativos
    const { count: totalAlunos } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)

    // 2. Inadimplência (Cobranças Vencidas e Não Pagas)
    const hoje = new Date().toISOString()
    const { count: totalFaturas } = await supabase
      .from('cobrancas')
      .select('*', { count: 'exact', head: true })
    
    const { count: faturasAtrasadas } = await supabase
      .from('cobrancas')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ATRASADO') // Ou filtrar por data < hoje e status != PAGO

    // Cálculo simples de %
    const taxaInadimplencia = totalFaturas ? ((faturasAtrasadas || 0) / totalFaturas) * 100 : 0

    // 3. Novas Matrículas (Último mês)
    const mesPassado = new Date()
    mesPassado.setMonth(mesPassado.getMonth() - 1)
    
    const { count: novasMatriculas } = await supabase
      .from('alunos')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', mesPassado.toISOString())

    return {
      alunos: totalAlunos || 0,
      inadimplencia: taxaInadimplencia.toFixed(1),
      novasMatriculas: novasMatriculas || 0
    }
  }
}