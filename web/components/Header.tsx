'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Header() {
  const [escola, setEscola] = useState<any>(null)

  useEffect(() => {
    async function carregar() {
      const { data } = await supabase.from('escolas').select('*').limit(1).single()
      setEscola(data)
    }
    carregar()
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10 shadow-sm ml-64">
      <h2 className="text-gray-700 font-semibold text-lg">Visão Geral</h2>
      
      <div className="flex items-center gap-4">
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-gray-800">Diretoria</p>
          {/* NOME DA ESCOLA DINÂMICO */}
          <p className="text-xs text-gray-500">
            {escola?.nome_fantasia || 'Minha Escola'}
          </p>
        </div>
        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border border-blue-200">
          {escola?.nome_fantasia ? escola.nome_fantasia[0] : 'E'}
        </div>
      </div>
    </header>
  )
}