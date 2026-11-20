create function public.finanzas_cierre_cobranza(p_condominio uuid,p_mes date)
returns jsonb
language plpgsql stable security invoker set search_path='' as $$
declare
 hoy date := (now() at time zone 'America/Lima')::date;
 corte date := least(hoy,(p_mes+interval '1 month - 1 day')::date);
 resultado jsonb;
begin
 if public.tiene_rol_condominio(p_condominio,array['super_admin','admin','junta']::text[]) is not true then
  raise exception using errcode='42501', message='SIN_PERMISOS_CIERRE';
 end if;
 if p_mes is null or extract(day from p_mes)<>1 or p_mes>hoy then
  raise exception using errcode='22023', message='PERIODO_INVALIDO';
 end if;

 with abonos as (
  select recibo_id,
   sum(monto) filter(where fecha_pago<p_mes) as antes,
   sum(monto) filter(where fecha_pago<=corte) as hasta
  from public.pagos
  where condominio_id=p_condominio and estado='validado'
    and recibo_id is not null and fecha_pago<=corte
  group by recibo_id
 ), recibos as (
  select r.id,r.codigo,r.periodo,i.codigo as unidad,r.fecha_emision,r.fecha_vencimiento,r.total,
   coalesce(a.hasta,0) as aplicado,
   case when r.fecha_emision<p_mes then greatest(r.total-coalesce(a.antes,0),0) else 0 end as saldo_inicial,
   greatest(r.total-coalesce(a.hasta,0),0) as saldo,
   greatest(coalesce(a.hasta,0)-r.total,0) as excedente
  from public.recibos r
  left join abonos a on a.recibo_id=r.id
  left join public.inmuebles i on i.id=r.inmueble_id and i.condominio_id=r.condominio_id
  where r.condominio_id=p_condominio and r.estado<>'anulado' and r.fecha_emision<=corte
 ), cartera as (
  select *, case when fecha_vencimiento<corte then corte-fecha_vencimiento else 0 end as dias_vencido
  from recibos where fecha_emision>=p_mes or saldo_inicial>0 or saldo>0 or excedente>0
 ), pagos as (
  select p.id,p.fecha_pago,p.numero_operacion,p.monto,p.estado,r.codigo as recibo
  from public.pagos p
  left join public.recibos r on r.id=p.recibo_id and r.condominio_id=p.condominio_id
  where p.condominio_id=p_condominio and p.fecha_pago between p_mes and corte
 )
 select jsonb_build_object(
  'corte',corte,
  'saldo_inicial',coalesce((select sum(saldo_inicial) from cartera),0),
  'emitido',coalesce((select sum(total) from cartera where fecha_emision>=p_mes),0),
  'recaudado',coalesce((select sum(monto) from pagos where estado='validado'),0),
  'saldo_al_corte',coalesce((select sum(saldo) from cartera),0),
  'vencido',coalesce((select sum(saldo) from cartera where dias_vencido>0),0),
  'tramos',jsonb_build_array(
   coalesce((select sum(saldo) from cartera where dias_vencido between 1 and 30),0),
   coalesce((select sum(saldo) from cartera where dias_vencido between 31 and 60),0),
   coalesce((select sum(saldo) from cartera where dias_vencido between 61 and 90),0),
   coalesce((select sum(saldo) from cartera where dias_vencido>90),0)
  ),
  'recibos',coalesce((select jsonb_agg(to_jsonb(c) order by c.fecha_emision,c.id) from cartera c),'[]'::jsonb),
  'pagos',coalesce((select jsonb_agg(to_jsonb(p) order by p.fecha_pago,p.id) from pagos p),'[]'::jsonb)
 ) into resultado;
 return resultado;
end;
$$;
revoke all on function public.finanzas_cierre_cobranza(uuid,date) from public,anon,authenticated;
grant execute on function public.finanzas_cierre_cobranza(uuid,date) to authenticated;
