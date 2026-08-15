import { supabase } from '../lib/supabase'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { data: propiedades } = await supabase
    .from('propiedades')
    .select('*')

  return (
    <main className="min-h-screen p-8 bg-gray-50 text-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-4 text-blue-900">ISL Propiedades</h1>
        <p className="text-center mb-12 text-gray-600">
          Encuentra tu hogar ideal en Viña del Mar y alrededores.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {propiedades?.map((propiedad) => (
            <div key={propiedad.id} className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold">{propiedad.titulo}</h2>
                <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {propiedad.operacion}
                </span>
              </div>
              <p className="text-gray-600 mb-6">{propiedad.descripcion}</p>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <span className="text-2xl font-bold text-blue-600">
                  ${propiedad.precio?.toLocaleString('es-CL')}
                </span>
                <div className="text-sm text-gray-500 font-medium">
                  {propiedad.tipo} • {propiedad.habitaciones} Hab. • {propiedad.banos} Baños
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}