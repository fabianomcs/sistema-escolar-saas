'use client'
import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { User, Shield, Baby } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ProfileSwitcher() {
  const [roles, setRoles] = useState<string[]>([])
  const [currentRole, setCurrentRole] = useState('')
  const router = useRouter()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if(user) {
        const { data } = await supabase.from('users_profiles').select('roles').eq('id', user.id).single()
        if(data) {
          setRoles(data.roles || [])
          // Define papel atual baseado na URL (simples)
          if (window.location.pathname.includes('/portal')) setCurrentRole('responsavel')
          else if (data.roles.includes('admin')) setCurrentRole('admin')
          else setCurrentRole(data.roles[0])
        }
      }
    }
    loadProfile()
  }, [])

  if (roles.length <= 1) return null // Não mostra se só tem 1 perfil

  const switchRole = (role: string) => {
    if (role === 'responsavel') router.push('/portal/home')
    else router.push('/dashboard')
  }

  return (
    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
      {roles.includes('admin') && (
        <button 
          onClick={() => switchRole('admin')}
          className={`p-2 rounded ${!window.location.pathname.includes('/portal') ? 'bg-white shadow' : 'text-gray-500'}`}
          title="Diretoria"
        >
          <Shield size={16} />
        </button>
      )}
      {roles.includes('responsavel') && (
        <button 
          onClick={() => switchRole('responsavel')}
          className={`p-2 rounded ${window.location.pathname.includes('/portal') ? 'bg-white shadow' : 'text-gray-500'}`}
          title="Área dos Pais"
        >
          <Baby size={16} />
        </button>
      )}
    </div>
  )
}