-- Restrict the existing Personal module to condo administrators only.
drop policy if exists personal_select_member on public.personal;
drop policy if exists personal_insert_admin on public.personal;
drop policy if exists personal_update_admin on public.personal;
drop policy if exists personal_delete_admin on public.personal;
create policy personal_select_admin on public.personal for select to authenticated
 using (public.tiene_rol_condominio(condominio_id,array['super_admin','admin']::text[]));
create policy personal_insert_admin on public.personal for insert to authenticated
 with check (public.tiene_rol_condominio(condominio_id,array['super_admin','admin']::text[]));
create policy personal_update_admin on public.personal for update to authenticated
 using (public.tiene_rol_condominio(condominio_id,array['super_admin','admin']::text[]))
 with check (public.tiene_rol_condominio(condominio_id,array['super_admin','admin']::text[]));
create policy personal_delete_admin on public.personal for delete to authenticated
 using (public.tiene_rol_condominio(condominio_id,array['super_admin','admin']::text[]));
