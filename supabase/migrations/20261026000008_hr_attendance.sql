-- Fase 3: control mensual de asistencia. Borrador, no aplicar a producción hasta pruebas RLS.
create table public.hr_attendance (
 id uuid primary key default gen_random_uuid(),
 condominio_id uuid not null references public.condominios(id),
 personal_id uuid not null references public.personal(id),
 fecha date not null,
 tipo text not null check(tipo in ('trabajado','descanso','falta','vacaciones','licencia','feriado')),
 horas_ordinarias numeric(5,2) not null default 0 check(horas_ordinarias between 0 and 24),
 horas_extra_25 numeric(5,2) not null default 0 check(horas_extra_25 between 0 and 24),
 horas_extra_35 numeric(5,2) not null default 0 check(horas_extra_35 between 0 and 24),
 observaciones text check(char_length(observaciones)<=500),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 unique(condominio_id,personal_id,fecha),
 check(horas_ordinarias+horas_extra_25+horas_extra_35<=24)
);
create index hr_attendance_month on public.hr_attendance(condominio_id,fecha,personal_id);
alter table public.hr_attendance enable row level security;
revoke all on public.hr_attendance from anon,authenticated;
grant select,insert,update on public.hr_attendance to authenticated;
create policy "hr attendance admin read" on public.hr_attendance for select to authenticated using (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_attendance.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
);
create policy "hr attendance admin insert" on public.hr_attendance for insert to authenticated with check (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_attendance.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
 and exists(select 1 from public.personal p where p.id=hr_attendance.personal_id and p.condominio_id=hr_attendance.condominio_id)
);
create policy "hr attendance admin update" on public.hr_attendance for update to authenticated using (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_attendance.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
) with check (
 exists(select 1 from public.condominio_usuarios m where m.condominio_id=hr_attendance.condominio_id and m.user_id=(select auth.uid()) and m.is_active=true and m.role::text in ('admin','super_admin'))
 and exists(select 1 from public.personal p where p.id=hr_attendance.personal_id and p.condominio_id=hr_attendance.condominio_id)
);
