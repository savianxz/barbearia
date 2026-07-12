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
const key = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY || env.SUPABASE_SECRET_KEY;

const supabase = createClient(url, key);

async function run() {
  const email = 'vitoriaruby3@gmail.com';
  
  // 1. Achar o profile pelo email
  const { data: profiles, error: getError } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email);

  if (getError) {
    console.error('Error fetching profile:', getError);
    return;
  }

  console.log('Profiles found:', profiles);

  if (profiles && profiles.length > 0) {
    // 2. Atualizar a role para owner
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'owner' })
      .eq('email', email)
      .select();

    if (updateError) {
      console.error('Error updating profile:', updateError);
    } else {
      console.log('Profile updated successfully:', updateData);
    }
  } else {
    console.log('Nenhum profile encontrado com esse email. Vamos listar os usuários existentes no banco:');
    const { data: allProfiles } = await supabase.from('profiles').select('id, email, role');
    console.log(allProfiles);
  }
}

run();
