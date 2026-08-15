import { createClient } from '@supabase/supabase-js'

// Traemos las llaves secretas que guardaste en el archivo .env.local
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Creamos y exportamos la conexión para usarla en toda la página
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
