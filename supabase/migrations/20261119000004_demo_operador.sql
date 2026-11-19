alter table public.demo_trials
  add column condominio_id uuid unique references public.condominios(id) on delete set null;

create function public.preparar_condominio_demo() returns uuid
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
  values (edificio,usuario,'operador');

  -- The membership created by onboarding is not one of the operator's actions.
  insert into public.cupos_acciones (condominio_id,usadas,limite)
  values (edificio,0,10) on conflict (condominio_id) do update set usadas=0;

  update public.demo_trials set condominio_id=edificio where user_id=usuario;
  return edificio;
end;
$$;
revoke all on function public.preparar_condominio_demo() from public, anon, authenticated;
grant execute on function public.preparar_condominio_demo() to authenticated;

create function public.puede_registrar_inmueble_demo(edificio uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.demo_trials t
    join public.condominio_usuarios m
      on m.user_id=t.user_id and m.condominio_id=t.condominio_id
    where t.user_id=auth.uid() and t.condominio_id=edificio
      and t.expires_at>now() and m.is_active and m.role='operador'
  );
$$;
revoke all on function public.puede_registrar_inmueble_demo(uuid) from public, anon, authenticated;
grant execute on function public.puede_registrar_inmueble_demo(uuid) to authenticated;

create policy inmuebles_insert_demo_operador on public.inmuebles
for insert to authenticated
with check (public.puede_registrar_inmueble_demo(condominio_id));

create function public.verificar_vigencia_demo() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if exists (
    select 1 from public.demo_trials t
    join public.condominio_usuarios m
      on m.user_id=t.user_id and m.condominio_id=t.condominio_id
    where t.user_id=auth.uid() and t.condominio_id=new.condominio_id
      and t.expires_at<=now() and m.is_active and m.role='operador'
  ) then
    raise exception using errcode='P0001', message='DEMO_EXPIRADA';
  end if;
  return new;
end;
$$;
revoke all on function public.verificar_vigencia_demo() from public, anon, authenticated;
create trigger verificar_vigencia_demo before insert or update on public.cupos_acciones
for each row execute function public.verificar_vigencia_demo();
