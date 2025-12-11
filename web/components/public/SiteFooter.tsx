import Link from 'next/link'
import { Facebook, Instagram, Mail, Phone, MapPin, Youtube, Linkedin } from 'lucide-react'

export function SiteFooter() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* COLUNA 1: SOBRE */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center font-bold text-lg">E</div>
              <span className="font-bold text-xl">Escola<span className="text-blue-500">Fácil</span></span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Transformando vidas através da educação desde 1995. 
              Formamos cidadãos globais com valores humanos e excelência acadêmica.
            </p>
            <div className="flex gap-4 pt-2">
              <SocialIcon icon={<Instagram size={18}/>} href="#" />
              <SocialIcon icon={<Facebook size={18}/>} href="#" />
              <SocialIcon icon={<Youtube size={18}/>} href="#" />
              <SocialIcon icon={<Linkedin size={18}/>} href="#" />
            </div>
          </div>
          
          {/* COLUNA 2: LINKS RÁPIDOS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-wider border-b border-slate-800 pb-2 inline-block">Navegação</h4>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Início</Link></li>
              <li><Link href="/sobre" className="hover:text-blue-400 transition-colors">Nossa História</Link></li>
              <li><Link href="/pedagogico" className="hover:text-blue-400 transition-colors">Proposta Pedagógica</Link></li>
              <li><Link href="/contato" className="hover:text-blue-400 transition-colors">Matrículas Abertas</Link></li>
              <li><Link href="/portal" className="hover:text-blue-400 transition-colors font-semibold text-blue-400">Portal do Aluno</Link></li>
            </ul>
          </div>

          {/* COLUNA 3: CONTATO */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-wider border-b border-slate-800 pb-2 inline-block">Fale Conosco</h4>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-0.5 flex-shrink-0"/>
                <span>Rua das Flores, 123<br/>Jardim do Saber - SP</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 flex-shrink-0"/>
                <span>(11) 3333-4444</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 flex-shrink-0"/>
                <span>secretaria@escolafacil.com.br</span>
              </li>
            </ul>
          </div>

          {/* COLUNA 4: HORÁRIOS */}
          <div>
            <h4 className="text-white font-bold mb-6 uppercase text-xs tracking-wider border-b border-slate-800 pb-2 inline-block">Horário de Atendimento</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li className="flex justify-between border-b border-slate-800 pb-1">
                <span>Segunda a Sexta</span>
                <span className="text-white">07h às 18h</span>
              </li>
              <li className="flex justify-between border-b border-slate-800 pb-1 pt-1">
                <span>Sábado</span>
                <span className="text-white">08h às 12h</span>
              </li>
              <li className="flex justify-between pt-1">
                <span>Domingo</span>
                <span className="text-slate-600">Fechado</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* RODAPÉ INFERIOR */}
      <div className="bg-slate-950 py-6">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500">
          <p>&copy; {currentYear} Escola Fácil Educação. Todos os direitos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="/politica-privacidade" className="hover:text-white transition-colors">Política de Privacidade</Link>
            <Link href="/termos-uso" className="hover:text-white transition-colors">Termos de Uso</Link>
            <Link href="/login" className="hover:text-blue-500 transition-colors font-bold">Área Administrativa</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// Componente auxiliar para ícones sociais
function SocialIcon({ icon, href }: { icon: React.ReactNode, href: string }) {
  return (
    <a 
      href={href} 
      className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all transform hover:scale-110"
    >
      {icon}
    </a>
  )
}