lock table public.inmuebles in share row exclusive mode;

create table public.cupos_unidades (
  condominio_id uuid primary key references public.condominios(id) on delete cascade,
  usadas integer not null default 0 check (usadas >= 0),
  limite integer not null default 10 check (limite >= 10)
);
alter table public.cupos_unidades enable row level security;
revoke all on public.cupos_unidades from public, anon, authenticated;
grant select on public.cupos_unidades to authenticated;
create policy cupos_unidades_leer on public.cupos_unidades for select to authenticated
using (public.tiene_rol_condominio(condominio_id, array['super_admin','admin','junta']::text[]));

insert into public.cupos_unidades (condominio_id, usadas)
select condominio_id, count(*) from public.inmuebles
where condominio_id is not null and tipo in ('lote','casa','departamento','local')
group by condominio_id;

create function public.actualizar_cupo_unidades() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  anterior uuid;
  destino uuid;
begin
  if tg_op <> 'INSERT' and old.tipo in ('lote','casa','departamento','local') then
    anterior := old.condominio_id;
  end if;
  if tg_op <> 'DELETE' and new.tipo in ('lote','casa','departamento','local') then
    destino := new.condominio_id;
  end if;
  if anterior is not distinct from destino then return null; end if;

  if anterior is not null then
    update public.cupos_unidades set usadas = usadas - 1 where condominio_id = anterior;
  end if;
  if destino is not null then
    insert into public.cupos_unidades as cupo (condominio_id, usadas) values (destino, 1)
    on conflict (condominio_id) do update set usadas = cupo.usadas + 1
    where cupo.usadas < cupo.limite;
    if not found then
      raise exception using errcode = 'P0001', message = 'LIMITE_UNIDADES_ALCANZADO';
    end if;
  end if;
  return null;
end;
$$;
revoke all on function public.actualizar_cupo_unidades() from public, anon, authenticated;
create trigger actualizar_cupo_unidades
after insert or delete or update of tipo, condominio_id on public.inmuebles
for each row execute function public.actualizar_cupo_unidades();
