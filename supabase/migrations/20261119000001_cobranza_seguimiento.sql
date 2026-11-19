create table public.cobranza_contactos (
  id uuid primary key,
  condominio_id uuid not null references public.condominios(id),
  inmueble_id uuid not null references public.inmuebles(id),
  canal text not null check (canal in ('whatsapp', 'correo', 'llamada', 'presencial')),
  proximo_contacto date,
  nota text check (char_length(nota) <= 300),
  registrado_por uuid not null default auth.uid(),
  registrado_at timestamptz not null default now()
);

create index cobranza_contactos_ultimo_idx
  on public.cobranza_contactos (condominio_id, inmueble_id, registrado_at desc, id desc);

alter table public.cobranza_contactos enable row level security;
revoke all on public.cobranza_contactos from anon, authenticated;
grant select on public.cobranza_contactos to authenticated;
grant insert (id, condominio_id, inmueble_id, canal, proximo_contacto, nota)
  on public.cobranza_contactos to authenticated;

create policy cobranza_contactos_leer on public.cobranza_contactos
  for select to authenticated using (
    public.tiene_rol_condominio(condominio_id, array['super_admin','admin','junta']::text[])
  );

create policy cobranza_contactos_registrar on public.cobranza_contactos
  for insert to authenticated with check (
    registrado_por = auth.uid()
    and public.tiene_rol_condominio(condominio_id, array['super_admin','admin','junta']::text[])
    and exists (
      select 1 from public.inmuebles i
      where i.id = cobranza_contactos.inmueble_id
        and i.condominio_id = cobranza_contactos.condominio_id
    )
  );

create view public.cobranza_ultimo_contacto with (security_invoker = true) as
  select distinct on (condominio_id, inmueble_id)
    condominio_id, inmueble_id, canal, proximo_contacto, nota, registrado_at
  from public.cobranza_contactos
  order by condominio_id, inmueble_id, registrado_at desc, id desc;

revoke all on public.cobranza_ultimo_contacto from anon, authenticated;
grant select on public.cobranza_ultimo_contacto to authenticated;
