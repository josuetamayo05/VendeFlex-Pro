import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://TU-PROYECTO.supabase.co';
const supabaseAnonKey = 'TU-LLAVE-ANON-PUBLIC';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);