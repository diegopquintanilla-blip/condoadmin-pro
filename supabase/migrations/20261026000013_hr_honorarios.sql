create table public.hr_honorarios (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null references public.condominios(id),
 periodo date not null check(extract(day from periodo)=1),
 codigo text not null check(char_length(codigo) between 1 and 80),
 proveedor text not null check(char_length(proveedor) between 2 and 200),
 ruc text check(ruc is null or ruc ~ '^[0-9]{11}$'),
 servicio text not null check(char_length(servicio) between 2 and 500),
 recibo text check(char_length(recibo)<=120),
 cantidad numeric(10,2) not null check(cantidad>0),
 tarifa numeric(12,2) not null check(tarifa>=0),
 retencion_porcentaje numeric(5,2) not null default 0 check(retencion_porcentaje between 0 and 100),
 otros_descuentos numeric(12,2) not null default 0 check(otros_descuentos>=0),
 bruto numeric(14,2) generated always as (round(cantidad*tarifa,2)) stored,
 retencion numeric(14,2) generated always as (round(round(cantidad*tarifa,2)*retencion_porcentaje/100,2)) stored,
 neto numeric(14,2) generated always as (round(cantidad*tarifa,2)-round(round(cantidad*tarifa,2)*retencion_porcentaje/100,2)-otros_descuentos) stored,
 estado text not null default 'pendiente' check(estado in ('pendiente','revisado')),
 observaciones text check(char_length(observaciones)<=1000),
 created_at timestamptz not null default now(),
 unique(condominio_id,periodo,codigo,recibo),
 check(round(cantidad*tarifa,2)>=round(round(cantidad*tarifa,2)*retencion_porcentaje/100,2)+otros_descuentos)
);
create index hr_honorarios_condo_period on public.hr_honorarios(condominio_id,periodo);
alter table public.hr_honorarios enable row level security;
revoke all on public.hr_honorarios from anon,authenticated;
grant select,insert,update on public.hr_honorarios to authenticated;
create policy hr_honorarios_admin_select on public.hr_honorarios for select to authenticated using (public.tiene_rol_condominio(condominio_id,array['admin','super_admin']::text[]));
create policy hr_honorarios_admin_insert on public.hr_honorarios for insert to authenticated with check (public.tiene_rol_condominio(condominio_id,array['admin','super_admin']::text[]));
create policy hr_honorarios_admin_update on public.hr_honorarios for update to authenticated using (public.tiene_rol_condominio(condominio_id,array['admin','super_admin']::text[])) with check (public.tiene_rol_condominio(condominio_id,array['admin','super_admin']::text[]));
