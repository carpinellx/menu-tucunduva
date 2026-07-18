import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseAnonKey) {
  // eslint-disable-next-line no-console
  console.error(
    'Configuração do Supabase ausente. Copie ".env.example" para ".env" e preencha ' +
      'VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY com os dados do seu projeto.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '');

export const MENU_PHOTOS_BUCKET = 'menu-photos';
