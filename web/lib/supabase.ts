import { createClient } from '@supabase/supabase-js'

// Verifica se as chaves existem para não dar erro silencioso
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Faltam as variáveis de ambiente do Supabase no arquivo .env.local')
}

// Cria a conexão oficial que usaremos no site todo
export const supabase = createClient(supabaseUrl, supabaseAnonKey)