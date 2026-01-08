'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'
import { 
  FileText, Plus, Edit3, Trash2, Eye, EyeOff, ExternalLink 
} from 'lucide-react'
import { toast } from 'sonner'

export default function BlogListPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  async function carregarPosts() {
    try {
      const { data, error } = await supabase
        .from('cms_posts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setPosts(data || [])
    } catch (error) {
      console.error(error)
      toast.error('Erro ao carregar posts')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    carregarPosts()
  }, [])

  async function togglePublicado(id: string, estadoAtual: boolean) {
    const { error } = await supabase
      .from('cms_posts')
      .update({ publicado: !estadoAtual })
      .eq('id', id)
    
    if (error) {
        toast.error('Erro ao atualizar status')
    } else {
        toast.success(estadoAtual ? 'Post despublicado' : 'Post publicado!')
        carregarPosts()
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza? Essa ação é irreversível.')) return
    
    const { error } = await supabase.from('cms_posts').delete().eq('id', id)
    if (error) {
        toast.error('Erro ao excluir')
    } else {
        toast.success('Post removido')
        setPosts(prev => prev.filter(p => p.id !== id))
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20 p-6">
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="text-blue-600"/> Blog Escolar
          </h1>
          <p className="text-gray-500">Gerencie notícias, avisos e artigos do site.</p>
        </div>
        <Link href="/comunicacao/blog/novo">
          <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-bold shadow-md transition-all">
            <Plus size={20} /> Novo Post
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-gray-400">Carregando posts...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-dashed text-center">
          <p className="text-gray-500">Nenhum post encontrado.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-bold">
              <tr>
                <th className="p-4 border-b">Título</th>
                <th className="p-4 border-b">Data</th>
                <th className="p-4 border-b text-center">Status</th>
                <th className="p-4 border-b text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-gray-900">
                    {post.titulo}
                    <div className="text-xs text-gray-400 font-normal mt-0.5">/{post.slug}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {new Date(post.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                        onClick={() => togglePublicado(post.id, post.publicado)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border ${post.publicado ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}
                    >
                        {post.publicado ? 'Publicado' : 'Rascunho'}
                    </button>
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    {post.publicado && (
                        <Link href={`/blog/${post.slug}`} target="_blank" title="Ver no site">
                            <button className="p-2 text-gray-400 hover:text-blue-600"><ExternalLink size={18}/></button>
                        </Link>
                    )}
                    <button 
                        onClick={() => handleDelete(post.id)}
                        className="p-2 text-gray-400 hover:text-red-600"
                        title="Excluir"
                    >
                        <Trash2 size={18}/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}