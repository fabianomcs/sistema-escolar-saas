import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { ArrowLeft, Calendar, Share2 } from 'lucide-react'
import { notFound } from 'next/navigation'

// Busca post pelo slug
async function getPost(slug: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data } = await supabase
    .from('cms_posts')
    .select('*')
    .eq('slug', slug)
    .single()

  return data
}

export default async function PostDetalhePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return notFound()
  }

  return (
    <div className="min-h-screen bg-white pb-20 pt-24"> {/* pt-24 para compensar header fixo */}
      
      <article className="max-w-4xl mx-auto px-4">
        
        {/* Breadcrumb */}
        <div className="mb-6">
            <Link href="/blog" className="inline-flex items-center text-gray-500 hover:text-blue-600 transition-colors">
                <ArrowLeft size={16} className="mr-2"/> Voltar para o Blog
            </Link>
        </div>

        {/* Cabeçalho do Post */}
        <header className="mb-10 text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {post.titulo}
            </h1>
            
            <div className="flex items-center justify-center gap-6 text-gray-500 text-sm">
                <span className="flex items-center gap-2">
                    <Calendar size={16}/> {new Date(post.created_at).toLocaleDateString('pt-BR', { dateStyle: 'long' })}
                </span>
            </div>
        </header>

        {/* Imagem de Capa Principal */}
        {post.imagem_capa && (
            <div className="mb-10 rounded-2xl overflow-hidden shadow-lg aspect-video relative">
                <img 
                    src={post.imagem_capa} 
                    alt={post.titulo} 
                    className="w-full h-full object-cover"
                />
            </div>
        )}

        {/* Conteúdo Rico */}
        {/* Usamos 'prose' do Tailwind Typography se instalado, ou estilos manuais */}
        <div 
            className="prose prose-lg md:prose-xl max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: post.conteudo }}
        />

        {/* Rodapé do Post */}
        <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
            <span className="text-gray-500 text-sm">Escola Fácil - Notícias</span>
            <button className="flex items-center gap-2 text-blue-600 font-bold hover:bg-blue-50 px-4 py-2 rounded-lg transition-colors">
                <Share2 size={18}/> Compartilhar
            </button>
        </div>

      </article>
    </div>
  )
}