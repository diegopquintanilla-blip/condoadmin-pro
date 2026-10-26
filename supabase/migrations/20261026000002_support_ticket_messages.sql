-- Support P0.2 draft: per-ticket private conversation (not applied).
create table public.support_ticket_messages (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null,
 condominio_id uuid not null,
 author_id uuid not null references auth.users(id),
 body text not null check(char_length(btrim(body)) between 1 and 4000),
 created_at timestamptz not null default now(),
 constraint support_messages_ticket_tenant_fk foreign key(condominio_id,ticket_id) references public.support_tickets(condominio_id,id) on delete cascade
);
create index support_messages_ticket_date on public.support_ticket_messages(ticket_id,created_at);
alter table public.support_ticket_messages enable row level security;
revoke all on public.support_ticket_messages from anon;
revoke update,delete on public.support_ticket_messages from authenticated;
grant select,insert on public.support_ticket_messages to authenticated;
create policy "author reads ticket thread" on public.support_ticket_messages for select to authenticated using (
 exists(select 1 from public.support_tickets t where t.id=support_ticket_messages.ticket_id and t.condominio_id=support_ticket_messages.condominio_id and t.created_by=(select auth.uid()))
);
create policy "author replies to own open ticket" on public.support_ticket_messages for insert to authenticated with check (
 author_id=(select auth.uid()) and exists(select 1 from public.support_tickets t where t.id=support_ticket_messages.ticket_id and t.condominio_id=support_ticket_messages.condominio_id and t.created_by=(select auth.uid()) and t.estado in ('abierto','en_revision'))
);
-- Platform agents require a separately audited global support-agent permission.
-- Never give all condominium administrators access to platform tickets.
