-- Migración 0003: Agrega columna logo para almacenar la URL del logo de ISL Propiedades
alter table if exists public.site_settings add column if not exists logo text;
