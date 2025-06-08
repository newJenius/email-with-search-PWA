// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'SUPABASEURL';
const supabaseAnonKey = 'ANONKEY';

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // отключаем автоматическое сохранение (в iOS оно глючит)
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  
  export { supabase };
  
  // При запуске восстанавливаем сессию вручную
  const savedSession = localStorage.getItem('supabase.session');
  if (savedSession) {
    const parsed = JSON.parse(savedSession);
    supabase.auth.setSession({
      access_token: parsed.access_token,
      refresh_token: parsed.refresh_token,
    }).catch(() => {
      localStorage.removeItem('supabase.session');
    });
  }
