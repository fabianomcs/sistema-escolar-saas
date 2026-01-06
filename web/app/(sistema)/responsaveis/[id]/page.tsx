'use client'

// 1. Imports
import { useEffect, useState, use } from 'react' // 'use' requer Next.js 15/React 19
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, Phone, Mail, MapPin, 
  ShieldCheck, GraduationCap, ChevronRight, User 
} from 'lucide-react'
import { toast } from 'sonner'
import { Responsavel, Aluno } from '@/types/app.types'

// Componente visual para Avatar
function ParentAvatar({ name }: { name: string }) {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : 'RP'
  return (
    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shadow-sm">
      {initials}
    </div>
  )
}

// 2. Tipar params como Promise (Padrão Next.js 15+)
export default function DetalhesResponsavelPage({ params }: { params: Promise<{ id: string }> }) {
  // 3. Desembrulhar params com o hook use()
  const { id } = use(params)

  const router = useRouter()
  const [responsavel, setResponsavel] = useState<(Responsavel & { alunos: Aluno[] }) | null>(null)
  const [loading, setLoading] = useState(true)

  // 4. CORREÇÃO CRÍTICA: Instanciar o Supabase apenas uma vez usando useState
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  )

  useEffect(() => {
    // Função movida para dentro do useEffect para evitar dependências cíclicas
    async function carregarResponsavel() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('responsaveis')
          .select(`
            *,
            alunos (*)
          `)
          .eq('id', id)
          .single()

        if (error) {
          console.error('Erro ao buscar responsável:', error)
          toast.error('Responsável não encontrado')
          // Opcional: Redirecionar se não encontrar
          // router.push('/responsaveis')
        } else {
          setResponsavel(data as any)
        }
      } catch (err) {
        console.error('Erro crítico:', err)
        toast.error('Erro ao carregar dados')
      } finally {
        setLoading(false)
      }
    }

    carregarResponsavel()
  }, [id, supabase]) // Dependências corretas

  if (loading) return (
    <div className="max-w-5xl mx-auto p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
        <div className="h-64 bg-gray-100 rounded-xl"></div>
    </div>
  )
  
  if (!responsavel) return (
    <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-gray-800">Responsável não encontrado</h2>
        <Link href="/responsaveis">
            <button className="mt-4 text-blue-600 hover:underline">Voltar para lista</button>
        </Link>
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex items-center gap-4">
        <Link href="/responsaveis">
          <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <ArrowLeft size={24} />
          </button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{responsavel.nome_completo}</h1>
          <p className="text-gray-500 flex items-center gap-2 text-sm">
            <ShieldCheck size={16} className="text-blue-600"/>
            CPF: {responsavel.cpf || 'Não informado'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* COLUNA ESQUERDA: DADOS */}
        <div className="md:col-span-2 space-y-6">
          
          {/* CARD PRINCIPAL */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start gap-6">
            <ParentAvatar name={responsavel.nome_completo} />
            <div className="space-y-4 flex-1 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="flex items-start gap-3">
                  <Phone size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Celular / WhatsApp</p>
                    <p className="text-gray-900 font-medium">{responsavel.telefone_celular || '---'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">E-mail</p>
                    <p className="text-gray-900 font-medium break-all">{responsavel.email || '---'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 sm:col-span-2">
                  <MapPin size={18} className="text-gray-400 mt-1"/>
                  <div>
                    <p className="text-xs text-gray-500 uppercase font-bold">Endereço</p>
                    <p className="text-gray-900 font-medium">
                      {responsavel.endereco_logradouro 
                        ? `${responsavel.endereco_logradouro}, ${responsavel.endereco_numero} - ${responsavel.endereco_bairro}`
                        : 'Endereço não cadastrado'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {responsavel.endereco_cidade}/{responsavel.endereco_estado} - CEP: {responsavel.endereco_cep}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* LISTA DE FILHOS (ALUNOS VINCULADOS) */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              <GraduationCap className="text-blue-600" size={20}/>
              Filhos Matriculados ({responsavel.alunos?.length || 0})
            </h3>
            
            {!responsavel.alunos || responsavel.alunos.length === 0 ? (
              <div className="p-6 bg-gray-50 rounded-xl border border-gray-100 text-center text-gray-500 text-sm">
                Nenhum aluno vinculado a este responsável financeiro.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {responsavel.alunos.map(filho => (
                  <Link href={`/alunos/${filho.id}`} key={filho.id}>
                    <div className="group bg-white p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {filho.nome_completo ? filho.nome_completo.substring(0,2).toUpperCase() : 'AL'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-blue-700">{filho.nome_completo}</p>
                          <p className="text-xs text-gray-500">
                             Nasc: {filho.data_nascimento 
                               ? new Date(filho.data_nascimento).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) 
                               : '--/--/----'}
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500"/>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* COLUNA DIREITA: FINANCEIRO */}
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <h3 className="font-bold text-blue-900 mb-2">Histórico Financeiro</h3>
            <p className="text-sm text-blue-700 mb-4">
              Verifique pagamentos e pendências vinculadas a este CPF.
            </p>
            
            <Link href="/financeiro">
              <button className="w-full py-2 bg-white text-blue-600 text-sm font-bold rounded border border-blue-200 hover:bg-blue-50 transition-colors shadow-sm">
                Ver Extrato Financeiro
              </button>
            </Link>
          </div>
          
          <div className="p-4 rounded-xl border border-yellow-200 bg-yellow-50 text-yellow-800 text-sm">
            <p className="font-bold flex items-center gap-2 mb-1">
              <User size={16}/> Observação
            </p>
            <p className="opacity-90">
              Ao alterar os dados deste responsável, os contratos de todos os alunos vinculados serão atualizados automaticamente.
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}