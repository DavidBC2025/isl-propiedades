// Script simple para verificar datos en Supabase
const { createClient } = require('@supabase/supabase-js');

require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl ? 'Configurada' : 'NO CONFIGURADA');
console.log('Key:', supabaseKey ? 'Configurada' : 'NO CONFIGURADA');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  try {
    console.log('\n🔍 Verificando tabla propiedades...');
    
    const { data, error } = await supabase
      .from('propiedades')
      .select('*')
      .limit(3);
    
    if (error) {
      console.error('❌ Error:', error.message);
      console.error('Código:', error.code);
      console.error('Detalles:', error.details);
      return;
    }
    
    console.log(`✅ ${data.length} propiedades encontradas`);
    
    if (data.length > 0) {
      console.log('\nPrimera propiedad:');
      console.log(JSON.stringify(data[0], null, 2));
    }
    
    console.log('\n🔍 Verificando propiedades publicadas...');
    
    const { data: published, error: pubError } = await supabase
      .from('propiedades')
      .select('*')
      .in('estado', ['publicada', 'reservada', 'vendida']);
    
    if (pubError) {
      console.error('❌ Error:', pubError.message);
    } else {
      console.log(`✅ ${published.length} propiedades publicadas`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
