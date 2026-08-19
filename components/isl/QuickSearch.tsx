import { ButtonISL } from "@/components/isl/ButtonISL";
import { COMUNAS_BUSQUEDA } from "@/lib/site";

const fieldClass = "min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 text-base text-isl-black";

export function QuickSearch() {
  return (
    <form method="get" action="/propiedades" className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <label className="space-y-1 lg:col-span-2">
        <span className="text-sm text-isl-black">Comuna</span>
        <select name="comuna" className={fieldClass} defaultValue="">
          <option value="">Todas</option>
          {COMUNAS_BUSQUEDA.map((comuna) => (
            <option key={comuna} value={comuna}>{comuna}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">Operación</span>
        <select name="operacion" className={fieldClass} defaultValue="">
          <option value="">Todas</option>
          <option value="venta">Venta</option>
          <option value="arriendo">Arriendo</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">Tipo</span>
        <select name="tipo" className={fieldClass} defaultValue="">
          <option value="">Todos</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="parcela">Parcela</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">UF desde</span>
        <input name="precio_min_uf" type="number" min={0} inputMode="numeric" className={fieldClass} placeholder="Opcional" />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">UF hasta</span>
        <input name="precio_max_uf" type="number" min={0} inputMode="numeric" className={fieldClass} placeholder="Opcional" />
      </label>
      <div className="flex items-end lg:col-span-6">
        <ButtonISL type="submit">Buscar</ButtonISL>
      </div>
    </form>
  );
}
