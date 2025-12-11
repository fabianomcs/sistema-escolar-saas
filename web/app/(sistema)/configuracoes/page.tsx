'use client'
import Link from 'next/link'
import { Building2, DollarSign, Users, ShieldCheck, Bell, FileText } from 'lucide-react'

export default function ConfiguracoesPage() {
  
  const menuItens = [
    {
      titulo: 'Dados da Escola',
      descricao: 'Logo, CNPJ, Endereço e Contatos.',
      icone: <Building2 size={32} className="text-blue-600"/>,
      link: '/configuracoes/escola',
      cor: 'bg-blue-50 border-blue-100'
    },
    {
      titulo: 'Tabela de Preços',
      descricao: 'Valores de matrículas e mensalidades por ano.',
      icone: <DollarSign size={32} className="text-green-600"/>,
      link: '/configuracoes/valores', // Link para a tela que criamos antes
      cor: 'bg-green-50 border-green-100'
    },
    {
      titulo: 'Usuários do Sistema',
      descricao: 'Gerencie quem tem acesso administrativo.',
      icone: <Users size={32} className="text-purple-600"/>,
      link: '/configuracoes/usuarios',
      cor: 'bg-purple-50 border-purple-100'
    },
    {
      titulo: 'Parâmetros Financeiros',
      descricao: 'Juros, Multas e Datas de Vencimento.',
      icone: <FileText size={32} className="text-orange-600"/>,
      link: '/configuracoes/parametros',
      cor: 'bg-orange-50 border-orange-100'
    },
    {
      titulo: 'Logs de Auditoria',
      descricao: 'Veja quem fez o quê e quando.',
      icone: <ShieldCheck size={32} className="text-gray-600"/>,
      link: '/configuracoes/logs',
      cor: 'bg-gray-50 border-gray-200'
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
        <p className="text-gray-500">Gerencie os parâmetros globais da instituição.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItens.map((item, idx) => (
          <Link key={idx} href={item.link}>
            <div className={`p-6 rounded-xl border hover:shadow-md transition-all cursor-pointer h-full flex flex-col gap-4 ${item.cor} border-opacity-50 hover:border-opacity-100`}>
              <div className="bg-white w-14 h-14 rounded-full flex items-center justify-center shadow-sm">
                {item.icone}
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg">{item.titulo}</h3>
                <p className="text-sm text-gray-600 mt-1">{item.descricao}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}