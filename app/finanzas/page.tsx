import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {Wallet,Receipt,Landmark,ArrowLeft} from 'lucide-react'
const money=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
export default async function FinanzasPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No es posible verificar permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const labels=new Map((condos??[]).map(x=>[x.id,x.nombre]))
 const [receipts,payments,config]=current?await Promise.all([
  db.from('recibos').select('id,codigo,periodo,fecha_vencimiento,total,estado',{count:'exact'}).eq('condominio_id',current).order('created_at',{ascending:false}).limit(50),
  db.from('pagos').select('id,monto,fecha_pago,estado,metodo,numero_operacion',{count:'exact'}).eq('condominio_id',current).order('created_at',{ascending:false}).limit(50),
  db.from('finanzas_config').select('mantenimiento_base,mora_base,dia_corte,dia_vencimiento').eq('condominio_id',current).maybeSingle()
 ]):[{data:[],error:null,count:0},{data:[],error:null,count:0},{data:null,error:null}]
 const hasError=Boolean(receipts.error||payments.error||config.error)
 const r=receipts.data??[],p=payments.data??[]
 const owed=r.filter(x=>['pendiente','emitido','vencido'].includes(String(x.estado))).reduce((s,x)=>s+Number(x.total||0),0)
 const validated=p.filter(x=>x.estado==='validado').reduce((s,x)=>s+Number(x.monto||0),0)
 return <main className="mx-auto max-w-7xl space-y-7">
  <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Dashboard</Link><h1 className="mt-5 text-3xl font-extrabold">Finanzas administrativas</h1><p className="mt-2 text-sm text-blue-100">Consulta de recibos, pagos y configuración de cobranza de cada condominio.</p></header>
  {!current?<section className="rounded-xl border border-amber-200 bg-amber-50 p-6">No hay condominios asignados. <Link href="/configuracion-inicial" className="font-semibold underline">Configurar primer condominio</Link></section>:null}
  {current&&<nav aria-label="Seleccionar condominio" className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/modulos/finanzas?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm font-semibold '+(id===current?'bg-sky-800 text-white':'bg-white text-slate-700')}>{labels.get(id)||id.slice(0,8)}</Link>)}</nav>}
  {hasError?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Error al consultar datos financieros. No se muestran datos estimados.</p>:null}
  <div className="grid gap-4 md:grid-cols-3">{[{name:'Recibos consultados',value:String(receipts.count??0),Icon:Receipt},{name:'Pendiente en los últimos 50 recibos',value:money(owed),Icon:Wallet},{name:'Validado en los últimos 50 pagos',value:money(validated),Icon:Landmark}].map(({name,value,Icon})=><div key={name} className="rounded-2xl border bg-white p-6 shadow-sm"><Icon className="text-sky-700"/><p className="mt-4 text-sm text-slate-500">{name}</p><strong className="mt-2 block text-2xl">{current&&!hasError?value:'—'}</strong></div>)}</div>
  <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Configuración financiera</h2>{config.data?<div className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><p>Mantenimiento base: <strong>{money(Number(config.data.mantenimiento_base||0))}</strong></p><p>Mora base: <strong>{money(Number(config.data.mora_base||0))}</strong></p><p>Día de corte: <strong>{config.data.dia_corte??'—'}</strong></p><p>Día de vencimiento: <strong>{config.data.dia_vencimiento??'—'}</strong></p></div>:<p className="mt-3 text-sm text-slate-500">Sin configuración financiera registrada.</p>}</section>
  <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><h2 className="p-6 text-lg font-bold">Últimos recibos</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Código','Periodo','Vencimiento','Estado','Total'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{r.map(x=><tr className="border-t" key={x.id}><td className="p-4">{x.codigo}</td><td className="p-4">{x.periodo}</td><td className="p-4">{x.fecha_vencimiento??'—'}</td><td className="p-4">{x.estado}</td><td className="p-4">{money(Number(x.total||0))}</td></tr>)}</tbody></table></div>{!r.length?<p className="p-6 text-sm text-slate-500">No hay recibos registrados.</p>:null}</section>
  <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><h2 className="p-6 text-lg font-bold">Últimos pagos</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Fecha','Método','Operación','Estado','Monto'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{p.map(x=><tr className="border-t" key={x.id}><td className="p-4">{x.fecha_pago??'—'}</td><td className="p-4">{x.metodo}</td><td className="p-4">{x.numero_operacion??'—'}</td><td className="p-4">{x.estado}</td><td className="p-4">{money(Number(x.monto||0))}</td></tr>)}</tbody></table></div>{!p.length?<p className="p-6 text-sm text-slate-500">No hay pagos registrados.</p>:null}</section>
  <p className="text-xs text-slate-500">Los importes mostrados resumen solo los últimos 50 registros de cada tipo. No representan totales contables completos.</p>
 </main>
}