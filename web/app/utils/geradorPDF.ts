import jsPDF from 'jspdf'
import { supabase } from '@/lib/supabase'

export async function gerarReciboPDF(cobranca: any, aluno: any, responsavel: any) {
  // 1. Busca dados da Escola para o Cabeçalho
  const { data: escola } = await supabase.from('escolas').select('*').single()
  
  const doc = new jsPDF()
  
  // --- CABEÇALHO ---
  doc.setFontSize(18)
  doc.setFont("helvetica", "bold")
  doc.text(escola?.nome_fantasia || 'Escola', 105, 20, { align: 'center' })
  
  doc.setFontSize(10)
  doc.setFont("helvetica", "normal")
  doc.text(`${escola?.endereco_rua || ''}, ${escola?.endereco_numero || ''} - ${escola?.endereco_bairro || ''}`, 105, 26, { align: 'center' })
  doc.text(`CNPJ: ${escola?.cnpj || ''} | Tel: ${escola?.telefone_suporte || ''}`, 105, 31, { align: 'center' })
  
  doc.setLineWidth(0.5)
  doc.line(20, 35, 190, 35)

  // --- TÍTULO DO RECIBO ---
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text("RECIBO DE PAGAMENTO", 105, 50, { align: 'center' })
  
  // Número do Recibo (Usando ID encurtado ou data)
  const numRecibo = `#${cobranca.id.slice(0, 8).toUpperCase()}`
  doc.setFontSize(10)
  doc.text(numRecibo, 190, 50, { align: 'right' })

  // --- CORPO DO TEXTO ---
  doc.setFontSize(12)
  doc.setFont("helvetica", "normal")
  
  const valorFormatado = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cobranca.valor_pago || 0)
  const dataPagto = new Date(cobranca.data_pagamento).toLocaleDateString('pt-BR')
  
  // Texto jurídico padrão
  const texto = `Recebemos de ${responsavel.nome_completo} (CPF: ${responsavel.cpf}), ` +
                `a importância de ${valorFormatado}, referente ao pagamento de: ` +
                `${cobranca.descricao}, do aluno(a) ${aluno.nome_completo}.`

  // Quebra o texto automaticament se for longo
  const textoQuebrado = doc.splitTextToSize(texto, 170)
  doc.text(textoQuebrado, 20, 70)

  // --- DETALHES TÉCNICOS ---
  doc.setFillColor(245, 245, 245) // Cinza claro
  doc.rect(20, 100, 170, 30, 'F')
  
  doc.setFontSize(10)
  doc.text("Detalhes da Transação:", 25, 110)
  doc.text(`Vencimento Original: ${new Date(cobranca.data_vencimento).toLocaleDateString('pt-BR')}`, 25, 118)
  doc.text(`Data do Pagamento: ${dataPagto}`, 100, 118)
  doc.text(`Forma de Pagamento: ${cobranca.forma_pagamento || 'Não informado'}`, 25, 125)
  if (cobranca.observacao) {
      doc.text(`Obs: ${cobranca.observacao}`, 100, 125)
  }

  // --- ASSINATURA ---
  doc.line(110, 180, 190, 180)
  doc.setFontSize(8)
  doc.text(escola?.razao_social || 'Tesouraria', 150, 185, { align: 'center' })
  doc.text("Assinatura / Carimbo", 150, 189, { align: 'center' })

  // --- RODAPÉ ---
  doc.setFontSize(8)
  doc.text("Este recibo quita apenas os valores nele descritos.", 105, 280, { align: 'center' })

  // Abre o PDF em nova aba
  window.open(doc.output('bloburl'), '_blank')
}