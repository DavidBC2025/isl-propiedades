import { ButtonISL } from "@/components/isl/ButtonISL";
import { COMUNAS_BUSQUEDA } from "@/lib/site";

const fieldClass = "min-h-12 w-full rounded-sm border px-3 text-base transition-colors duration-300 focus:border-isl-gold focus:outline-none";

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
  dark?: boolean;
};

export function QuickSearch({ values, showDormitorios = false, dark = false }: QuickSearchProps) {
  const inputClass = `${fieldClass} ${dark ? "border-white/20 bg-white/5 text-white placeholder:text-white/50 [&_option]:bg-[#121212]" : "border-isl-black/20 bg-isl-white text-isl-black"}`;
  const labelClass = dark ? "text-sm text-white/75" : "text-sm text-isl-black";

  return (
    <form method="get" action="/propiedades" className="grid gap-4 rounded-sm border border-white/10 bg-black/35 p-5 shadow-2xl backdrop-blur-sm md:grid-cols-2 md:p-8 lg:grid-cols-6">
      <label className="space-y-1 lg:col-span-2">
        <span className={labelClass}>Comuna</span>
        <select name="comuna" className={inputClass} defaultValue={values?.comuna ?? ""}>
          <option value="">Todas</option>
          {COMUNAS_BUSQUEDA.map((comuna) => (
            <option key={comuna} value={comuna}>{comuna}</option>
          ))}
        </select>
      </label>
      <label className="space-y-1">
        <span className={labelClass}>Operación</span>
        <select name="operacion" className={inputClass} defaultValue={values?.operacion ?? ""}>
          <option value="">Todas</option>
          <option value="venta">Venta</option>
          <option value="arriendo">Arriendo</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className={labelClass}>Tipo</span>
        <select name="tipo" className={inputClass} defaultValue={values?.tipo ?? ""}>
          <option value="">Todos</option>
          <option value="casa">Casa</option>
          <option value="departamento">Departamento</option>
          <option value="parcela">Parcela</option>
        </select>
      </label>
      <label className="space-y-1">
        <span className={labelClass}>UF desde</span>
        <input name="precio_min_uf" type="number" min={0} inputMode="numeric" className={inputClass} placeholder="Opcional" defaultValue={values?.precio_min_uf ?? ""} />
      </label>
      <label className="space-y-1">
        <span className={labelClass}>UF hasta</span>
        <input name="precio_max_uf" type="number" min={0} inputMode="numeric" className={inputClass} placeholder="Opcional" defaultValue={values?.precio_max_uf ?? ""} />
      </label>
      {showDormitorios ? (
        <label className="space-y-1">
          <span className={labelClass}>Dormitorios</span>
          <select name="dormitorios" className={inputClass} defaultValue={values?.dormitorios ?? ""}>
            <option value="">Todos</option>
            <option value="1">1 o más</option>
            <option value="2">2 o más</option>
            <option value="3">3 o más</option>
            <option value="4">4 o más</option>
          </select>
        </label>
      ) : null}
      <div className={`flex items-end ${showDormitorios ? "lg:col-span-5" : "lg:col-span-6"}`}>
        <ButtonISL type="submit" variant={dark ? "gold" : "primary"} className="w-full lg:w-auto">Buscar</ButtonISL>
      </div>
    </form>
  );
}
