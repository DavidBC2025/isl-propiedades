-- Funciones con security definer para que el Worker (clave anon) pueda
-- marcar un lead como notificado y dar de baja una alerta por token,
-- sin abrir SELECT/UPDATE público sobre esas tablas.

create or replace function public.marcar_lead_notificado(p_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.leads
  set notificado = true, notificado_en = now()
  where id = p_id;
end;
$$;

create or replace function public.baja_alerta(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  found_id uuid;
begin
  if p_token is null or length(trim(p_token)) = 0 then
    return false;
  end if;

  select id into found_id from public.alertas where token = trim(p_token) limit 1;
  if found_id is null then
    return false;
  end if;

  update public.alertas set activa = false where id = found_id;
  return true;
end;
$$;

revoke all on function public.marcar_lead_notificado(uuid) from public;
revoke all on function public.baja_alerta(text) from public;
grant execute on function public.marcar_lead_notificado(uuid) to anon, authenticated;
grant execute on function public.baja_alerta(text) to anon, authenticated;
