'use client'

import { useEffect, useState, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Calendar as CalendarIcon, Plus, Trash2, 
  Upload, Download, FileSpreadsheet, AlertCircle 
} from 'lucide-react'
import { toast } from 'sonner'
import * as XLSX from 'xlsx' // Importação da lib de Excel

type Evento = {
  id: string
  titulo: string
  descricao: string
  data_inicio: string
  data_fim: string | null
  tipo: 'FERIADO' | 'EVENTO' | 'AVALIACAO' | 'REUNIAO' | 'LETIVO'
  publico_alvo: 'TODOS' | 'ALUNOS' | 'RESPONSAVEIS' | 'DOCENTES'
}

export default function GestaoCalendarioPage() {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [importing, setImporting] = useState(false)
  
  // Referência para o input de arquivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Estado do Formulário
  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    hora_inicio: '08:00',
    data_fim: '',
    tipo: 'EVENTO',
    publico_alvo: 'TODOS'
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // 1. Carregar Eventos
  async function carregarEventos() {
    try {
      const { data, error } = await supabase
        .from('cms_calendario')
        .select('*')
        .order('data_inicio', { ascending: true })

      if (error) throw error
      setEventos(data || [])
    } catch (error) {
      console.error('Erro ao buscar eventos:', error)
      toast.error('Erro ao carregar calendário')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarEventos()
  }, [])

  // 2. Salvar Novo Evento (Individual)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário não logado')

      const { data: profile } = await supabase
        .from('users_profiles')
        .select('escola_id')
        .eq('id', user.id)
        .single()

      if (!profile?.escola_id) throw new Error('Escola não identificada')

      const dataInicioISO = new Date(`${formData.data_inicio}T${formData.hora_inicio}:00`).toISOString()
      const dataFimISO = formData.data_fim ? new Date(`${formData.data_fim}T23:59:59`).toISOString() : null

      const { error } = await supabase.from('cms_calendario').insert({
        escola_id: profile.escola_id,
        titulo: formData.titulo,
        descricao: formData.descricao,
        data_inicio: dataInicioISO,
        data_fim: dataFimISO,
        tipo: formData.tipo,
        publico_alvo: formData.publico_alvo
      })

      if (error) throw error

      toast.success('Evento criado com sucesso!')
      setModalOpen(false)
      setFormData({ 
        titulo: '', descricao: '', data_inicio: '', 
        hora_inicio: '08:00', data_fim: '', tipo: 'EVENTO', publico_alvo: 'TODOS'
      })
      carregarEventos()

    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar evento')
    } finally {
      setSaving(false)
    }
  }

  // 3. Excluir Evento
  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este evento?')) return

    try {
      const { error } = await supabase.from('cms_calendario').delete().eq('id', id)
      if (error) throw error
      toast.success('Evento removido')
      setEventos(prev => prev.filter(ev => ev.id !== id))
    } catch (error) {
      toast.error('Erro ao excluir')
    }
  }

  // --- FUNÇÕES DE EXCEL ---

  // A. Baixar Modelo
  function baixarModeloExcel() {
    const modelo = [
      {
        "Titulo": "Festa Junina",
        "Data": "2025-06-15",
        "Hora": "14:00",
        "Tipo": "EVENTO",
        "Publico": "TODOS",
        "Descricao": "Traje caipira obrigatório"
      },
      {
        "Titulo": "Avaliação Bimestral Matemática",
        "Data": "2025-04-10",
        "Hora": "08:00",
        "Tipo": "AVALIACAO",
        "Publico": "ALUNOS",
        "Descricao": "Capítulos 1 a 5"
      }
    ]

    const worksheet = XLSX.utils.json_to_sheet(modelo)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Modelo Importação")
    XLSX.writeFile(workbook, "modelo_calendario_escolar.xlsx")
  }

  // B. Processar Upload
  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setImporting(true)
    const reader = new FileReader()

    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        const data = XLSX.utils.sheet_to_json(ws) as any[]

        if (data.length === 0) throw new Error("Planilha vazia")

        // Busca escola ID
        const { data: { user } } = await supabase.auth.getUser()
        if(!user) throw new Error("Usuário desconectado")
        
        const { data: profile } = await supabase
            .from('users_profiles')
            .select('escola_id')
            .eq('id', user.id)
            .single()

        if (!profile?.escola_id) throw new Error("Escola não encontrada")

        // Transforma dados
        const eventosParaInserir = data.map((row: any) => {
          // Normaliza TIPO
          let tipo = row['Tipo']?.toUpperCase().trim() || 'EVENTO'
          const tiposValidos = ['FERIADO', 'EVENTO', 'AVALIACAO', 'REUNIAO', 'LETIVO']
          if (!tiposValidos.includes(tipo)) tipo = 'EVENTO'

          // Normaliza PUBLICO
          let publico = row['Publico']?.toUpperCase().trim() || 'TODOS'
          const publicosValidos = ['TODOS', 'ALUNOS', 'RESPONSAVEIS', 'DOCENTES']
          if (!publicosValidos.includes(publico)) publico = 'TODOS'

          // Trata Data e Hora
          // Excel às vezes retorna data como número serial. Vamos assumir string YYYY-MM-DD para simplificar o modelo
          // ou tentar converter.
          let dataStr = row['Data']
          // Se for número serial do Excel (ex: 45000)
          if (typeof dataStr === 'number') {
             const dateObj = new Date(Math.round((dataStr - 25569)*86400*1000))
             dataStr = dateObj.toISOString().split('T')[0]
          }

          const horaStr = row['Hora'] || '08:00'
          const dataInicioISO = new Date(`${dataStr}T${horaStr}:00`).toISOString()

          return {
            escola_id: profile.escola_id,
            titulo: row['Titulo'] || 'Sem Título',
            descricao: row['Descricao'] || '',
            data_inicio: dataInicioISO,
            tipo: tipo,
            publico_alvo: publico
          }
        })

        // Insert Batch
        const { error } = await supabase.from('cms_calendario').insert(eventosParaInserir)
        if (error) throw error

        toast.success(`${eventosParaInserir.length} eventos importados com sucesso!`)
        carregarEventos()
        
      } catch (error: any) {
        console.error(error)
        toast.error(`Erro na importação: ${error.message}`)
      } finally {
        setImporting(false)
        if (fileInputRef.current) fileInputRef.current.value = '' // Limpa input
      }
    }

    reader.readAsBinaryString(file)
  }

  // Formatadores Visuais
  const badgeColor: Record<string, string> = {
    FERIADO: 'bg-red-100 text-red-700 border-red-200',
    AVALIACAO: 'bg-orange-100 text-orange-700 border-orange-200',
    REUNIAO: 'bg-purple-100 text-purple-700 border-purple-200',
    EVENTO: 'bg-blue-100 text-blue-700 border-blue-200',
    LETIVO: 'bg-gray-100 text-gray-700 border-gray-200'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="text-blue-600"/> Calendário Acadêmico
          </h1>
          <p className="text-gray-500">Gerencie eventos via formulário ou importação em massa.</p>
        </div>
        
        <div className="flex gap-2">
            {/* Input Oculto */}
            <input 
                type="file" 
                accept=".xlsx, .xls, .csv" 
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
            />

            <button 
                onClick={baixarModeloExcel}
                className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm font-bold transition-all"
                title="Baixar planilha modelo"
            >
                <Download size={16} /> Modelo
            </button>

            <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 text-sm font-bold shadow-sm transition-all disabled:opacity-50"
            >
                {importing ? 'Importando...' : <><FileSpreadsheet size={16} /> Importar Excel</>}
            </button>

            <button 
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all ml-2"
            >
                <Plus size={20} /> Novo
            </button>
        </div>
      </div>

      {/* Lista de Eventos */}
      {loading ? (
        <div className="text-center py-10 text-gray-500 animate-pulse">Carregando calendário...</div>
      ) : eventos.length === 0 ? (
        <div className="bg-white p-10 rounded-xl border border-dashed border-gray-300 text-center">
          <CalendarIcon size={40} className="mx-auto text-gray-300 mb-3"/>
          <p className="text-gray-500 font-medium">Nenhum evento cadastrado.</p>
          <p className="text-sm text-gray-400">Clique em "Novo" ou importe uma planilha.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 border-b">Data</th>
                <th className="p-4 border-b">Evento</th>
                <th className="p-4 border-b">Tipo</th>
                <th className="p-4 border-b">Público</th>
                <th className="p-4 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eventos.map(ev => (
                <tr key={ev.id} className="hover:bg-gray-50 group transition-colors">
                  <td className="p-4 align-top w-40">
                    <div className="font-bold text-gray-800">
                      {new Date(ev.data_inicio).toLocaleDateString('pt-BR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(ev.data_inicio).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="font-bold text-gray-900">{ev.titulo}</div>
                    {ev.descricao && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{ev.descricao}</p>}
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${badgeColor[ev.tipo] || 'bg-gray-100'}`}>
                      {ev.tipo}
                    </span>
                  </td>
                  <td className="p-4 align-top text-sm text-gray-600">
                    {ev.publico_alvo}
                  </td>
                  <td className="p-4 align-top text-right">
                    <button 
                      onClick={() => handleDelete(ev.id)}
                      className="text-gray-300 hover:text-red-600 transition-colors p-2"
                      title="Excluir evento"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Cadastro (Mantido igual) */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-gray-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800">Novo Evento Manual</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Título do Evento</label>
                <input 
                  required
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ex: Festa Junina..."
                  value={formData.titulo}
                  onChange={e => setFormData({...formData, titulo: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Data Início</label>
                  <input 
                    type="date" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.data_inicio}
                    onChange={e => setFormData({...formData, data_inicio: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Hora</label>
                  <input 
                    type="time" required
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.hora_inicio}
                    onChange={e => setFormData({...formData, hora_inicio: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tipo</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-white"
                    value={formData.tipo}
                    onChange={e => setFormData({...formData, tipo: e.target.value as any})}
                  >
                    <option value="EVENTO">Evento</option>
                    <option value="FERIADO">Feriado</option>
                    <option value="AVALIAÇÃO">Avaliação</option>
                    <option value="REUNIÃO">Reunião</option>
                    <option value="LETIVO">Ano Letivo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Público</label>
                  <select 
                    className="w-full p-2 border rounded-lg bg-white"
                    value={formData.publico_alvo}
                    onChange={e => setFormData({...formData, publico_alvo: e.target.value as any})}
                  >
                    <option value="TODOS">Todos</option>
                    <option value="ALUNOS">Alunos</option>
                    <option value="RESPONSAVEIS">Responsáveis</option>
                    <option value="DOCENTES">Docentes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Descrição</label>
                <textarea 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  rows={3}
                  value={formData.descricao}
                  onChange={e => setFormData({...formData, descricao: e.target.value})}
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button" 
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Salvando...' : 'Salvar Evento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}