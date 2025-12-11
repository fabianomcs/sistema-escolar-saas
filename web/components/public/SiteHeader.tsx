'use client'
import Link from 'next/link'
import { LogIn, Menu, X } from 'lucide-react'
import { useState } from 'react'

export function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  // Links do menu para facilitar manutenção
  const menuItems = [
    { label: 'Início', href: '/' },
    { label: 'A Escola', href: '/sobre' },
    { label: 'Pedagógico', href: '/pedagogico' },
    { label: 'Galeria', href: '/galeria' },
    { label: 'Blog', href: '/blog' },
    { label: 'Fale Conosco', href: '/contato' },
  ]

  return (
    <header className="fixed w-full bg-white/95 backdrop-blur-md z-50 shadow-sm border-b border-gray-100 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* 1. LOGOTIPO */}
          <Link href="/" className="flex-shrink-0 flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200 group-hover:scale-105 transition-transform">
              E
            </div>
            <span className="font-bold text-2xl text-gray-800 tracking-tight">
              Escola<span className="text-blue-600">Fácil</span>
            </span>
          </Link>

          {/* 2. MENU DESKTOP */}
          <nav className="hidden lg:flex items-center space-x-6">
            {menuItems.map((item) => (
              <Link 
                key={item.href} 
                href={item.href} 
                className="text-gray-600 hover:text-blue-600 font-medium transition-colors text-sm uppercase tracking-wide"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 3. BOTÃO DE ACESSO (Área Restrita) */}
          <div className="hidden lg:flex items-center">
            <Link href="/login">
              <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-100 hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0">
                <LogIn size={18} />
                <span>Área Restrita</span>
              </button>
            </Link>
          </div>

          {/* 4. BOTÃO MENU MOBILE */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)} 
              className="text-gray-600 hover:text-blue-600 p-2 rounded-md hover:bg-gray-50 transition-colors focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* 5. MENU MOBILE EXPANDIDO */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-xl absolute w-full max-h-[90vh] overflow-y-auto">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {menuItems.map((item) => (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setIsMenuOpen(false)}
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 border-b border-gray-50 last:border-0"
              >
                {item.label}
              </Link>
            ))}
            
            <div className="pt-4 mt-4">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors shadow-sm">
                  <LogIn size={20} />
                  Acessar Sistema
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}