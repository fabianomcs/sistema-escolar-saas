'use client'

import { Target, Heart, Lightbulb, Award, Users, Clock } from 'lucide-react'

export default function SobrePage() {
  return (
    <div className="bg-white">
      
      {/* CABEÇALHO DA PÁGINA */}
      <section className="bg-slate-50 py-20 border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Nossa História</h1>
          <p className="text-xl text-gray-600 leading-relaxed">
            Há mais de 25 anos, a EscolaFácil nasceu de um sonho: criar um espaço onde a educação vai além dos livros, formando seres humanos íntegros, criativos e felizes.
          </p>
        </div>
      </section>

      {/* LINHA DO TEMPO / HISTÓRIA */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 relative">
            <div className="absolute -inset-4 bg-blue-600/10 rounded-2xl transform -rotate-3"></div>
            <img 
              src="https://images.unsplash.com/photo-1544531696-9342e508c650?w=800&auto=format&fit=crop" 
              alt="Fundação da Escola" 
              className="relative rounded-2xl shadow-xl w-full h-[400px] object-cover"
            />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 font-bold text-sm rounded-full">Desde 1995</div>
            <h2 className="text-3xl font-bold text-gray-900">Como tudo começou</h2>
            <p className="text-gray-600 leading-relaxed text-lg">
              Começamos em uma pequena casa adaptada no bairro Jardim das Flores, com apenas 3 salas de aula e 45 alunos. A fundadora, Professora Helena, acreditava que cada aluno deveria ser chamado pelo nome e ter seus talentos individuais reconhecidos.
            </p>
            <p className="text-gray-600 leading-relaxed text-lg">
              Hoje, ocupamos uma área de 5.000m², mas a essência permanece a mesma: o <strong>acolhimento</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* MISSÃO, VISÃO E VALORES */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardValor 
              icon={<Target className="text-blue-400" size={40}/>}
              titulo="Missão"
              texto="Proporcionar uma educação de excelência que desperte a curiosidade, o pensamento crítico e a responsabilidade social."
            />
            <CardValor 
              icon={<Lightbulb className="text-yellow-400" size={40}/>}
              titulo="Visão"
              texto="Ser referência nacional em inovação pedagógica, formando líderes capazes de transformar suas realidades."
            />
            <CardValor 
              icon={<Heart className="text-red-400" size={40}/>}
              titulo="Valores"
              texto="Respeito às diferenças, ética, solidariedade, transparência e amor pelo conhecimento."
            />
          </div>
        </div>
      </section>

      {/* EQUIPE */}
      <section className="py-20 max-w-7xl mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-12">Quem faz a EscolaFácil</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <CardEquipe nome="Helena Smith" cargo="Diretora Pedagógica" foto="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop" />
          <CardEquipe nome="Roberto Alves" cargo="Coord. Ensino Médio" foto="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop" />
          <CardEquipe nome="Juliana Costa" cargo="Psicóloga Escolar" foto="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop" />
          <CardEquipe nome="Marcos Silva" cargo="Coord. de Esportes" foto="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&auto=format&fit=crop" />
        </div>
      </section>

    </div>
  )
}

function CardValor({ icon, titulo, texto }: any) {
  return (
    <div className="bg-slate-800 p-8 rounded-2xl border border-slate-700 hover:bg-slate-750 transition-colors">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-4">{titulo}</h3>
      <p className="text-slate-400 leading-relaxed">{texto}</p>
    </div>
  )
}

function CardEquipe({ nome, cargo, foto }: any) {
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-2xl mb-4 aspect-[3/4]">
        <img src={foto} alt={nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
          <p className="text-white text-sm font-medium">"Educar é um ato de amor."</p>
        </div>
      </div>
      <h3 className="text-lg font-bold text-gray-900">{nome}</h3>
      <p className="text-blue-600 text-sm font-medium">{cargo}</p>
    </div>
  )
}