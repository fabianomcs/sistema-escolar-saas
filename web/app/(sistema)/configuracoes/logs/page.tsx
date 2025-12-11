'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, ShieldCheck, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LogsSistemaPage() {
  const router = useRouter()
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarLogs()
  }, [])

  async function carregarLogs() {
    const { data } = await supabase
      .from('logs_atividades')
      .select('*')
      .order('data_hora', { ascending: false }) // Mais recentes primeiro
      .limit(50) // Traz os últimos 50 eventos
    
    setLogs(data || [])
    setLoading(false)
  }

  const formatarDataHora = (d: string) => {
    return new Date(d).toLocaleString('pt-BR')
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Auditoria do Sistema</h1>
          <p className="text-gray-500">Rastreabilidade de ações críticas e financeiras.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-700 flex items-center gap-2"><ShieldCheck size={18}/> Últimas 50 Atividades</h3>
          <button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:underline">Atualizar</button>
        </div>
        
        <table className="w-full text-sm text-left">
          <thead className="bg-white text-gray-500 border-b border-gray-100">
            <tr>
              <th className="px-6 py-3 w-40">Data/Hora</th>
              <th className="px-6 py-3 w-32">Usuário</th>
              <th className="px-6 py-3 w-40">Ação</th>
              <th className="px-6 py-3">Detalhes</th>
              <th className="px-6 py-3">Alvo</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Carregando logs...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-gray-400">Nenhuma atividade registrada ainda.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-3 text-gray-500 text-xs font-mono">{formatarDataHora(log.data_hora)}</td>
                  <td className="px-6 py-3 font-bold text-gray-700">{log.usuario}</td>
                  <td className="px-6 py-3">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded border ${
                      log.acao.includes('FINANCEIRA') ? 'bg-green-50 text-green-700 border-green-100' :
                      log.acao.includes('PRECO') ? 'bg-purple-50 text-purple-700 border-purple-100' :
                      'bg-gray-100 text-gray-600 border-gray-200'
                    }`}>
                      {log.acao}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-600">{log.detalhes}</td>
                  <td className="px-6 py-3 text-gray-500 text-xs">{log.entidade_afetada}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}