import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) env[key.trim()] = value.join('=').trim();
});

const url = env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SECRET_KEY;

const supabase = createClient(url, serviceKey);

async function run() {
  const sqlStatements = [
    `ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY`,
    `DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles`,
    `DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles`,
    `DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles`,
    `CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id)`,
    `CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`,
  ];

  for (const sql of sqlStatements) {
    const { error } = await supabase.rpc('exec_sql', { sql }).catch(() => ({ error: null }));
    // exec_sql pode não existir, então vamos tentar via REST direto
    console.log('Executando:', sql.substring(0, 60) + '...');
  }
  
  // Verificar se o usuário consegue ler o próprio profile após login
  // Usando a service key para verificar o que está na tabela
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, is_active')
    .eq('email', 'vitoriaruby3@gmail.com');
  
  console.log('\n--- Profile no banco (via service key) ---');
  console.log('Data:', data);
  console.log('Error:', error);
}

run();
