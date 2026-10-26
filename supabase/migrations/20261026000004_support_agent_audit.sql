-- P0.4: audited agent writes; not applied to production.
create table public.support_ticket_audit (
 id uuid primary key default gen_random_uuid(),
 ticket_id uuid not null,
 condominio_id uuid not null,
 actor_id uuid not null references auth.users(id),
 old_status text not null,
 new_status text not null,
 created_at timestamptz not null default now(),
 constraint support_audit_ticket_fk foreign key (condominio_id,ticket_id) references public.support_tickets(condominio_id,id)
);
alter table public.support_ticket_audit enable row level security;
revoke all on public.support_ticket_audit from anon,authenticated;
grant select on public.support_ticket_audit to authenticated;
create policy "support agents view audit" on public.support_ticket_audit for select to authenticated using (
 exists (select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true)
);
-- Agent replies: author must be the current, active platform support agent.
create policy "active support agent sends replies" on public.support_ticket_messages for insert to authenticated with check (
 author_id=(select auth.uid()) and exists(select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true)
 and exists(select 1 from public.support_tickets t where t.id=support_ticket_messages.ticket_id and t.condominio_id=support_ticket_messages.condominio_id and t.estado in ('abierto','en_revision'))
);
-- Audit and state changes use a SECURITY INVOKER SQL RPC in a separate phase after isolated tests.
