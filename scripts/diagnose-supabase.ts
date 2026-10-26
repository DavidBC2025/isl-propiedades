// Script de diagnóstico para verificar conexión con Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno de Supabase no configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnose() {
  console.log('🔍 Diagnosticando conexión con Supabase...\n');

  try {
    // 1. Verificar conexión básica
    console.log('1. Verificando conexión básica...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.log('   ✅ Conexión funcionando (auth error es esperado sin sesión)');
    } else {
      console.log('   ✅ Conexión funcionando correctamente');
    }

    // 2. Verificar tabla propiedades
    console.log('\n2. Verificando tabla propiedades...');
    const { data: allProperties, error: allError } = await supabase
      .from('propiedades')
      .select('*')
      .limit(5);

    if (allError) {
      console.error('   ❌ Error al consultar propiedades:', allError.message);
      return;
    }

    console.log(`   ✅ Encontradas ${allProperties.length} propiedades (primeras 5)`);

    if (allProperties.length === 0) {
      console.log('   ⚠️  No hay propiedades en la tabla');
      return;
    }

    // 3. Analizar estructura de datos
    console.log('\n3. Analizando estructura de datos de la primera propiedad:');
    const firstProp = allProperties[0];
    console.log('   Campos:', Object.keys(firstProp).join(', '));
    console.log('   Estado:', firstProp.estado);
    console.log('   ¿Tiene imagenes?', Array.isArray(firstProp.imagenes));
    console.log('   ¿Tiene fecha_publicacion?', !!firstProp.fecha_publicacion);
    console.log('   ¿Tiene agente_id?', !!firstProp.agente_id);

    // 4. Verificar propiedades publicadas
    console.log('\n4. Verificando propiedades publicadas...');
    const { data: publishedProps, error: publishedError } = await supabase
      .from('propiedades')
      .select('*')
      .in('estado', ['publicada', 'reservada', 'vendida']);

    if (publishedError) {
      console.error('   ❌ Error al consultar propiedades publicadas:', publishedError.message);
    } else {
      console.log(`   ✅ ${publishedProps.length} propiedades publicadas/reservadas/vendidas`);
      
      if (publishedProps.length > 0) {
        console.log('\n   Primera propiedad publicada:');
        const firstPublished = publishedProps[0];
        console.log('   - ID:', firstPublished.id);
        console.log('   - Título:', firstPublished.titulo);
        console.log('   - Estado:', firstPublished.estado);
        console.log('   - Precio UF:', firstPublished.precio_uf);
        console.log('   - Comuna:', firstPublished.comuna);
        console.log('   - ¿Tiene imagenes?', Array.isArray(firstPublished.imagenes) && firstPublished.imagenes.length > 0);
        console.log('   - Imágenes:', JSON.stringify(firstPublished.imagenes, null, 2));
      }
    }

    // 5. Verificar si hay agentes
    console.log('\n5. Verificando agentes...');
    const { data: agents, error: agentsError } = await supabase
      .from('agentes')
      .select('*')
      .limit(3);

    if (agentsError) {
      console.error('   ❌ Error al consultar agentes:', agentsError.message);
    } else {
      console.log(`   ✅ ${agents.length} agentes encontrados`);
    }

    // 6. Verificar join con agentes
    console.log('\n6. Verificando join propiedades con agentes...');
    const { data: propsWithAgents, error: joinError } = await supabase
      .from('propiedades')
      .select('*, agente:agentes(*)')
      .in('estado', ['publicada', 'reservada', 'vendida'])
      .limit(3);

    if (joinError) {
      console.error('   ❌ Error en join:', joinError.message);
    } else {
      console.log(`   ✅ ${propsWithAgents.length} propiedades con agentes`);
      if (propsWithAgents.length > 0) {
        console.log('   Primera propiedad con agente:', {
          titulo: propsWithAgents[0].titulo,
          agente: propsWithAgents[0].agente
        });
      }
    }

    console.log('\n✅ Diagnóstico completado exitosamente');

  } catch (error) {
    console.error('❌ Error durante diagnóstico:', error);
    process.exit(1);
  }
}

diagnose();
