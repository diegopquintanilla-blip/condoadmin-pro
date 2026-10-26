-- P0.5 draft. Apply only after isolated DB/security tests.
-- Only the status column can be changed by authenticated agents.
grant update (estado) on public.support_tickets to authenticated;
create policy "platform agents update ticket status" on public.support_tickets
 for update to authenticated
 using (exists(select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true))
 with check (exists(select 1 from public.support_agents a where a.user_id=(select auth.uid()) and a.is_active=true));
-- Audit must be recorded atomically with a status update. This trigger can only
-- be invoked by an UPDATE to the guarded ticket table, not by client RPC.
create function public.support_record_status_change() returns trigger
 language plpgsql security definer set search_path = ''
 as $$
 begin
  if old.estado is distinct from new.estado then
   insert into public.support_ticket_audit(ticket_id,condominio_id,actor_id,old_status,new_status)
   values (new.id,new.condominio_id,auth.uid(),old.estado,new.estado);
  end if;
  return new;
 end;
 $$;
revoke all on function public.support_record_status_change() from public,anon,authenticated;
create trigger support_ticket_status_audit
 after update of estado on public.support_tickets
 for each row execute function public.support_record_status_change();
