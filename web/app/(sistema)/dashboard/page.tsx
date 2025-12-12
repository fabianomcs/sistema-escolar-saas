'use client'

import { useEffect, useState } from 'react'
import { Users, Wallet, GraduationCap, ArrowUpRight, Loader2 } from "lucide-react"
import { DashboardService } from '@/services/dashboardService'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [dados, setDados] = useState({
    alunos: 0,
    inadimplencia: '0.0',
    novasMatriculas: 0
  })

  useEffect(() => {
    async function carregar() {
      const stats = await DashboardService.obterTotais()
      setDados(stats)
      setLoading(false)
    }
    carregar()
  }, [])

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-600" /></div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Total de Alunos */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{dados.alunos}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
              <Users size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <span className="font-bold">Ativos</span>
            <span className="text-gray-400 ml-1">no sistema</span>
          </div>
        </div>

        {/* Card 2: Inadimplência */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Inadimplência Global</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{dados.inadimplencia}%</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600">
              <Wallet size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-gray-500">
            Baseado em faturas vencidas
          </div>
        </div>

        {/* Card 3: Novas Matrículas */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Novas Matrículas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">{dados.novasMatriculas}</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600">
              <GraduationCap size={24} />
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Últimos 30 dias
          </div>
        </div>

      </div>
    </div>
  )
}