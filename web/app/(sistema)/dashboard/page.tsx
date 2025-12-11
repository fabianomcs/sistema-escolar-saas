'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card" // (Se tiver shadcn, senão use div normal)
import { Users, Wallet, GraduationCap, ArrowUpRight } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel Geral</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Simples de Exemplo */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total de Alunos</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">1,234</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Users size={24} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <ArrowUpRight size={16} className="mr-1" />
            <span className="font-bold">+12%</span>
            <span className="text-gray-400 ml-1">vs mês passado</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Inadimplência</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">4.2%</h3>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-red-600"><Wallet size={24} /></div>
          </div>
          <div className="mt-4 flex items-center text-sm text-red-600">
            <span className="font-bold">Atenção</span>
            <span className="text-gray-400 ml-1">acima da meta (3%)</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Novas Matrículas</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-2">45</h3>
            </div>
            <div className="p-3 bg-green-50 rounded-lg text-green-600"><GraduationCap size={24} /></div>
          </div>
          <div className="mt-4 text-sm text-gray-400">
            Ciclo 2026 aberto
          </div>
        </div>
      </div>
    </div>
  )
}