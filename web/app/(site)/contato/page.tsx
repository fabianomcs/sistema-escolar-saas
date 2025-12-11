'use client'

import { Mail, MapPin, Phone, MessageCircle, Clock, Send } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

export default function ContatoPage() {
  const [loading, setLoading] = useState(false)

  // Simulação de envio
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.')
      // Aqui você poderia resetar o form
    }, 1500)
  }

  return (
    <div className="bg-slate-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4">
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Estamos prontos para te atender</h1>
          <p className="text-gray-600 text-lg">Escolha o canal de sua preferência. Nossa secretaria responde rapidinho!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* CARDS DE CONTATO RÁPIDO */}
          <div className="space-y-6 lg:col-span-1">
            <CardContato 
              icon={<Phone size={24}/>}
              titulo="Central Telefônica"
              info="(11) 3333-4444"
              desc="Atendimento das 7h às 18h"
              cor="blue"
            />
            <CardContato 
              icon={<MessageCircle size={24}/>}
              titulo="WhatsApp da Secretaria"
              info="(11) 99999-8888"
              desc="Para dúvidas rápidas e agendamentos"
              cor="green"
              link="https://wa.me/5511999998888"
            />
            <CardContato 
              icon={<Mail size={24}/>}
              titulo="E-mail"
              info="secretaria@escolafacil.com.br"
              desc="Respondemos em até 24h úteis"
              cor="purple"
            />
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mt-8">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Clock size={20} className="text-gray-400"/> Horário de Visitas
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Manhã:</span> <span className="font-medium">08h às 11h</span></li>
                <li className="flex justify-between"><span>Tarde:</span> <span className="font-medium">13h30 às 16h30</span></li>
                <li className="text-xs text-gray-400 pt-2 border-t mt-2">É necessário agendar previamente.</li>
              </ul>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Nome Completo</label>
                    <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Ex: Maria Silva" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Telefone / WhatsApp</label>
                    <input required type="text" className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="(00) 00000-0000" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Assunto</label>
                  <select className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all">
                    <option>Quero Matricular (Novos Alunos)</option>
                    <option>Financeiro / Boletos</option>
                    <option>Pedagógico / Coordenação</option>
                    <option>Trabalhe Conosco</option>
                    <option>Outros</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mensagem</label>
                  <textarea required rows={5} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Como podemos ajudar?"></textarea>
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? 'Enviando...' : <><Send size={20}/> Enviar Mensagem Agora</>}
                </button>
              </form>
            </div>
            
            {/* Mapa Ilustrativo (Rodapé do form) */}
            <div className="bg-slate-100 p-4 text-center text-sm text-gray-500 border-t border-gray-200">
              <MapPin size={16} className="inline mr-1"/> Rua das Flores, 123 - São Paulo/SP (Próximo ao Metrô)
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function CardContato({ icon, titulo, info, desc, cor, link }: any) {
  const colors: any = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  }
  
  const content = (
    <div className={`p-6 rounded-2xl border transition-transform hover:-translate-y-1 cursor-default ${colors[cor]}`}>
      <div className="flex items-start gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
        <div>
          <h3 className="font-bold text-gray-900">{titulo}</h3>
          <p className="text-lg font-bold my-1">{info}</p>
          <p className="text-xs opacity-70">{desc}</p>
        </div>
      </div>
    </div>
  )

  if (link) return <a href={link} target="_blank" className="block">{content}</a>
  return content
}