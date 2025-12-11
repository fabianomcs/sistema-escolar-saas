'use client'
import { useRouter } from 'next/navigation'
import { ArrowLeft, UserCog } from 'lucide-react'

export default function UsuariosPage() {
  const router = useRouter()

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full"><ArrowLeft size={20}/></button>
        <h1 className="text-2xl font-bold text-gray-800">Usuários do Sistema</h1>
      </div>

      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center">
        <div className="bg-purple-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-purple-600">
          <UserCog size={40}/>
        </div>
        <h2 className="text-xl font-bold text-gray-800">Módulo de Permissões em Breve</h2>
        <p className="text-gray-500 mt-2 max-w-md mx-auto">
          Aqui você poderá cadastrar a Secretária e definir o que ela pode ver. No momento, o sistema opera em modo Administrador Geral.
        </p>
      </div>
    </div>
  )
}