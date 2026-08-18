-- ISL Propiedades: contrato de datos completo (Prompt 1).
-- Archivo aditivo e idempotente. Ejecutar manualmente en Supabase SQL Editor.
-- No modifica auth.users, no elimina datos ni renombra la tabla heredada
-- potencialmente existente public."Propiedades".

create extension if not exists pgcrypto;

create table if not exists public.agentes (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  apellido text,
  rol text default 'Corredora de Propiedades',
  bio text,
  foto_url text,
  email text,
  whatsapp text,
  especialidad text,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.propiedades (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  operacion text check (operacion in ('venta', 'arriendo')),
  tipo text check (tipo in ('casa', 'departamento', 'parcela')),
  precio_uf numeric not null,
  comuna text not null,
  sector text,
  direccion_publica text,
  lat numeric,
  lng numeric,
  dormitorios integer,
  banos integer,
  estacionamientos integer,
  m2_construidos numeric,
  m2_terreno numeric,
  gastos_comunes_uf numeric,
  orientacion text,
  vista text check (vista in ('mar', 'cerro', 'ciudad', 'jardin', 'sin_vista') or vista is null),
  descripcion text,
  caracteristicas jsonb default '[]'::jsonb,
  video_url text,
  tour_url text,
  imagenes jsonb not null default '[]'::jsonb,
  estado text check (estado in ('borrador', 'publicada', 'reservada', 'vendida', 'despublicada')) default 'borrador',
  propiedad_principal boolean default false,
  en_hero boolean default false,
  hero_orden integer,
  agente_id uuid references public.agentes(id),
  fecha_publicacion timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  media_type text check (media_type in ('image', 'video')) default 'image',
  media_url text,
  titulo text,
  subtitulo text,
  cta_primario_label text,
  cta_primario_href text,
  cta_secundario_label text,
  cta_secundario_href text,
  orden integer default 0,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.casos_preparacion (
  id uuid primary key default gen_random_uuid(),
  propiedad_id uuid references public.propiedades(id) on delete set null,
  imagen_antes text not null,
  imagen_despues text not null,
  descripcion_corta text,
  publicado boolean default false,
  orden integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.articulos (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  titulo text not null,
  extracto text,
  contenido text,
  categoria text check (categoria in ('comprar', 'vender', 'invertir', 'barrio', 'tips')),
  etiquetas text[] default '{}',
  imagen_destacada text,
  seo_title text,
  meta_description text,
  estado text check (estado in ('publicado', 'borrador')) default 'borrador',
  es_reporte boolean default false,
  archivo_pdf_url text,
  fecha_publicacion timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.testimonios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  rol_ciudad text,
  texto text not null,
  foto_url text,
  propiedad_id uuid references public.propiedades(id) on delete set null,
  destacado boolean default false,
  publicado boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  tipo text check (tipo in ('contacto', 'tasacion', 'vender', 'visita', 'alerta', 'newsletter', 'guia')),
  nombre text not null,
  email text,
  telefono text,
  mensaje text,
  comuna text,
  tipo_propiedad text,
  m2 numeric,
  dormitorios integer,
  propiedad_id uuid references public.propiedades(id) on delete set null,
  agente_id uuid references public.agentes(id) on delete set null,
  origen_url text,
  estado text check (estado in ('nuevo', 'contactado', 'cerrado')) default 'nuevo',
  notificado boolean default false,
  notificado_en timestamptz,
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.barrios (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  nombre text not null,
  hero_image text,
  extracto text,
  contenido text,
  tips jsonb default '[]'::jsonb,
  seo_title text,
  meta_description text,
  publicado boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  comuna text,
  operacion text,
  tipo text,
  precio_max_uf numeric,
  token text unique default encode(gen_random_bytes(24), 'hex'),
  activa boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  home_headline text,
  home_subheadline text,
  email_general text,
  whatsapp_general text,
  uf_valor_manual numeric,
  uf_actualizado_en timestamptz,
  calc_comision_porcentaje numeric,
  calc_gastos_escritura_uf numeric,
  calc_pie_porcentaje numeric,
  disclaimer_calculadora text,
  como_trabajamos jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);

-- Para tablas que pudieron existir antes, agrega columnas sin eliminar ni
-- endurecer restricciones sobre datos heredados. Las restricciones completas
-- quedan garantizadas al crear tablas nuevas.
alter table if exists public.agentes add column if not exists updated_at timestamptz default now();
alter table if exists public.propiedades add column if not exists imagenes jsonb default '[]'::jsonb;
alter table if exists public.propiedades add column if not exists estado text default 'borrador';
alter table if exists public.propiedades add column if not exists updated_at timestamptz default now();
alter table if exists public.hero_slides add column if not exists updated_at timestamptz default now();
alter table if exists public.articulos add column if not exists es_reporte boolean default false;
alter table if exists public.articulos add column if not exists archivo_pdf_url text;
alter table if exists public.articulos add column if not exists updated_at timestamptz default now();
alter table if exists public.leads add column if not exists notificado boolean default false;
alter table if exists public.leads add column if not exists notificado_en timestamptz;
alter table if exists public.leads add column if not exists payload jsonb default '{}'::jsonb;
alter table if exists public.barrios add column if not exists updated_at timestamptz default now();
alter table if exists public.site_settings add column if not exists como_trabajamos jsonb default '[]'::jsonb;
alter table if exists public.site_settings add column if not exists updated_at timestamptz default now();

create index if not exists idx_propiedades_estado on public.propiedades(estado);
create index if not exists idx_propiedades_comuna on public.propiedades(comuna);
create index if not exists idx_propiedades_operacion_tipo on public.propiedades(operacion, tipo);
create index if not exists idx_articulos_estado on public.articulos(estado);
create index if not exists idx_leads_estado on public.leads(estado);
create index if not exists idx_barrios_publicado on public.barrios(publicado);
create unique index if not exists idx_propiedades_una_principal
  on public.propiedades (propiedad_principal) where propiedad_principal;

create or replace function public.isl_set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tabla text;
begin
  foreach tabla in array array['agentes', 'propiedades', 'hero_slides', 'articulos', 'barrios', 'site_settings']
  loop
    if not exists (
      select 1 from pg_trigger
      where tgname = 'set_updated_at_' || tabla and tgrelid = ('public.' || tabla)::regclass
    ) then
      execute format('create trigger %I before update on public.%I for each row execute function public.isl_set_updated_at()', 'set_updated_at_' || tabla, tabla);
    end if;
  end loop;
end;
$$;

alter table public.agentes enable row level security;
alter table public.propiedades enable row level security;
alter table public.hero_slides enable row level security;
alter table public.casos_preparacion enable row level security;
alter table public.articulos enable row level security;
alter table public.testimonios enable row level security;
alter table public.leads enable row level security;
alter table public.barrios enable row level security;
alter table public.alertas enable row level security;
alter table public.site_settings enable row level security;

-- Las políticas se crean por nombre solo si todavía no existen, por lo que el
-- script puede volver a ejecutarse sin duplicarlas.
do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'propiedades' and policyname = 'public_read_published_propiedades') then
    create policy public_read_published_propiedades on public.propiedades for select to anon using (estado in ('publicada', 'reservada', 'vendida'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'articulos' and policyname = 'public_read_published_articulos') then
    create policy public_read_published_articulos on public.articulos for select to anon using (estado = 'publicado');
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'testimonios' and policyname = 'public_read_published_testimonios') then
    create policy public_read_published_testimonios on public.testimonios for select to anon using (publicado = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'agentes' and policyname = 'public_read_active_agentes') then
    create policy public_read_active_agentes on public.agentes for select to anon using (activo = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'barrios' and policyname = 'public_read_published_barrios') then
    create policy public_read_published_barrios on public.barrios for select to anon using (publicado = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'hero_slides' and policyname = 'public_read_active_hero_slides') then
    create policy public_read_active_hero_slides on public.hero_slides for select to anon using (activo = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'casos_preparacion' and policyname = 'public_read_published_casos_preparacion') then
    create policy public_read_published_casos_preparacion on public.casos_preparacion for select to anon using (publicado = true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'site_settings' and policyname = 'public_read_site_settings') then
    create policy public_read_site_settings on public.site_settings for select to anon using (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'public_insert_leads') then
    create policy public_insert_leads on public.leads for insert to anon, authenticated with check (true);
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'alertas' and policyname = 'public_insert_alertas') then
    create policy public_insert_alertas on public.alertas for insert to anon, authenticated with check (true);
  end if;
end;
$$;

do $$
declare
  tabla text;
begin
  foreach tabla in array array['agentes', 'propiedades', 'hero_slides', 'casos_preparacion', 'articulos', 'testimonios', 'barrios', 'site_settings', 'leads', 'alertas']
  loop
    if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = tabla and policyname = 'authenticated_manage_' || tabla) then
      execute format('create policy %I on public.%I for all to authenticated using (true) with check (true)', 'authenticated_manage_' || tabla, tabla);
    end if;
  end loop;
end;
$$;

-- Storage: 50 MB se establece como supuesto conservador solo para buckets nuevos.
insert into storage.buckets (id, name, public, file_size_limit)
values
  ('propiedades', 'propiedades', true, 52428800),
  ('contenidos', 'contenidos', true, 52428800)
on conflict (id) do nothing;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'public_read_isl_media') then
    create policy public_read_isl_media on storage.objects for select to public using (bucket_id in ('propiedades', 'contenidos'));
  end if;
  if not exists (select 1 from pg_policies where schemaname = 'storage' and tablename = 'objects' and policyname = 'authenticated_write_isl_media') then
    create policy authenticated_write_isl_media on storage.objects for all to authenticated using (bucket_id in ('propiedades', 'contenidos')) with check (bucket_id in ('propiedades', 'contenidos'));
  end if;
end;
$$;
