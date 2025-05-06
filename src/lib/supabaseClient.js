// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://shslwdxurecahtcejxpy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNoc2x3ZHh1cmVjYWh0Y2VqeHB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1NTUwMzAsImV4cCI6MjA2MDEzMTAzMH0.dUl1D_OQ3UZZGvcyo915c9YTxz6r28npoJFuD1r2Ztc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
