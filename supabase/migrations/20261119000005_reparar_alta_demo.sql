create or replace function public.preparar_condominio_demo() returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  usuario uuid := auth.uid();
  prueba public.demo_trials%rowtype;
  edificio uuid;
begin
  if usuario is null or not exists (
    select 1 from auth.users where id=usuario and email_confirmed_at is not null
  ) then return null; end if;

  select * into prueba from public.demo_trials where user_id=usuario for update;
  if not found or prueba.expires_at<=now() then return null; end if;
  if prueba.condominio_id is not null then return prueba.condominio_id; end if;
  if exists (
    select 1 from public.condominio_usuarios where user_id=usuario and is_active
  ) then return null; end if;

  insert into public.condominios (nombre,created_by)
  values ('Mi condominio de prueba',usuario) returning id into edificio;

  insert into public.condominio_usuarios (condominio_id,user_id,role)
  values (edificio,usuario,'operador')
  on conflict (condominio_id,user_id) do update set role=excluded.role,is_active=true;

  -- The membership created by onboarding is not one of the operator's actions.
  insert into public.cupos_acciones (condominio_id,usadas,limite)
  values (edificio,0,10) on conflict (condominio_id) do update set usadas=0;

  update public.demo_trials set condominio_id=edificio where user_id=usuario;
  return edificio;
end;
$$;
