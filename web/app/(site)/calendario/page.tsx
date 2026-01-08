import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Calendar, Clock, MapPin } from 'lucide-react'

// Função auxiliar para buscar dados no servidor
async function getEventos() {
  const cookieStore = await cookies()
  
  // Cria cliente Supabase em modo leitura pública
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll() {}
      }
    }
  )

  // Busca eventos do ano atual em diante
  const anoAtual = new Date().getFullYear()
  
  const { data } = await supabase
    .from('cms_calendario')
    .select('*')
    .gte('data_inicio', `${anoAtual}-01-01`) 
    .order('data_inicio', { ascending: true })

  return data || []
}

export default async function CalendarioPublicoPage() {
  const eventos = await getEventos()

  // Agrupa eventos por Mês (Ex: "Junho 2024")
  const eventosPorMes: Record<string, any[]> = {}
  
  eventos.forEach(ev => {
    // Formata o mês: "fevereiro de 2025"
    const mesExtenso = new Date(ev.data_inicio).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
    // Capitaliza: "Fevereiro de 2025"
    const mesFormatado = mesExtenso.charAt(0).toUpperCase() + mesExtenso.slice(1)
    
    if (!eventosPorMes[mesFormatado]) eventosPorMes[mesFormatado] = []
    eventosPorMes[mesFormatado].push(ev)
  })

  // Cores por tipo de evento
  const getBadgeColor = (tipo: string) => {
    switch (tipo) {
      case 'FERIADO': return 'bg-red-100 text-red-700 border-red-200'
      case 'PROVA': return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'REUNIAO': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'LETIVO': return 'bg-gray-100 text-gray-700 border-gray-200'
      default: return 'bg-blue-100 text-blue-700 border-blue-200' // EVENTO
    }
  }

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* Hero Section Simples */}
      <div className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Calendar size={40} className="text-blue-400"/> 
            Calendário Acadêmico
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto text-lg">
            Acompanhe as datas de provas, feriados, reuniões de pais e eventos escolares. 
            Planeje-se com antecedência.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-4xl -mt-8">
        
        {Object.keys(eventosPorMes).length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar size={32} className="text-gray-300"/>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Nenhum evento encontrado</h3>
            <p className="text-gray-500 mt-2">O calendário para este ano ainda não foi divulgado.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.keys(eventosPorMes).map((mes) => (
              <div key={mes} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                
                {/* Cabeçalho do Mês */}
                <div className="bg-blue-600 px-6 py-3 border-b border-blue-700">
                  <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
                    <Calendar size={20} className="text-blue-200"/> {mes}
                  </h2>
                </div>

                {/* Lista de Eventos */}
                <div className="divide-y divide-gray-100">
                  {eventosPorMes[mes].map((ev) => {
                    const dataInicio = new Date(ev.data_inicio)
                    const dia = dataInicio.getDate()
                    const diaSemana = dataInicio.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
                    const hora = dataInicio.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                    
                    return (
                      <div key={ev.id} className="p-6 flex flex-col sm:flex-row gap-6 hover:bg-slate-50 transition-colors group">
                        
                        {/* Box da Data (Esquerda) */}
                        <div className="flex-shrink-0 flex flex-col items-center justify-center w-16 h-16 bg-slate-100 rounded-xl border border-slate-200 group-hover:border-blue-200 group-hover:bg-white transition-colors">
                          <span className="text-sm font-bold text-slate-500 uppercase">{diaSemana}</span>
                          <span className="text-2xl font-bold text-slate-800">{dia}</span>
                        </div>

                        {/* Conteúdo do Evento */}
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wide ${getBadgeColor(ev.tipo)}`}>
                              {ev.tipo}
                            </span>
                            
                            {ev.tipo !== 'FERIADO' && ev.tipo !== 'LETIVO' && (
                              <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                                <Clock size={12}/> {hora}
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-slate-400 border border-slate-200 px-2 py-0.5 rounded uppercase">
                              Público: {ev.publico_alvo}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                            {ev.titulo}
                          </h3>
                          
                          {ev.descricao && (
                            <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                              {ev.descricao}
                            </p>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}