-- Guardar la revisión de planillas vacías a nivel de base de datos.
create or replace function public.hr_guard_review_has_lines()
returns trigger language plpgsql set search_path='' as $$
begin
 if new.estado='en_revision' and old.estado='borrador' then
  if not exists (
   select 1 from public.hr_payroll_lines l
   where l.payroll_id=new.id and l.condominio_id=new.condominio_id
  ) then
   raise exception 'La planilla requiere al menos un trabajador antes de enviarla a revisión';
  end if;
 end if;
 return new;
end
$$;
drop trigger if exists hr_guard_review_has_lines on public.hr_payroll_periods;
create trigger hr_guard_review_has_lines before update of estado on public.hr_payroll_periods
for each row execute function public.hr_guard_review_has_lines();
