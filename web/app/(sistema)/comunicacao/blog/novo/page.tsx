'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Save, Image as ImageIcon, Bold, Italic, List, ListOrdered, Quote } from 'lucide-react'
import { toast } from 'sonner'

// Tiptap Imports
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

export default function NovoPostPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  
  // Estados do Form
  const [titulo, setTitulo] = useState('')
  const [slug, setSlug] = useState('')
  const [resumo, setResumo] = useState('')
  const [capaFile, setCapaFile] = useState<File | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Configuração do Editor Tiptap
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Comece a escrever aqui...</p>',
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
      },
    },
  })

  // Gerador automático de Slug
  function handleTituloChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value
    setTitulo(val)
    // Slug simples: lowercase, remove acentos, troca espaços por hifens
    const generatedSlug = val
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    setSlug(generatedSlug)
  }

  async function handleSave() {
    if (!titulo || !slug) return toast.error('Título e Slug são obrigatórios')
    setSaving(true)

    try {
      // 1. Upload da Imagem (se houver)
      let imagemUrl = null
      if (capaFile) {
        const fileExt = capaFile.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('site-assets')
          .upload(fileName, capaFile)
        
        if (uploadError) throw uploadError
        
        // Pega URL pública
        const { data: publicUrlData } = supabase.storage
          .from('site-assets')
          .getPublicUrl(fileName)
          
        imagemUrl = publicUrlData.publicUrl
      }

      // 2. Busca ID da escola
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuário desconectado')
      
      const { data: profile } = await supabase.from('users_profiles').select('escola_id').eq('id', user.id).single()
      if (!profile?.escola_id) throw new Error('Escola não encontrada')

      // 3. Salva Post
      const { error } = await supabase.from('cms_posts').insert({
        escola_id: profile.escola_id,
        titulo,
        slug,
        resumo,
        conteudo: editor?.getHTML(),
        imagem_capa: imagemUrl,
        publicado: true, // Já publica direto ou pode ser false
        autor_id: user.id
      })

      if (error) throw error

      toast.success('Post criado com sucesso!')
      router.push('/comunicacao/blog')

    } catch (error: any) {
      console.error(error)
      toast.error('Erro ao salvar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Toolbar Component
  const MenuBar = () => {
    if (!editor) return null

    const btnClass = (isActive: boolean) => 
        `p-2 rounded hover:bg-gray-100 transition-colors ${isActive ? 'bg-gray-200 text-black' : 'text-gray-500'}`

    return (
      <div className="flex items-center gap-1 border-b p-2 mb-2 sticky top-0 bg-white z-10">
        <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Negrito">
            <Bold size={18}/>
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Itálico">
            <Italic size={18}/>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-2"></div>
        <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(editor.isActive('bulletList'))} title="Lista">
            <List size={18}/>
        </button>
        <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(editor.isActive('orderedList'))} title="Lista Numerada">
            <ListOrdered size={18}/>
        </button>
        <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(editor.isActive('blockquote'))} title="Citação">
            <Quote size={18}/>
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto pb-20 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
            <Link href="/comunicacao/blog">
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                    <ArrowLeft size={24} />
                </button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Escrever Novo Post</h1>
        </div>
        <button 
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 font-bold shadow-md transition-all disabled:opacity-50"
        >
            {saving ? 'Salvando...' : <><Save size={20}/> Publicar</>}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Coluna Principal (Editor) */}
        <div className="md:col-span-2 space-y-6">
            <div className="space-y-2">
                <input 
                    type="text" 
                    placeholder="Título da Publicação"
                    className="w-full text-3xl font-bold border-none outline-none placeholder:text-gray-300"
                    value={titulo}
                    onChange={handleTituloChange}
                />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>URL:</span>
                    <input 
                        className="bg-gray-50 border border-gray-200 rounded px-2 py-0.5 text-gray-600 outline-none w-full"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                    />
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm min-h-[400px] flex flex-col">
                <MenuBar />
                <EditorContent editor={editor} className="flex-1 p-4" />
            </div>
        </div>

        {/* Sidebar de Configuração */}
        <div className="space-y-6">
            
            {/* Capa */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagem de Capa</label>
                <div className="relative aspect-video bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors cursor-pointer group overflow-hidden">
                    {capaFile ? (
                        <img src={URL.createObjectURL(capaFile)} className="absolute inset-0 w-full h-full object-cover"/>
                    ) : (
                        <>
                            <ImageIcon size={32} className="mb-2 group-hover:scale-110 transition-transform"/>
                            <span className="text-xs">Clique para upload</span>
                        </>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setCapaFile(e.target.files?.[0] || null)}
                    />
                </div>
            </div>

            {/* Resumo */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-2">Resumo</label>
                <textarea 
                    className="w-full p-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="Breve descrição que aparecerá no card do blog..."
                    value={resumo}
                    onChange={e => setResumo(e.target.value)}
                />
            </div>
        </div>

      </div>
    </div>
  )
}