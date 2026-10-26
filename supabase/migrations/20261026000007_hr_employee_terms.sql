-- Phase 2 draft; apply only after security review and isolated testing.
create table public.hr_employee_terms (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null references public.condominios(id),
 personal_id uuid not null references public.personal(id),
 vinculo text not null check(vinculo in ('dependiente','independiente')),
 regimen text not null default 'pendiente_verificacion',
 moneda text not null default 'PEN' check(moneda='PEN'),
 sueldo_base numeric(12,2) not null default 0 check(sueldo_base>=0),
 honorario_referencial numeric(12,2) not null default 0 check(honorario_referencial>=0),
 jornada_horas numeric(5,2) check(jornada_horas>0 and jornada_horas<=24),
 fecha_inicio date not null,
 fecha_fin date,
 periodicidad text not null default 'mensual' check(periodicidad in ('mensual','quincenal')),
 observaciones text check(char_length(observaciones)<=1000),
 created_at timestamptz not null default now(),
 unique(condominio_id,personal_id),
 check(fecha_fin is null or fecha_fin>=fecha_inicio)
);
create index hr_employee_terms_condo on public.hr_employee_terms(condominio_id);
alter table public.hr_employee_terms enable row level security;
revoke all on public.hr_employee_terms from anon,authenticated;
grant select,insert,update on public.hr_employee_terms to authenticated;
create policy "hr terms read admin only" on public.hr_employee_terms for select to authenticated using (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_employee_terms.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin','junta'))
);
create policy "hr terms insert admin only" on public.hr_employee_terms for insert to authenticated with check (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_employee_terms.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin','junta'))
 and exists(select 1 from public.personal p where p.id=hr_employee_terms.personal_id and p.condominio_id=hr_employee_terms.condominio_id)
);
create policy "hr terms update admin only" on public.hr_employee_terms for update to authenticated using (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_employee_terms.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin','junta'))
) with check (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_employee_terms.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin','junta'))
 and exists(select 1 from public.personal p where p.id=hr_employee_terms.personal_id and p.condominio_id=hr_employee_terms.condominio_id)
);
