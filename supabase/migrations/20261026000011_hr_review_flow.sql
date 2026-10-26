-- Payroll controlled review (draft -> in_review -> draft). Approval stays disabled.
create table public.hr_payroll_audit (
 id uuid primary key default gen_random_uuid(),
 payroll_id uuid not null references public.hr_payroll_periods(id),
 actor_id uuid not null references auth.users(id),
 from_state text not null,
 to_state text not null,
 happened_at timestamptz not null default now()
);
create index hr_payroll_audit_period on public.hr_payroll_audit(payroll_id,happened_at);
alter table public.hr_payroll_audit enable row level security;
revoke all on public.hr_payroll_audit from anon,authenticated;
grant select on public.hr_payroll_audit to authenticated;
create policy "admin payroll audit read" on public.hr_payroll_audit for select to authenticated
using(exists(select 1 from public.hr_payroll_periods p join public.condominio_usuarios m on m.condominio_id=p.condominio_id where p.id=hr_payroll_audit.payroll_id and m.user_id=(select auth.uid()) and m.is_active and m.role::text in ('admin','super_admin')));
create or replace function public.hr_transition_payroll_review(p_payroll_id uuid,p_action text)
returns text language plpgsql security definer set search_path='' as $$
declare r public.hr_payroll_periods%rowtype; target_state text;
begin
 if (select auth.uid()) is null then raise exception 'No autorizado'; end if;
 select * into r from public.hr_payroll_periods where id=p_payroll_id for update;
 if not found then raise exception 'Planilla inexistente'; end if;
 if not exists(select 1 from public.condominio_usuarios m where m.condominio_id=r.condominio_id and m.user_id=(select auth.uid()) and m.is_active and m.role::text in ('admin','super_admin')) then raise exception 'Sin permisos'; end if;
 if p_action='enviar_revision' and r.estado='borrador' then target_state:='en_revision';
 elsif p_action='devolver_borrador' and r.estado='en_revision' then target_state:='borrador';
 else raise exception 'Transición no permitida'; end if;
 update public.hr_payroll_periods set estado=target_state where id=r.id;
 insert into public.hr_payroll_audit(payroll_id,actor_id,from_state,to_state) values(r.id,(select auth.uid()),r.estado,target_state);
 return target_state;
end $$;
revoke all on function public.hr_transition_payroll_review(uuid,text) from public,anon;
grant execute on function public.hr_transition_payroll_review(uuid,text) to authenticated;
