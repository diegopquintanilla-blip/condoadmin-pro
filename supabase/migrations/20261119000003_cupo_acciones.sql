create table public.cupos_acciones (
  condominio_id uuid primary key references public.condominios(id) on delete cascade,
  usadas integer not null default 0 check (usadas >= 0),
  limite integer not null default 10 check (limite >= 10)
);
alter table public.cupos_acciones enable row level security;
revoke all on public.cupos_acciones from public, anon, authenticated;
grant select on public.cupos_acciones to authenticated;
create policy cupos_acciones_leer on public.cupos_acciones for select to authenticated
using (public.tiene_rol_condominio(condominio_id,array['super_admin','admin','junta','operador']::text[]));

insert into public.cupos_acciones (condominio_id,limite)
select c.id,coalesce(u.limite,10) from public.condominios c
left join public.cupos_unidades u on u.condominio_id=c.id;

create function public.registrar_accion_condominio() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  anterior uuid;
  destino uuid;
  objetivo uuid;
begin
  if tg_op = 'UPDATE' and old is not distinct from new then return null; end if;
  if tg_op <> 'INSERT' then anterior := (to_jsonb(old)->>tg_argv[0])::uuid; end if;
  if tg_op <> 'DELETE' then destino := (to_jsonb(new)->>tg_argv[0])::uuid; end if;
  for objetivo in
    select distinct id from unnest(array[anterior,destino]) as x(id) where id is not null order by id
  loop
    -- Ignore dependent rows removed as part of deleting their condominium.
    if not exists (select 1 from public.condominios where id=objetivo) then continue; end if;
    insert into public.cupos_acciones as cupo (condominio_id,usadas) values (objetivo,1)
    on conflict (condominio_id) do update set usadas=cupo.usadas+1 where cupo.usadas<cupo.limite;
    if not found then
      raise exception using errcode='P0001',message='LIMITE_ACCIONES_ALCANZADO',
        detail='Alcanzaste el límite de acciones de tu plan. Contacta a diego.pquintanilla@gmail.com para ampliarlo.';
    end if;
  end loop;
  return null;
end;
$$;
revoke all on function public.registrar_accion_condominio() from public, anon, authenticated;

do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'areas_comunes','cobranza_contactos','comprobantes_pago','comunicados','condominio_usuarios',
    'control_acceso','cuentas_bancarias','documentos','etapas','finanzas_config','hr_attendance',
    'hr_employee_terms','hr_honorarios','hr_payroll_lines','hr_payroll_periods','incidencias',
    'inmuebles','mascotas','pagos','personal','presupuestos','propietarios','recibos','reservas',
    'residentes','servicios','support_ticket_messages','support_tickets','tareas','vehiculos','votaciones','votos'
  ] loop
    -- Some modules are installed separately.
    if to_regclass(format('public.%I',tabla)) is not null then
      execute format(
        'create trigger registrar_accion_condominio after insert or update or delete on public.%I for each row execute function public.registrar_accion_condominio(%L)',
        tabla,'condominio_id');
    end if;
  end loop;
end;
$$;

create trigger registrar_accion_condominio
after update on public.condominios for each row execute function public.registrar_accion_condominio('id');

drop trigger actualizar_cupo_unidades on public.inmuebles;
