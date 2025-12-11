'use client'

import { Scale, AlertCircle, CheckCircle } from 'lucide-react'

export default function TermosUsoPage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        
        <div className="border-b border-gray-100 pb-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Termos de Uso</h1>
          <p className="text-gray-500 text-sm">Última atualização: Dezembro de 2025</p>
        </div>

        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Scale size={20} className="text-blue-600"/> 1. Aceitação dos Termos
            </h2>
            <p>
              Ao acessar o portal e os sistemas da <strong>EscolaFácil</strong>, você concorda expressamente com estes Termos de Uso. Caso não concorde com qualquer disposição, você não deve utilizar nossos serviços digitais.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Descrição do Serviço</h2>
            <p>
              A EscolaFácil disponibiliza um ambiente digital ("Portal do Aluno" e "Portal Institucional") para facilitar a comunicação, o acompanhamento pedagógico e a gestão financeira entre a Escola e os Responsáveis/Alunos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <CheckCircle size={20} className="text-blue-600"/> 3. Responsabilidades do Usuário
            </h2>
            <p>O usuário compromete-se a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Fornecer informações verdadeiras, exatas, atuais e completas durante o cadastro e matrícula.</li>
              <li>Manter o sigilo de suas credenciais de acesso (login e senha), sendo o único responsável por qualquer ação realizada em sua conta.</li>
              <li>Não utilizar o sistema para fins ilegais, difamatórios ou que violem direitos de terceiros.</li>
              <li>Comunicar imediatamente a Escola em caso de suspeita de uso indevido de sua conta.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Propriedade Intelectual</h2>
            <p>
              Todo o conteúdo disponibilizado (textos, logotipos, imagens, vídeos, material didático e software) é de propriedade exclusiva da EscolaFácil ou de seus licenciadores, sendo protegido pelas leis de direitos autorais. É proibida a reprodução parcial ou total sem autorização expressa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <AlertCircle size={20} className="text-blue-600"/> 5. Limitação de Responsabilidade
            </h2>
            <p>
              A Escola empenha-se para manter o sistema disponível 24/7, mas não se responsabiliza por interrupções temporárias decorrentes de manutenção, falhas na internet, ataques cibernéticos ou força maior.
            </p>
            <p className="mt-2">
              A Escola também não se responsabiliza por links externos que possam constar no portal, cabendo ao usuário verificar a segurança dos mesmos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Disposições Gerais</h2>
            <p>
              A EscolaFácil reserva-se o direito de alterar estes Termos a qualquer momento, publicando a versão atualizada no portal. A continuidade do uso do sistema implica na aceitação das novas regras.
            </p>
            <p className="mt-4">
              Fica eleito o foro da comarca de localidade da Escola para dirimir quaisquer dúvidas oriundas deste termo.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}