-- HR phase 5: immutable monthly payroll snapshots, draft only until reviewed.
create table public.hr_payroll_periods (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null references public.condominios(id),
 periodo date not null check(extract(day from periodo)=1),
 estado text not null default 'borrador' check(estado in ('borrador','en_revision','aprobada','cerrada')),
 notas text check(char_length(notas)<=1500),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 unique(condominio_id,periodo),
 unique(id,condominio_id)
);
create table public.hr_payroll_lines (
 id uuid primary key default gen_random_uuid(),
 payroll_id uuid not null,
 condominio_id uuid not null,
 personal_id uuid not null references public.personal(id),
 bruto numeric(12,2) not null check(bruto>=0),
 descuentos numeric(12,2) not null default 0 check(descuentos>=0),
 neto numeric(12,2) generated always as (bruto-descuentos) stored,
 snapshot jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(),
 unique(payroll_id,personal_id),
 foreign key(payroll_id,condominio_id) references public.hr_payroll_periods(id,condominio_id),
 check(bruto>=descuentos),
 check(jsonb_typeof(snapshot)='object')
);
create index hr_payroll_lines_period on public.hr_payroll_lines(payroll_id);
alter table public.hr_payroll_periods enable row level security;
alter table public.hr_payroll_lines enable row level security;
revoke all on public.hr_payroll_periods,public.hr_payroll_lines from anon,authenticated;
grant select on public.hr_payroll_periods,public.hr_payroll_lines to authenticated;
grant insert on public.hr_payroll_periods to authenticated;
create policy "admin only read payroll periods" on public.hr_payroll_periods for select to authenticated
 using(exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_periods.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin')));
create policy "admin only read payroll lines" on public.hr_payroll_lines for select to authenticated
 using(exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_lines.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin')));
-- No client writes until atomic creation, approval, audit and legal calculations are tested.

-- Draft creation: cannot submit any other initial state.
create policy "hr payroll create own draft" on public.hr_payroll_periods for insert to authenticated
 with check (estado='borrador' and created_by=(select auth.uid()) and exists (
 select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_periods.condominio_id
 and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin')));
-- Payroll lines and period state updates remain read-only for all browser clients.

-- Controlled line editing, limited to open drafts; employee must belong to the same condo.
grant insert,update on public.hr_payroll_lines to authenticated;
create policy "hr payroll line insert draft" on public.hr_payroll_lines for insert to authenticated with check (
 exists(select 1 from public.hr_payroll_periods period where period.id=hr_payroll_lines.payroll_id and period.condominio_id=hr_payroll_lines.condominio_id and period.estado='borrador')
 and exists(select 1 from public.personal p where p.id=hr_payroll_lines.personal_id and p.condominio_id=hr_payroll_lines.condominio_id)
 and exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_lines.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
);
create policy "hr payroll line update draft" on public.hr_payroll_lines for update to authenticated using (
 exists(select 1 from public.hr_payroll_periods period where period.id=hr_payroll_lines.payroll_id and period.condominio_id=hr_payroll_lines.condominio_id and period.estado='borrador')
 and exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_lines.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
) with check (
 exists(select 1 from public.hr_payroll_periods period where period.id=hr_payroll_lines.payroll_id and period.condominio_id=hr_payroll_lines.condominio_id and period.estado='borrador')
 and exists(select 1 from public.personal p where p.id=hr_payroll_lines.personal_id and p.condominio_id=hr_payroll_lines.condominio_id)
 and exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_payroll_lines.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
);
