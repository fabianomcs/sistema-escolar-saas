'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Camera, Loader2, User } from 'lucide-react'

interface Props {
  urlAtual?: string | null
  tamanho?: number // Tamanho em pixels (ex: 128)
  onUpload: (novaUrl: string) => void // Função que avisa o pai que a foto mudou
}

export default function AvatarUpload({ urlAtual, tamanho = 128, onUpload }: Props) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(urlAtual || null)

  useEffect(() => {
    setPreview(urlAtual || null)
  }, [urlAtual])

  async function uploadImagem(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true)

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para upload.')
      }

      const file = event.target.files[0]
      // Cria um nome único: data-atual + nome-sem-espaços
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // 1. Envia para o Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('fotos-escola')
        .upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // 2. Pega a URL Pública
      const { data } = supabase.storage.from('fotos-escola').getPublicUrl(filePath)
      
      // 3. Atualiza o estado e avisa o pai
      setPreview(data.publicUrl)
      onUpload(data.publicUrl)

    } catch (error: any) {
      alert('Erro no upload: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div 
        className="relative rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100 group cursor-pointer"
        style={{ width: tamanho, height: tamanho }}
      >
        {/* Se tiver foto, mostra. Se não, mostra ícone de usuário */}
        {preview ? (
          <img 
            src={preview} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <User size={tamanho * 0.5} />
          </div>
        )}

        {/* Overlay de Upload (aparece ao passar o mouse ou carregando) */}
        <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
          {uploading ? (
            <Loader2 className="text-white animate-spin" size={24} />
          ) : (
            <Camera className="text-white" size={24} />
          )}
          <input 
            type="file" 
            accept="image/*" 
            onChange={uploadImagem}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>
      <span className="text-xs text-gray-500">Clique para alterar</span>
    </div>
  )
}