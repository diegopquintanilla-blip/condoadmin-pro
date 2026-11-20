create view public.finanzas_saldos_recibos with (security_invoker = true) as
select r.id, r.condominio_id, r.inmueble_id, r.codigo, r.periodo, r.total,
       r.estado, r.fecha_vencimiento, r.created_at,
       coalesce(p.validado,0) as pagado,
       r.total-coalesce(p.validado,0) as saldo,
       i.codigo as unidad
from public.recibos r
left join lateral (
  select sum(monto) as validado from public.pagos
  where condominio_id=r.condominio_id and recibo_id=r.id and estado='validado'
) p on true
left join public.inmuebles i on i.id=r.inmueble_id and i.condominio_id=r.condominio_id;

create index if not exists pagos_validado_por_recibo
  on public.pagos(condominio_id,recibo_id) where estado='validado';
create index if not exists pagos_referencia_finanzas
  on public.pagos(condominio_id,lower(btrim(numero_operacion)))
  where numero_operacion is not null and estado in ('validado','pendiente_validar');
create index if not exists pagos_pendientes_finanzas
  on public.pagos(condominio_id,created_at,id) where estado='pendiente_validar';

create view public.finanzas_pagos_por_validar with (security_invoker = true) as
select p.id,p.condominio_id,p.created_at,p.fecha_pago,p.metodo,p.numero_operacion,p.monto,p.observacion,
       r.codigo as recibo,r.periodo,coalesce(r.unidad,i.codigo) as unidad,r.saldo,
       coalesce(c.archivo_url,p.comprobante_url) as comprobante,
       exists (
         select 1 from public.pagos otro
         where otro.condominio_id=p.condominio_id and otro.id<>p.id
           and otro.numero_operacion is not null and otro.estado in ('validado','pendiente_validar')
           and lower(btrim(otro.numero_operacion))=lower(nullif(btrim(p.numero_operacion),''))
       ) as referencia_repetida
from public.pagos p
left join public.finanzas_saldos_recibos r on r.id=p.recibo_id and r.condominio_id=p.condominio_id
left join public.inmuebles i on i.id=p.inmueble_id and i.condominio_id=p.condominio_id
left join lateral (
  select archivo_url from public.comprobantes_pago
  where condominio_id=p.condominio_id and pago_id=p.id and nullif(btrim(archivo_url),'') is not null
  order by created_at desc,id desc limit 1
) c on true
where p.estado='pendiente_validar';

revoke all on public.finanzas_saldos_recibos, public.finanzas_pagos_por_validar from public,anon,authenticated;
grant select on public.finanzas_saldos_recibos, public.finanzas_pagos_por_validar to authenticated;

create function public.finanzas_resumen_operativo(p_condominio uuid,p_mes date)
returns table(recaudado numeric,por_cobrar numeric,vencido numeric,por_validar bigint)
language sql stable security invoker set search_path='' as $$
  select
    (select coalesce(sum(monto),0) from public.pagos
      where condominio_id=p_condominio and estado='validado'
        and fecha_pago>=p_mes and fecha_pago<p_mes+interval '1 month'),
    coalesce(sum(r.saldo) filter (where r.saldo>0),0),
    coalesce(sum(r.saldo) filter (where r.saldo>0 and r.fecha_vencimiento<(now() at time zone 'America/Lima')::date),0),
    (select count(*) from public.pagos where condominio_id=p_condominio and estado='pendiente_validar')
  from public.finanzas_saldos_recibos r
  where r.condominio_id=p_condominio and r.periodo=to_char(p_mes,'YYYY-MM') and r.estado<>'anulado';
$$;
revoke all on function public.finanzas_resumen_operativo(uuid,date) from public,anon,authenticated;
grant execute on function public.finanzas_resumen_operativo(uuid,date) to authenticated;
