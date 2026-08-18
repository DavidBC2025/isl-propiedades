-- Seed opcional de ISL Propiedades. Ejecutar solo después de 0001_isl_init.sql.
-- No contiene propiedades, testimonios, artículos ni casos de preparación ficticios.

insert into public.agentes (slug, nombre, rol, activo, orden)
values
  ('silvia', 'Silvia', 'Corredora de Propiedades', true, 1),
  ('ivannia', 'Ivannia', 'Corredora de Propiedades', true, 2)
on conflict (slug) do nothing;

insert into public.barrios (slug, nombre, publicado)
values
  ('vina-del-mar', 'Viña del Mar', false),
  ('renaca', 'Reñaca', false),
  ('recreo', 'Recreo', false),
  ('concon', 'Concón', false),
  ('olmue', 'Olmué', false),
  ('quilpue', 'Quilpué', false),
  ('penablanca', 'Peñablanca', false),
  ('villa-alemana', 'Villa Alemana', false)
on conflict (slug) do nothing;

insert into public.site_settings (id, home_headline, home_subheadline, como_trabajamos)
values (1, 'Espacios para vivir lo que imaginas.', 'Corredora boutique en Viña del Mar', '[]'::jsonb)
on conflict (id) do nothing;
