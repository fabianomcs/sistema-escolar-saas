import Link from 'next/link'
import { Calendar, FileText, ArrowRight, Megaphone } from 'lucide-react'

export default function ComunicacaoDashboardPage() {
  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Megaphone className="text-blue-600" size={32}/>
            Central de Comunicação
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Gerencie o conteúdo do site institucional e mantenha a comunidade informada.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CARD 1: CALENDÁRIO */}
        <Link href="/comunicacao/calendario" className="group">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer h-full flex flex-col">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <Calendar size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-700">
              Calendário Acadêmico
            </h2>
            <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
              Gerencie datas importantes, feriados, provas e reuniões. Permite cadastro manual ou importação via Excel.
            </p>
            
            <div className="flex items-center font-bold text-blue-600 group-hover:gap-2 transition-all">
              Acessar Calendário <ArrowRight size={20} className="ml-2"/>
            </div>
          </div>
        </Link>

        {/* CARD 2: BLOG */}
        <Link href="/comunicacao/blog" className="group">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl hover:border-green-200 transition-all cursor-pointer h-full flex flex-col">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
              <FileText size={32} />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-700">
              Blog Escolar
            </h2>
            <p className="text-gray-500 mb-8 flex-1 leading-relaxed">
              Publique notícias, avisos, fotos de eventos e artigos pedagógicos para engajar pais e alunos no site.
            </p>
            
            <div className="flex items-center font-bold text-green-600 group-hover:gap-2 transition-all">
              Gerenciar Posts <ArrowRight size={20} className="ml-2"/>
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}