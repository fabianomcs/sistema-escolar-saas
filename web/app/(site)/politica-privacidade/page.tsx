'use client'

import { Shield, Lock, Eye, FileText } from 'lucide-react'

export default function PoliticaPrivacidadePage() {
  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-4xl mx-auto px-4 bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-gray-100">
        
        {/* Cabeçalho */}
        <div className="border-b border-gray-100 pb-8 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Política de Privacidade</h1>
          <p className="text-gray-500 text-sm">Última atualização: Dezembro de 2025</p>
        </div>

        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed space-y-6">
          
          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Shield size={20} className="text-blue-600"/> 1. Introdução
            </h2>
            <p>
              A <strong>EscolaFácil</strong> ("Nós", "Escola") compromete-se a proteger a privacidade e os dados pessoais de seus alunos, responsáveis, colaboradores e visitantes ("Usuários"). Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e compartilhamos suas informações, em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Eye size={20} className="text-blue-600"/> 2. Dados Coletados
            </h2>
            <p>Para a prestação de nossos serviços educacionais e administrativos, coletamos os seguintes tipos de dados:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Dados Cadastrais:</strong> Nome completo, CPF, RG, data de nascimento, endereço, e-mail e telefone dos responsáveis e alunos.</li>
              <li><strong>Dados Pedagógicos:</strong> Histórico escolar, notas, frequências, relatórios de desenvolvimento e ocorrências disciplinares.</li>
              <li><strong>Dados de Saúde:</strong> Tipo sanguíneo, carteira de vacinação, alergias, restrições alimentares e laudos médicos (para fins de inclusão e segurança).</li>
              <li><strong>Dados Financeiros:</strong> Histórico de pagamentos e informações para emissão de boletos e notas fiscais.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <FileText size={20} className="text-blue-600"/> 3. Finalidade do Tratamento
            </h2>
            <p>Os dados são utilizados estritamente para:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Efetivar matrículas e gerenciar a vida acadêmica do aluno.</li>
              <li>Realizar comunicações institucionais e pedagógicas com os responsáveis.</li>
              <li>Processar pagamentos e gerenciar a inadimplência (integração com gateways de pagamento).</li>
              <li>Cumprir obrigações legais junto ao Ministério da Educação (MEC) e Secretarias de Educação.</li>
              <li>Garantir a segurança física e o bem-estar dos alunos nas dependências da escola.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-3">
              <Lock size={20} className="text-blue-600"/> 4. Compartilhamento de Dados
            </h2>
            <p>Não vendemos dados pessoais. O compartilhamento ocorre apenas quando necessário:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Órgãos Públicos:</strong> Para cumprimento de obrigações legais (Censo Escolar, Receita Federal).</li>
              <li><strong>Parceiros de Pagamento:</strong> Plataformas como Asaas/Bancos para emissão de boletos e processamento financeiro.</li>
              <li><strong>Sistemas Parceiros:</strong> Plataformas de ensino ou aplicativos pedagógicos contratados pela escola, mediante contrato de confidencialidade.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Segurança da Informação</h2>
            <p>
              Adotamos medidas técnicas e administrativas robustas para proteger seus dados, incluindo criptografia, controle de acesso restrito (Row Level Security) e monitoramento de logs de atividades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Seus Direitos (LGPD)</h2>
            <p>O titular dos dados tem direito a:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li>Confirmar a existência de tratamento de dados.</li>
              <li>Acessar seus dados e corrigir informações incompletas ou desatualizadas.</li>
              <li>Solicitar a portabilidade ou a eliminação de dados desnecessários (respeitando-se os prazos legais de guarda de documentos escolares).</li>
            </ul>
            <p className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm">
              Para exercer seus direitos, entre em contato com nosso Encarregado de Dados (DPO) através do e-mail: <a href="mailto:dpo@escolafacil.com.br" className="text-blue-600 font-bold hover:underline">dpo@escolafacil.com.br</a>.
            </p>
          </section>

        </div>
      </div>
    </div>
  )
}