// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shslwdxurecahtcejxpy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc2x3ZHh1cmVjYWh0Y2VqeHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUwMzAsImV4cCI6MjA2MDEzMTAzMH0.dUl1D_OQ3UZZGvcyo915c9YTxz6r28npoJFuD1r2Ztc';

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