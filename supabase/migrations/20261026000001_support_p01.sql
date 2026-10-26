-- Support P0.1: do not apply to production before isolated database tests.
create table public.support_tickets (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null references public.condominios(id) on delete restrict,
 created_by uuid not null references auth.users(id),
 asunto text not null check(char_length(btrim(asunto)) between 5 and 150),
 descripcion text not null check(char_length(btrim(descripcion)) between 15 and 5000),
 categoria text not null default 'consulta' check(categoria in ('consulta','incidencia','acceso','facturacion','otro')),
 prioridad text not null default 'normal' check(prioridad in ('normal','alta')),
 estado text not null default 'abierto' check(estado in ('abierto','en_revision','resuelto','cerrado')),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique (condominio_id,id)
);
create index support_tickets_condo_date on public.support_tickets(condominio_id,created_at desc);
create index support_tickets_creator_date on public.support_tickets(created_by,created_at desc);
alter table public.support_tickets enable row level security;
revoke all on public.support_tickets from anon;
revoke update,delete on public.support_tickets from authenticated;
grant insert on public.support_tickets to authenticated;
create policy "insert own ticket" on public.support_tickets for insert to authenticated with check (created_by=(select auth.uid()) and estado='abierto' and prioridad='normal' and exists (select 1 from public.condominio_usuarios m where m.condominio_id=support_tickets.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true));
grant select on public.support_tickets to authenticated;
create policy "ticket creator reads own" on public.support_tickets for select to authenticated
 using (created_by=(select auth.uid()) and exists(select 1 from public.condominio_usuarios m where m.condominio_id=support_tickets.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true));
-- Ticket creation is performed only by the server after verifying live membership.
-- No generic SELECT for condo admins: these are platform support requests.
