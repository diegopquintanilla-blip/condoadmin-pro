-- P0.6 DRAFT: in-app private notifications. No email provider or secret needed.
-- Apply only after isolated migration and RLS testing.
create table public.support_notifications (
 id uuid primary key default gen_random_uuid(),
 recipient_id uuid not null references auth.users(id) on delete cascade,
 ticket_id uuid not null,
 condominio_id uuid not null,
 event_type text not null check (event_type in ('ticket_created','agent_replied','customer_replied','status_changed')),
 created_at timestamptz not null default now(),
 read_at timestamptz,
 constraint support_notifications_ticket_fk foreign key(condominio_id,ticket_id) references public.support_tickets(condominio_id,id) on delete cascade
);
create index support_notifications_recipient_created on public.support_notifications(recipient_id,created_at desc);
alter table public.support_notifications enable row level security;
revoke all on public.support_notifications from anon,authenticated;
grant select,update(read_at) on public.support_notifications to authenticated;
create policy "recipient reads notifications" on public.support_notifications for select to authenticated using (recipient_id=(select auth.uid()));
create policy "recipient acknowledges notifications" on public.support_notifications for update to authenticated using (recipient_id=(select auth.uid())) with check (recipient_id=(select auth.uid()));
-- No client INSERT rights: trusted trigger emits events inside parent transaction.
create function public.support_emit_notification() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
 if tg_table_name='support_tickets' then
  insert into public.support_notifications(recipient_id,ticket_id,condominio_id,event_type)
  select a.user_id,new.id,new.condominio_id,'ticket_created'
  from public.support_agents a where a.is_active=true and a.user_id<>new.created_by;
 elsif tg_table_name='support_ticket_messages' then
  insert into public.support_notifications(recipient_id,ticket_id,condominio_id,event_type)
  select t.created_by,new.ticket_id,new.condominio_id,'agent_replied'
  from public.support_tickets t where t.id=new.ticket_id and t.condominio_id=new.condominio_id and t.created_by<>new.author_id;
  insert into public.support_notifications(recipient_id,ticket_id,condominio_id,event_type)
  select a.user_id,new.ticket_id,new.condominio_id,'customer_replied'
  from public.support_agents a
  join public.support_tickets t on t.id=new.ticket_id and t.condominio_id=new.condominio_id
  where a.is_active=true and t.created_by=new.author_id and a.user_id<>new.author_id;
 elsif tg_table_name='support_ticket_audit' then
  insert into public.support_notifications(recipient_id,ticket_id,condominio_id,event_type)
  select t.created_by,new.ticket_id,new.condominio_id,'status_changed'
  from public.support_tickets t where t.id=new.ticket_id and t.condominio_id=new.condominio_id and t.created_by<>new.actor_id;
 end if;
 return new;
end; $$;
revoke all on function public.support_emit_notification() from public,anon,authenticated;
create trigger support_notify_new_ticket after insert on public.support_tickets for each row execute function public.support_emit_notification();
create trigger support_notify_message after insert on public.support_ticket_messages for each row execute function public.support_emit_notification();
create trigger support_notify_status after insert on public.support_ticket_audit for each row execute function public.support_emit_notification();
-- Email notifications remain disabled; no addresses exposed to the browser.
