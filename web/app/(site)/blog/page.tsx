import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { Calendar, User, ArrowRight } from 'lucide-react'

// Busca dados no servidor (Server Component)
async function getPosts() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  const { data } = await supabase
    .from('cms_posts')
    .select('*')
    .eq('publicado', true)
    .order('created_at', { ascending: false })

  return data || []
}

export default async function BlogPublicoPage() {
  const posts = await getPosts()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      
      {/* Hero */}
      <div className="bg-slate-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog da Escola</h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Acompanhe nossas notícias, eventos e conquistas dos alunos.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-6xl -mt-10">
        {posts.length === 0 ? (
           <div className="bg-white p-12 rounded-xl shadow-lg text-center">
              <p className="text-gray-500">Nenhuma publicação encontrada no momento.</p>
           </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full group">
                
                {/* Imagem de Capa */}
                <div className="aspect-video bg-gray-200 relative overflow-hidden">
                  {post.imagem_capa ? (
                    <img 
                      src={post.imagem_capa} 
                      alt={post.titulo} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
                      Sem Imagem
                    </div>
                  )}
                </div>

                {/* Conteúdo */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={12}/> {new Date(post.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {post.titulo}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
                    {post.resumo || 'Sem resumo disponível.'}
                  </p>

                  <Link href={`/blog/${post.slug}`} className="mt-auto">
                    <button className="text-blue-600 font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      Ler Notícia Completa <ArrowRight size={16}/>
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}