import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envFile = fs.readFileSync('.env', 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim();
  }
});

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const serviceKey = env.SUPABASE_SECRET_KEY;

if (!serviceKey) {
  console.error('No service key found');
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function run() {
  const email = 'vitoriaruby3@gmail.com';
  
  // Buscar no auth.users
  const { data: usersData, error: authError } = await supabase.auth.admin.listUsers();
  
  if (authError) {
    console.error('Error fetching auth users:', authError);
    return;
  }
  
  const user = usersData.users.find(u => u.email === email);
  if (!user) {
    console.log('Usuário não encontrado no auth.users');
    return;
  }
  
  console.log('Auth user found:', user.id);
  
  // Atualizar metadata para owner
  const { error: updateAuthError } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: { ...user.user_metadata, role: 'owner' }
  });
  if (updateAuthError) console.error('Erro ao atualizar auth metadata:', updateAuthError);
  
  // Inserir profile como owner
  const { error: insertError } = await supabase.from('profiles').upsert({
    id: user.id,
    email: user.email,
    full_name: user.user_metadata?.name || user.user_metadata?.full_name || 'Vitoria',
    role: 'owner',
    is_active: true
  });
  
  if (insertError) {
    console.error('Error inserting profile:', insertError);
  } else {
    console.log('Profile inserido com sucesso para', email, 'como owner!');
  }
}

run();
