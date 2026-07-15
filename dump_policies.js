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
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `
      SELECT n.nspname AS schema,
             c.relname AS table,
             c.relrowsecurity AS rls_enabled,
             p.polname AS policy_name,
             p.polroles AS roles,
             p.polcmd AS command,
             pg_get_expr(p.polqual, p.polrelid) AS using_expression,
             pg_get_expr(p.polwithcheck, p.polrelid) AS check_expression
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      LEFT JOIN pg_policy p ON p.polrelid = c.oid
      WHERE n.nspname = 'public' 
        AND c.relname IN ('shops', 'profiles', 'customers', 'services', 'barbers', 'appointments')
      ORDER BY c.relname, p.polname;
    `
  });
  
  if (error) {
    console.error("Error fetching policies using rpc. Try using a direct pg query if possible:", error);
  } else {
    console.log(JSON.stringify(data, null, 2));
  }
}

run();
