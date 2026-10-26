import { Container } from "@/components/isl/Container";
import { getPropiedadesPublicadas } from "@/lib/propiedades";
import { getSiteSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function DiagnosticoPage() {
  const [propiedades, settings] = await Promise.all([
    getPropiedadesPublicadas(),
    getSiteSettings(),
  ]);

  return (
    <main className="min-h-screen bg-isl-offwhite py-12">
      <Container>
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl text-isl-black mb-8">Diagnóstico de Conexión Supabase</h1>
          
          <div className="space-y-6">
            {/* Estado de conexión */}
            <div className="border border-isl-black/10 bg-white p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-isl-black mb-4">Estado de Conexión</h2>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">URL Supabase: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Configurada' : 'NO CONFIGURADA'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-sm">Key Supabase: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'NO CONFIGURADA'}</span>
                </div>
              </div>
            </div>

            {/* Propiedades */}
            <div className="border border-isl-black/10 bg-white p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-isl-black mb-4">Propiedades Publicadas</h2>
              <p className="text-sm text-isl-black/70 mb-4">
                Total encontradas: <span className="font-bold text-isl-black">{propiedades.length}</span>
              </p>
              
              {propiedades.length === 0 ? (
                <div className="bg-isl-offwhite p-4 rounded-sm">
                  <p className="text-sm text-isl-black/70">No hay propiedades publicadas en la base de datos.</p>
                  <p className="text-xs text-isl-black/50 mt-2">
                    Posibles causas:
                  </p>
                  <ul className="text-xs text-isl-black/50 mt-1 list-disc list-inside">
                    <li>La tabla propiedades está vacía</li>
                    <li>No hay propiedades con estado "publicada", "reservada" o "vendida"</li>
                    <li>La migración SQL no se ha ejecutado</li>
                    <li>Las políticas RLS están bloqueando el acceso</li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  {propiedades.slice(0, 5).map((prop) => (
                    <div key={prop.id} className="border border-isl-black/5 bg-isl-offwhite p-4 rounded-sm">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-isl-black/50">ID:</span>
                          <span className="ml-2 font-mono text-xs">{prop.id}</span>
                        </div>
                        <div>
                          <span className="text-isl-black/50">Estado:</span>
                          <span className="ml-2 font-medium">{prop.estado}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-isl-black/50">Título:</span>
                          <span className="ml-2">{prop.titulo}</span>
                        </div>
                        <div>
                          <span className="text-isl-black/50">Precio UF:</span>
                          <span className="ml-2">{prop.precio_uf}</span>
                        </div>
                        <div>
                          <span className="text-isl-black/50">Comuna:</span>
                          <span className="ml-2">{prop.comuna}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-isl-black/50">Imágenes:</span>
                          <span className="ml-2">
                            {Array.isArray(prop.imagenes) ? `${prop.imagenes.length} imagen(es)` : 'No es array'}
                          </span>
                        </div>
                        <div>
                          <span className="text-isl-black/50">Agente ID:</span>
                          <span className="ml-2 font-mono text-xs">{prop.agente_id || 'Sin asignar'}</span>
                        </div>
                        <div>
                          <span className="text-isl-black/50">Agente:</span>
                          <span className="ml-2">
                            {prop.agente ? `${prop.agente.nombre} ${prop.agente.apellido || ''}` : 'No cargado'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {propiedades.length > 5 && (
                    <p className="text-xs text-isl-black/50 text-center">
                      ... y {propiedades.length - 5} propiedades más
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="border border-isl-black/10 bg-white p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-isl-black mb-4">Configuración del Sitio</h2>
              {settings ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-isl-black/50">Headline:</span>
                    <span className="ml-2">{settings.home_headline || 'No configurado'}</span>
                  </div>
                  <div>
                    <span className="text-isl-black/50">Email:</span>
                    <span className="ml-2">{settings.email_general || 'No configurado'}</span>
                  </div>
                  <div>
                    <span className="text-isl-black/50">WhatsApp:</span>
                    <span className="ml-2">{settings.whatsapp_general || 'No configurado'}</span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-isl-black/70">No se encontró configuración del sitio (tabla site_settings)</p>
              )}
            </div>

            {/* Acciones recomendadas */}
            <div className="border border-isl-gold/30 bg-isl-champagne/30 p-6 rounded-sm">
              <h2 className="font-serif text-2xl text-isl-black mb-4">Acciones Recomendadas</h2>
              <div className="space-y-3 text-sm">
                {propiedades.length === 0 && (
                  <>
                    <p className="font-medium">1. Verificar migración SQL:</p>
                    <p className="text-isl-black/70 ml-4">
                      Ejecuta el archivo <code className="bg-white px-2 py-1 rounded">supabase/migrations/0001_isl_init.sql</code> en el SQL Editor de Supabase
                    </p>
                    <p className="font-medium mt-4">2. Verificar políticas RLS:</p>
                    <p className="text-isl-black/70 ml-4">
                      Asegúrate de que la política <code className="bg-white px-2 py-1 rounded">public_read_published_propiedades</code> esté activa
                    </p>
                    <p className="font-medium mt-4">3. Agregar datos de prueba:</p>
                    <p className="text-isl-black/70 ml-4">
                      Usa el panel de administración en <code className="bg-white px-2 py-1 rounded">/admin</code> para crear una propiedad
                    </p>
                  </>
                )}
                {propiedades.length > 0 && (
                  <>
                    <p className="font-medium">✅ La conexión está funcionando correctamente</p>
                    <p className="text-isl-black/70 ml-4">
                      Las propiedades se están cargando desde Supabase. Si no ves los datos en la página principal, verifica:
                    </p>
                    <ul className="text-isl-black/70 ml-4 mt-2 list-disc list-inside">
                      <li>Que las propiedades tengan estado "publicada", "reservada" o "vendida"</li>
                      <li>Que tengan fecha_publicacion configurada</li>
                      <li>Que tengan al menos una imagen en el campo imagenes</li>
                    </ul>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}