'use client'
import Link from 'next/link'
import { Calendar, User } from 'lucide-react'

export default function BlogPage() {
  // Dados fictícios por enquanto
  const posts = [
    {
      id: 1,
      titulo: "Feira de Ciências 2025: Inovação e Sustentabilidade",
      resumo: "Nossos alunos apresentaram projetos incríveis focados em energia limpa e reciclagem. Confira os vencedores!",
      data: "10 Dez 2025",
      autor: "Coordenação",
      img: "https://images.unsplash.com/photo-1564069114553-1f15cd441553?w=800",
      slug: "feira-ciencias-2025"
    },
    {
      id: 2,
      titulo: "Matrículas Abertas: O que muda para o próximo ano?",
      resumo: "Saiba tudo sobre o novo material didático e as atividades extracurriculares incluídas na mensalidade.",
      data: "05 Dez 2025",
      autor: "Secretaria",
      img: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      slug: "matriculas-abertas"
    },
    {
      id: 3,
      titulo: "Dicas para ajudar seu filho na lição de casa",
      resumo: "A psicopedagoga Juliana Costa compartilha 5 estratégias para criar uma rotina de estudos saudável.",
      data: "28 Nov 2025",
      autor: "Pedagógico",
      img: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800",
      slug: "dicas-licao-casa"
    }
  ]

  return (
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Blog & Notícias</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-gray-100 group">
              <div className="h-48 overflow-hidden">
                <img src={post.img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" alt={post.titulo} />
              </div>
              <div className="p-6">
                <div className="flex gap-4 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar size={12}/> {post.data}</span>
                  <span className="flex items-center gap-1"><User size={12}/> {post.autor}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {post.titulo}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {post.resumo}
                </p>
                <Link href={`/blog/${post.slug}`} className="text-blue-600 font-bold text-sm hover:underline">
                  Ler matéria completa &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}