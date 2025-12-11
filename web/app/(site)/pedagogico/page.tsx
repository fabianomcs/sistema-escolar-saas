'use client'

import { Brain, HeartHandshake, Puzzle, Users, Lightbulb, Sparkles, Award } from 'lucide-react'

export default function PedagogicoPage() {
  return (
    <div className="bg-white">
      
      {/* HEADER HERO */}
      <section className="bg-blue-600 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-100 text-sm font-bold mb-4">
            Metodologia Exclusiva
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Educar para Transformar</h1>
          <p className="text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto">
            Nossa proposta sócio-construtivista coloca o aluno como protagonista, respeitando seu tempo, suas habilidades e sua forma única de ver o mundo.
          </p>
        </div>
      </section>

      {/* SÓCIO-CONSTRUTIVISMO */}
      <section className="py-20 max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2022&auto=format&fit=crop" 
              alt="Crianças aprendendo juntas" 
              className="rounded-2xl shadow-lg w-full h-[500px] object-cover"
            />
          </div>
          <div className="md:w-1/2 space-y-6">
            <h2 className="text-3xl font-bold text-gray-900">O Aluno Protagonista</h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              Acreditamos que o conhecimento não é apenas transmitido, mas <strong>construído</strong> através da interação. Em nossa abordagem sócio-construtivista, a sala de aula é um espaço de troca, onde o professor atua como mediador e o aluno explora, questiona e descobre.
            </p>
            <ul className="space-y-4 pt-4">
              <FeatureItem icon={<Users className="text-blue-600"/>} text="Aprendizagem colaborativa e projetos em grupo." />
              <FeatureItem icon={<Lightbulb className="text-yellow-500"/>} text="Estímulo ao pensamento crítico e criativo." />
              <FeatureItem icon={<Sparkles className="text-purple-500"/>} text="Valorização dos conhecimentos prévios do aluno." />
            </ul>
          </div>
        </div>
      </section>

      {/* INCLUSÃO E DIVERSIDADE (Destaque) */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Referência em Inclusão</h2>
            <p className="text-gray-600 text-lg">
              Somos pioneiros no acolhimento e desenvolvimento de crianças neuroatípicas. Aqui, a inclusão não é apenas uma palavra, é a nossa prática diária.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CardInclusao 
              icon={<Puzzle size={40} className="text-blue-500"/>}
              titulo="TEA (Autismo)"
              desc="Ambientes sensorialmente adaptados e PEI (Plano de Ensino Individualizado) construído com a família e terapeutas."
            />
            <CardInclusao 
              icon={<Brain size={40} className="text-purple-500"/>}
              titulo="TDAH & Neurodiversidade"
              desc="Estratégias pedagógicas dinâmicas que canalizam a energia e o hiperfoco para o aprendizado significativo."
            />
            <CardInclusao 
              icon={<Award size={40} className="text-yellow-500"/>}
              titulo="Altas Habilidades"
              desc="Programas de enriquecimento curricular que desafiam e estimulam o potencial máximo de cada talento."
            />
          </div>
          
          <div className="mt-12 bg-white p-8 rounded-2xl border border-blue-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
            <div className="p-4 bg-blue-50 rounded-full text-blue-600">
              <HeartHandshake size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Equipe Multidisciplinar</h3>
              <p className="text-gray-600 mt-2">
                Contamos com psicopedagogos, fonoaudiólogos parceiros e monitores especializados em sala para garantir que <strong>nenhum aluno fique para trás</strong>.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}

function FeatureItem({ icon, text }: any) {
  return (
    <li className="flex items-center gap-3 text-gray-700 font-medium">
      <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">{icon}</div>
      {text}
    </li>
  )
}

function CardInclusao({ icon, titulo, desc }: any) {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{titulo}</h3>
      <p className="text-gray-600 leading-relaxed">{desc}</p>
    </div>
  )
}