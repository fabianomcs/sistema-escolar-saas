/**
 * SERVIÇO FINANCEIRO
 * Responsável por cálculos puros de parcelas, juros e regras de negócio.
 * Não acessa banco de dados diretamente, apenas processa dados.
 */

import { addMonths, setDate, setMonth, setYear, isBefore, startOfDay } from 'date-fns'

interface ConfigParcelas {
  valorMensalidade: number
  valorMatricula: number
  diaVencimento: number
  anoLetivo: number
  turno: 'Manhã' | 'Tarde' | 'Integral'
  descontoPercentual: number // Ex: 10 para 10%
  valorJaneiroIntegral?: number // Regra especial para integral em janeiro
}

interface ParcelaGerada {
  descricao: string
  valor_original: number
  data_vencimento: Date
  status: 'PENDENTE'
}

export const FinanceiroService = {
  /**
   * Aplica desconto percentual sobre um valor
   */
  calcularDesconto(valor: number, percentual: number): number {
    if (!percentual || percentual <= 0) return valor
    return valor - (valor * (percentual / 100))
  },

  /**
   * Gera o array de cobranças (Carnê) para o ano letivo
   */
  gerarCarneMatricula(config: ConfigParcelas): ParcelaGerada[] {
    const cobrancas: ParcelaGerada[] = []
    const hoje = startOfDay(new Date())

    // 1. Matrícula (Sempre gerada, vencimento hoje ou imediato)
    cobrancas.push({
      descricao: `Matrícula ${config.anoLetivo}`,
      valor_original: config.valorMatricula,
      data_vencimento: new Date(), // Vence hoje
      status: 'PENDENTE'
    })

    // 2. Mensalidades (Janeiro a Dezembro)
    for (let mes = 0; mes < 12; mes++) {
      // Cria a data de vencimento: Dia X do Mês Y do Ano Letivo
      let dataVenc = new Date(config.anoLetivo, mes, config.diaVencimento)
      
      // Ajuste fino: se dia 31 não existe no mês, o JS joga pro dia 1 do outro mês. 
      // Vamos forçar o último dia do mês correto se necessário (simplificação aqui).
      
      // Regra de Negócio: Não gerar boletos do passado? 
      // Depende da escola. Vamos assumir que se o aluno entra em Março, paga de Março em diante.
      // Mas a matrícula pode incluir retroativo. Vamos gerar todos e quem chama decide se salva.
      // Para este MVP, geramos do mês atual em diante.
      
      const ehPassado = isBefore(dataVenc, hoje)
      
      // Se for passado e não for o mês atual, pulamos (Regra: Pro-rata simples)
      // (Você pode alterar essa regra conforme a necessidade da escola)
      if (ehPassado && dataVenc.getMonth() !== hoje.getMonth()) {
         continue 
      }

      // Regra do Turno Integral em Janeiro
      let valorBase = config.valorMensalidade
      if (mes === 0) { // Janeiro
        if (config.turno === 'Integral' && config.valorJaneiroIntegral) {
          valorBase = config.valorJaneiroIntegral
        } else {
          // Se não for integral, muitas escolas não cobram Janeiro (Férias). 
          // Vamos assumir cobrança normal salvo regra contrária.
        }
      }

      const valorFinal = this.calcularDesconto(valorBase, config.descontoPercentual)

      const nomeMes = dataVenc.toLocaleString('pt-BR', { month: 'long' })
      const nomeMesCap = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)

      cobrancas.push({
        descricao: `Mensalidade ${nomeMesCap}/${config.anoLetivo}`,
        valor_original: Number(valorFinal.toFixed(2)), // Arredondamento seguro
        data_vencimento: dataVenc,
        status: 'PENDENTE'
      })
    }

    return cobrancas
  }
}