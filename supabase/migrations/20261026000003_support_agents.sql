-- P0.3: explicit, platform-only support agents. Review on isolated DB first.
create table public.support_agents (
 user_id uuid primary key references auth.users(id) on delete cascade,
 is_active boolean not null default false,
 granted_at timestamptz not null default now()
);
alter table public.support_agents enable row level security;
revoke all on public.support_agents from anon,authenticated;
grant select on public.support_agents to authenticated;
create policy "agents can see only own membership" on public.support_agents for select to authenticated
 using(user_id=(select auth.uid()));
create policy "active agent reads platform tickets" on public.support_tickets for select to authenticated using (
 exists (select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true)
);
create policy "active agent reads ticket messages" on public.support_ticket_messages for select to authenticated using (
 exists (select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true)
);
-- Agents cannot modify ticket state or reply until explicit auditing of write permissions.
-- Do not grant agents by copying condominium administrator roles.
