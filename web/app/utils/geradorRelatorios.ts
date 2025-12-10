import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// --- 1. RELATÓRIO GERAL DE ALUNOS ---
export function gerarPDFListaAlunos(alunos: any[], titulo: string = 'Lista de Alunos') {
  const doc = new jsPDF()

  // Cabeçalho
  doc.setFontSize(18)
  doc.text(titulo, 14, 22)
  doc.setFontSize(10)
  doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`, 14, 28)

  // Tabela
  const dados = alunos.map(a => [
    a.nome_completo,
    a.turmas?.nome || 'Sem Turma',
    a.responsaveis?.nome_completo || '-',
    a.responsaveis?.telefone_celular || '-'
  ])

  autoTable(doc, {
    head: [['Aluno', 'Turma', 'Responsável', 'Telefone']],
    body: dados,
    startY: 35,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185] } // Azul
  })

  doc.save('lista_alunos.pdf')
}

// --- 2. RELATÓRIO FINANCEIRO (INADIMPLÊNCIA / FLUXO) ---
export function gerarPDFFinanceiro(cobrancas: any[], titulo: string = 'Relatório Financeiro') {
  const doc = new jsPDF()

  doc.setFontSize(18)
  doc.text(titulo, 14, 22)
  doc.setFontSize(10)
  
  // Calcula totais
  const total = cobrancas.reduce((acc, c) => acc + Number(c.valor_original), 0)
  doc.text(`Total Listado: ${new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}`, 14, 28)

  const dados = cobrancas.map(c => [
    new Date(c.data_vencimento).toLocaleDateString('pt-BR'),
    c.alunos?.nome_completo || '-',
    c.responsaveis?.nome_completo || '-',
    c.descricao,
    c.status,
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(c.valor_original)
  ])

  autoTable(doc, {
    head: [['Vencimento', 'Aluno', 'Responsável', 'Descrição', 'Status', 'Valor']],
    body: dados,
    startY: 35,
    styles: { fontSize: 8 },
    // Pinta de vermelho se for atrasado
    didParseCell: function (data) {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.raw === 'ATRASADO') {
          data.cell.styles.textColor = [220, 53, 69] // Vermelho
          data.cell.styles.fontStyle = 'bold'
        }
      }
    }
  })

  doc.save('relatorio_financeiro.pdf')
}

// --- 3. LISTA PARA REUNIÃO DE PAIS (COM ASSINATURA) ---
export function gerarPDFReuniaoPais(alunos: any[], nomeTurma: string) {
  const doc = new jsPDF()

  doc.setFontSize(16)
  doc.text(`Lista de Presença - Reunião de Pais`, 14, 20)
  doc.setFontSize(12)
  doc.text(`Turma: ${nomeTurma}`, 14, 28)
  doc.text(`Data: ____/____/_______`, 150, 28)

  const dados = alunos.map(a => [
    a.nome_completo,
    a.responsaveis?.nome_completo || '__________________________',
    '' // Coluna vazia para assinatura
  ])

  autoTable(doc, {
    head: [['Aluno', 'Nome do Responsável', 'Assinatura']],
    body: dados,
    startY: 35,
    rowPageBreak: 'avoid',
    bodyStyles: { minCellHeight: 15, valign: 'middle' }, // Linhas mais altas para assinar
    columnStyles: {
      2: { cellWidth: 80 } // Espaço maior para assinatura
    }
  })

  doc.save(`reuniao_pais_${nomeTurma}.pdf`)
}