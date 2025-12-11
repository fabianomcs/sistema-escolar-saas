'use client'

import Link from 'next/link'
import { ArrowRight, BookOpen, Users, Trophy, Star, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      
      {/* 1. HERO SECTION (O Impacto Inicial) */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-48">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-blue-900/80 to-transparent z-10"></div>
          {/* Imagem de fundo (substitua por uma foto real da escola depois) */}
          <img 
            src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=2070&auto=format&fit=crop" 
            alt="Alunos estudando" 
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Matrículas Abertas 2026
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
              O futuro começa <span className="text-blue-400">agora.</span>
            </h1>
            
            <p className="text-lg text-slate-200 mb-8 leading-relaxed">
              Uma escola que une tradição, tecnologia e valores humanos para formar os líderes de amanhã. Venha fazer parte dessa história.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contato">
                <button className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full transition-all shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 group">
                  Agendar Visita
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20}/>
                </button>
              </Link>
              <Link href="/sobre">
                <button className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm font-bold rounded-full transition-all">
                  Conheça a Escola
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. NÚMEROS DE IMPACTO */}
      <section className="bg-blue-600 py-12 -mt-10 relative z-20">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
          <div>
            <div className="text-4xl font-bold mb-1">25+</div>
            <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">Anos de História</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">1.2k</div>
            <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">Alunos Formados</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">98%</div>
            <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">Aprovação Vestibular</div>
          </div>
          <div>
            <div className="text-4xl font-bold mb-1">4.9</div>
            <div className="text-blue-200 text-sm font-medium uppercase tracking-wider">Avaliação dos Pais</div>
          </div>
        </div>
      </section>

      {/* 3. DIFERENCIAIS */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Por que escolher a EscolaFácil?</h2>
            <p className="text-gray-600 text-lg">Nossa metodologia coloca o aluno como protagonista, desenvolvendo habilidades essenciais para o século XXI.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardDiferencial 
              icon={<BookOpen className="text-blue-600" size={32}/>}
              title="Excelência Acadêmica"
              description="Material didático atualizado e professores mestres e doutores dedicados ao ensino."
            />
            <CardDiferencial 
              icon={<Users className="text-blue-600" size={32}/>}
              title="Formação Humana"
              description="Projetos socioemocionais que desenvolvem empatia, liderança e colaboração."
            />
            <CardDiferencial 
              icon={<Trophy className="text-blue-600" size={32}/>}
              title="Esporte e Cultura"
              description="Ampla grade curricular com robótica, teatro, música e diversas modalidades esportivas."
            />
          </div>
        </div>
      </section>

      {/* 4. DEPOIMENTOS (Prova Social) */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=800&auto=format&fit=crop" 
                className="rounded-2xl shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500"
                alt="Professora e aluno"
              />
            </div>
            <div className="md:w-1/2">
              <div className="flex gap-1 text-yellow-400 mb-4">
                <Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" />
              </div>
              <blockquote className="text-2xl font-medium text-gray-800 leading-relaxed mb-6">
                "Matricular meus filhos aqui foi a melhor decisão. O acolhimento da equipe e a qualidade do ensino superaram todas as expectativas. Eles amam ir para a escola!"
              </blockquote>
              <div>
                <div className="font-bold text-gray-900">Ana Paula Souza</div>
                <div className="text-gray-500 text-sm">Mãe do Pedro (3º Ano) e Júlia (1º Ano)</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="py-24 bg-slate-900 text-center px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Pronto para transformar o futuro?</h2>
        <p className="text-slate-400 mb-10 max-w-2xl mx-auto text-lg">
          Agende uma visita guiada e conheça nossa estrutura. Vagas limitadas para o próximo ano letivo.
        </p>
        <Link href="/contato">
           <button className="px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-lg transition-all shadow-lg hover:shadow-blue-900/30">
             Quero agendar minha visita
           </button>
        </Link>
      </section>

    </div>
  )
}

function CardDiferencial({ icon, title, description }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1">
      <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  )
}