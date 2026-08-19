import { ButtonISL } from "@/components/isl/ButtonISL";
import { COMUNAS_BUSQUEDA } from "@/lib/site";

const fieldClass = "min-h-11 w-full rounded-sm border border-isl-black/20 bg-isl-white px-3 text-base text-isl-black";

export type QuickSearchValues = {
  comuna?: string;
  operacion?: string;
  tipo?: string;
  precio_min_uf?: string;
  precio_max_uf?: string;
  dormitorios?: string;
};

type QuickSearchProps = {
  values?: QuickSearchValues;
  showDormitorios?: boolean;
};

export function QuickSearch({ values, showDormitorios = false }: QuickSearchProps) {
  return (
    <form method="get" action="/propiedades" className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <label className="space-y-1 lg:col-span-2">
        <span className="text-sm text-isl-black">Comuna</span>
        <select name="comuna" className={fieldClass} defaultValue={values?.comuna ?? ""}>
          <option value="">Todas</option>
          {COMUNAS_BUSQUEDA.map((comuna) => (
            <option key={comuna} value={comuna}>{comuna}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">Operación</span>
        <select name="operacion" className={fieldClass} defaultValue={values?.operacion ?? ""}>
          <option value="">Todas</option>
          <option value="venta">Venta</option>
          <option value="arriendo">Arriendo</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">Tipo</span>
        <select name="tipo" className={fieldClass} defaultValue={values?.tipo ?? ""}>
          <option value="">Todos</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="parcela">Parcela</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">UF desde</span>
        <input name="precio_min_uf" type="number" min={0} inputMode="numeric" className={fieldClass} placeholder="Opcional" defaultValue={values?.precio_min_uf ?? ""} />
      </label>
      <label className="space-y-1">
        <span className="text-sm text-isl-black">UF hasta</span>
        <input name="precio_max_uf" type="number" min={0} inputMode="numeric" className={fieldClass} placeholder="Opcional" defaultValue={values?.precio_max_uf ?? ""} />
      </label>
      {showDormitorios ? (
        <label className="space-y-1">
          <span className="text-sm text-isl-black">Dormitorios</span>
          <select name="dormitorios" className={fieldClass} defaultValue={values?.dormitorios ?? ""}>
            <option value="">Todos</option>
            <option value="1">1 o más</option>
            <option value="2">2 o más</option>
            <option value="3">3 o más</option>
            <option value="4">4 o más</option>
          </select>
        </label>
      ) : null}
      <div className={`flex items-end ${showDormitorios ? "lg:col-span-5" : "lg:col-span-6"}`}>
        <ButtonISL type="submit">Buscar</ButtonISL>
      </div>
    </form>
  );
}
