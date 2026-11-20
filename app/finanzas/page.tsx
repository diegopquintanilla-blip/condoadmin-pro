import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {Wallet,Landmark,ArrowLeft,Clock3,ShieldCheck,ArrowUpRight} from 'lucide-react'
import {FinanzasConfiguracion} from '@/components/finanzas/FinanzasConfiguracion'
import {EmitirRecibo} from '@/components/finanzas/EmitirRecibo'
import {RegistrarPago} from '@/components/finanzas/RegistrarPago'
import {ValidarPagos} from '@/components/finanzas/ValidarPagos'
const money=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
export default async function FinanzasPage({searchParams}:{searchParams:Promise<{condominio?:string;periodo?:string;pagos?:string;paginaPagos?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No es posible verificar permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const params=await searchParams
 const requested=params.condominio
 const mesActual=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit'}).format(new Date())
 const periodo=typeof params.periodo==='string'&&/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/.test(params.periodo)?params.periodo:mesActual
 const validados=params.pagos==='validados'
 const paginaPagos=Math.max(1,Math.min(100000,parseInt(params.paginaPagos||'1',10)||1))
 const limitePagos=50
 const siguiente=new Date(periodo+'-01T00:00:00Z')
 siguiente.setUTCMonth(siguiente.getUTCMonth()+1)
 const hasta=siguiente.toISOString().split('T')[0]
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const labels=new Map((condos??[]).map(x=>[x.id,x.nombre]))
 const canEdit=Boolean(current&&(members??[]).some(m=>m.condominio_id===current&&['super_admin','admin','junta'].includes(String(m.role))))
 const pagosDelPeriodo=db.from('pagos').select('id,monto,fecha_pago,estado,metodo,numero_operacion',{count:'exact'}).eq('condominio_id',current).gte('fecha_pago',periodo+'-01').lt('fecha_pago',hasta)
 const [receipts,payments,config,resumen,pendientes]=current?await Promise.all([
  db.from('recibos').select('id,codigo,periodo,fecha_vencimiento,total,estado',{count:'exact'}).eq('condominio_id',current).order('created_at',{ascending:false}).limit(50),
  (validados?pagosDelPeriodo.eq('estado','validado'):pagosDelPeriodo).order('fecha_pago',{ascending:false}).order('id').range((paginaPagos-1)*limitePagos,paginaPagos*limitePagos-1),
  db.from('finanzas_config').select('mantenimiento_base,mora_base,dia_corte,dia_vencimiento,permitir_pagos_adelantados,generar_recibos_auto').eq('condominio_id',current).maybeSingle(),
  db.rpc('finanzas_resumen_operativo',{p_condominio:current,p_mes:periodo+'-01'}).single(),
  canEdit?db.from('finanzas_pagos_por_validar').select('*').eq('condominio_id',current).order('created_at').order('id').limit(50):{data:[],error:null}
 ]):[{data:[],error:null,count:0},{data:[],error:null,count:0},{data:null,error:null},{data:null,error:null},{data:[],error:null}]
 const {data:properties,error:propertiesError}=current?await db.from('inmuebles').select('id,codigo').eq('condominio_id',current).order('codigo').limit(100):{data:[],error:null}

 const history=current&&canEdit?await db.from('pagos_validacion_historial').select('id,pago_id,actor_id,estado_anterior,estado_nuevo,monto,created_at').eq('condominio_id',current).order('created_at',{ascending:false}).limit(30):{data:[],error:null}
 const hasError=Boolean(receipts.error||payments.error||config.error||propertiesError||history.error||resumen.error||pendientes.error)
 const r=receipts.data??[],p=payments.data??[]
 const totals=resumen.data as {recaudado:number;por_cobrar:number;vencido:number;por_validar:number}|null
 const scope=new URLSearchParams({condominio:current||'',periodo}).toString()
 const conciliacion='/finanzas/conciliacion?'+scope
 const paginaDePagos=(n:number)=>'/finanzas?'+scope+(validados?'&pagos=validados':'')+'&paginaPagos='+n+'#pagos-del-periodo'
 return <main className="mx-auto max-w-7xl space-y-7">
  <header className="rounded-[28px] border border-white/10 shadow-xl bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Dashboard</Link><h1 className="mt-5 text-3xl font-extrabold">Finanzas administrativas</h1><p className="mt-2 text-sm text-blue-100">Consulta de recibos, pagos y configuración de cobranza de cada condominio.</p></header>
  {!current?<section className="rounded-xl border border-amber-200 bg-amber-50 p-6">No hay condominios asignados. <Link href="/configuracion-inicial" className="font-semibold underline">Configurar primer condominio</Link></section>:null}
  {current&&<nav aria-label="Seleccionar condominio" className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/finanzas?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm font-semibold '+(id===current?'bg-sky-800 text-white':'bg-white text-slate-700')}>{labels.get(id)||id.slice(0,8)}</Link>)}</nav>}
  {hasError?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Error al consultar datos financieros. No se muestran datos estimados.</p>:null}
  {current&&<section className="space-y-4" aria-labelledby="resumen-finanzas">
   <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 id="resumen-finanzas" className="text-xl font-extrabold">Resumen de cobranza</h2><p className="text-sm text-slate-600">Saldos al día, descontando pagos validados.</p></div>
    <form className="flex items-end gap-2"><input type="hidden" name="condominio" value={current}/><label className="grid gap-1 text-sm font-semibold">Periodo<input type="month" name="periodo" defaultValue={periodo} required className="rounded-lg border border-slate-300 bg-white px-3 py-2"/></label><button className="rounded-lg bg-sky-800 px-4 py-2 font-semibold text-white">Aplicar</button></form>
   </div>
   <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
    {name:'Recaudado',value:totals&&money(totals.recaudado),detail:'Pagos validados del mes',href:'/finanzas?'+scope+'&pagos=validados#pagos-del-periodo',Icon:Landmark},
    {name:'Por cobrar',value:totals&&money(totals.por_cobrar),detail:'Saldo de recibos del periodo',href:conciliacion+'&estado=pendiente',Icon:Wallet},
    {name:'Vencido',value:totals&&money(totals.vencido),detail:'Saldo vencido del periodo',href:conciliacion+'&estado=vencido',Icon:Clock3},
    {name:'Por validar',value:totals&&String(totals.por_validar),detail:'Pagos pendientes de todos los periodos',href:canEdit?'#validar-pagos':undefined,Icon:ShieldCheck},
   ].map(({name,value,detail,href,Icon})=>{
    const content=<><div className="flex items-center justify-between"><Icon size={21} className="text-sky-700" aria-hidden="true"/>{href&&<ArrowUpRight size={17} className="text-slate-500" aria-hidden="true"/>}</div><p className="mt-3 text-sm font-semibold">{name}</p><strong className="block text-2xl tabular-nums">{value??'—'}</strong><p className="mt-1 text-xs text-slate-600">{detail}</p></>
    const style='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'
    return href?<Link key={name} className={style+' hover:border-sky-400'} href={href}>{content}</Link>:<div key={name} className={style}>{content}</div>
   })}</div>
   <Link href={conciliacion} className="inline-block text-sm font-bold text-sky-800 underline">Ver conciliación del periodo</Link>
  </section>}
  {current&&canEdit&&(pendientes.error?<p id="validar-pagos" role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudo cargar la bandeja de validación.</p>:<ValidarPagos key={current} condominioId={current} pagos={pendientes.data??[]} total={totals?.por_validar}/>)}
  {current&&!config.error?<FinanzasConfiguracion key={current} condominioId={current} initial={config.data} canEdit={(members??[]).some(m=>m.condominio_id===current&&['super_admin','admin','junta'].includes(String(m.role)))}/>:null}
  {current&&!propertiesError?<EmitirRecibo key={current} condominioId={current} properties={(properties??[]).map(x=>({id:String(x.id),codigo:String(x.codigo)}))} canEdit={canEdit}/>:null}
  <section className="rounded-[22px] border border-slate-200/70 bg-white shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)] p-6 shadow-sm"><h2 className="text-lg font-bold">Configuración financiera vigente</h2>{config.data?<div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p>Mantenimiento base: <strong>{money(Number(config.data.mantenimiento_base||0))}</strong></p><p>Mora base: <strong>{money(Number(config.data.mora_base||0))}</strong></p><p>Día de corte: <strong>{config.data.dia_corte??'—'}</strong></p><p>Día de vencimiento: <strong>{config.data.dia_vencimiento??'—'}</strong></p></div>:<p className="mt-3 text-sm text-slate-500">Sin configuración financiera registrada.</p>}</section>
  {current&&!receipts.error?<RegistrarPago key={current} condominioId={current} recibos={r.map(x=>({id:String(x.id),codigo:x.codigo,total:Number(x.total),estado:String(x.estado)}))}/>:null}
  <section className="overflow-hidden rounded-[22px] border border-slate-200/70 bg-white shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)] shadow-sm"><h2 className="p-6 text-lg font-bold">Últimos recibos</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Código','Periodo','Vencimiento','Estado','Total'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{r.map(x=><tr className="border-t" key={x.id}><td className="p-4">{x.codigo}</td><td className="p-4">{x.periodo}</td><td className="p-4">{x.fecha_vencimiento??'—'}</td><td className="p-4">{x.estado}</td><td className="p-4">{money(Number(x.total||0))}</td></tr>)}</tbody></table></div>{!r.length?<p className="p-6 text-sm text-slate-500">No hay recibos registrados.</p>:null}</section>
  <section id="pagos-del-periodo" className="scroll-mt-24 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-2 p-6"><h2 className="text-lg font-bold">{validados?'Pagos validados':'Pagos del periodo'} · {periodo}</h2>{validados&&<Link href={'/finanzas?'+scope+'#pagos-del-periodo'} className="text-sm font-semibold text-sky-800 underline">Ver todos los estados</Link>}</div>{(payments.count??0)>p.length&&<p className="px-6 pb-3 text-sm text-slate-600">Página {paginaPagos} · {payments.count} pagos en total.</p>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Fecha','Método','Operación','Estado','Monto'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{p.map(x=><tr className="border-t" key={x.id}><td className="p-4">{x.fecha_pago??'—'}</td><td className="p-4">{x.metodo}</td><td className="p-4">{x.numero_operacion??'—'}</td><td className="p-4">{x.estado}</td><td className="p-4">{money(Number(x.monto||0))}</td></tr>)}</tbody></table></div>{!p.length?<p className="p-6 text-sm text-slate-500">No hay pagos en esta página.</p>:null}<div className="flex gap-2 px-6 pb-4 text-sm">{paginaPagos>1&&<Link className="font-semibold text-sky-800 underline" href={paginaDePagos(paginaPagos-1)}>Anterior</Link>}{paginaPagos*limitePagos<(payments.count??0)&&<Link className="font-semibold text-sky-800 underline" href={paginaDePagos(paginaPagos+1)}>Siguiente</Link>}</div></section>
  {current&&canEdit?<section className="overflow-x-auto rounded-[22px] border border-slate-200/70 bg-white shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)] p-6 shadow-sm"><h2 className="text-lg font-bold">Historial de validaciones de pagos</h2><p className="mt-1 text-sm text-slate-500">Últimas 30 decisiones registradas automáticamente en la base de datos.</p>{history.error?<p role="alert" className="mt-3 text-red-700">No se pudo cargar el historial.</p>:!history.data?.length?<p className="mt-4 text-sm text-slate-500">Todavía no hay decisiones de validación registradas.</p>:<div className="mt-4 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr>{['Fecha','Pago','Responsable','Decisión','Importe'].map(x=><th key={x} className="p-3">{x}</th>)}</tr></thead><tbody>{history.data.map(x=><tr key={x.id} className="border-t"><td className="p-3">{new Date(x.created_at).toLocaleString('es-PE')}</td><td className="p-3">{String(x.pago_id).slice(0,8)}</td><td className="p-3">{x.actor_id?String(x.actor_id).slice(0,8):'Sistema'}</td><td className="p-3">{x.estado_anterior} → {x.estado_nuevo}</td><td className="p-3">{money(Number(x.monto))}</td></tr>)}</tbody></table></div>}</section>:null}
  <p className="text-xs text-slate-500">El listado de recibos muestra los últimos 50 registros. El resumen usa todos los movimientos correspondientes al periodo.</p>
 </main>
}