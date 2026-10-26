import Link from 'next/link'
import {redirect} from 'next/navigation'
import {BarChart3,WalletCards,Receipt} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const money=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
const label=(month:string)=>new Intl.DateTimeFormat('es-PE',{month:'short',year:'2-digit',timeZone:'UTC'}).format(new Date(month+'-01T12:00:00Z'))
export default async function ReportesPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert">Error verificando autorización.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const labels=new Map((condos??[]).map(c=>[c.id,c.nombre]))
 const tables=['inmuebles','residentes','incidencias','tareas','comunicados','recibos','pagos'] as const
 const summary=current?await Promise.all(tables.map(table=>db.from(table).select('id',{count:'exact',head:true}).eq('condominio_id',current))):[]
 const failed=summary.some(r=>r.error)
 const now=new Date()
 const months=Array.from({length:12},(_,i)=>new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-11+i,1)).toISOString().slice(0,7))
 const since=months[0]+'-01'
 const [payments,receipts]=current?await Promise.all([
   db.from('pagos').select('id,monto,fecha_pago,estado').eq('condominio_id',current).gte('fecha_pago',since).order('fecha_pago',{ascending:false}).limit(1000),
   db.from('recibos').select('id,total,estado,fecha_emision').eq('condominio_id',current).gte('fecha_emision',since).order('fecha_emision',{ascending:false}).limit(1000)
 ]):[{data:[],error:null},{data:[],error:null}]
 const graphError=Boolean(payments.error||receipts.error)
 const payRows=payments.data??[],receiptRows=receipts.data??[]
 const monthly=months.map(key=>{const p=payRows.filter(x=>x.fecha_pago?.slice(0,7)===key&&x.estado==='validado');const r=receiptRows.filter(x=>x.fecha_emision?.slice(0,7)===key&&x.estado!=='anulado');return {key,cobrado:p.reduce((s,x)=>s+Number(x.monto||0),0),emitido:r.reduce((s,x)=>s+Number(x.total||0),0),cantidad:p.length}})
 const max=Math.max(1,...monthly.flatMap(x=>[x.cobrado,x.emitido]))
 const capped=payRows.length===1000||receiptRows.length===1000
 return <main className="mx-auto max-w-7xl space-y-6">
  <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href="/dashboard" className="text-sm text-sky-100">← Volver al Dashboard</Link><h1 className="mt-4 text-3xl font-extrabold">Reportes e indicadores</h1><p className="mt-2 text-sky-100">Análisis mensual de pagos y recibos por condominio autorizado, sin datos estimados.</p></header>
  <nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/reportes?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 '+(id===current?'bg-sky-800 text-white':'bg-white')}>{labels.get(id)||id.slice(0,8)}</Link>)}</nav>
  {!current?<p className="rounded-xl border bg-white p-6">No hay condominios asignados.</p>:null}
  {failed?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Algunas consultas fallaron; comprueba los permisos antes de utilizar este resumen.</p>:null}
  <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{tables.map((table,i)=><div key={table} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm font-semibold capitalize text-slate-500">{table}</p><p className="mt-3 text-3xl font-extrabold">{current&&!summary[i]?.error?summary[i]?.count??0:'—'}</p></div>)}</section>
  <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 text-xl font-extrabold"><BarChart3 className="text-sky-700"/> Histograma de pagos y recibos</h2><p className="mt-2 text-sm text-slate-500">Últimos 12 meses · pagos validados e importes de recibos emitidos</p></div><div className="flex gap-4 text-xs font-semibold"><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-sky-700"/> Cobrado</span><span className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-cyan-300"/> Emitido</span></div></div>
  {graphError?<p role="alert" className="mt-5 rounded-lg bg-red-50 p-4 text-red-700">No se pudieron consultar los movimientos financieros.</p>:null}
  {capped?<p role="status" className="mt-5 rounded-lg bg-amber-50 p-4 text-amber-900">Se alcanzó el límite de 1000 registros por consulta. Para evitar totales engañosos, el gráfico se oculta hasta implementar agregación en la base de datos.</p>:null}
  {!graphError&&!capped?<><div className="mt-6 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-sky-50 p-4"><WalletCards className="text-sky-700"/><p className="mt-2 text-xs text-slate-600">Pagos validados</p><p className="mt-1 text-xl font-bold">{money(monthly.reduce((s,x)=>s+x.cobrado,0))}</p></div><div className="rounded-xl bg-cyan-50 p-4"><Receipt className="text-cyan-800"/><p className="mt-2 text-xs text-slate-600">Recibos emitidos*</p><p className="mt-1 text-xl font-bold">{money(monthly.reduce((s,x)=>s+x.emitido,0))}</p></div><div className="rounded-xl bg-slate-50 p-4"><BarChart3 className="text-sky-700"/><p className="mt-2 text-xs text-slate-600">Número de pagos validados</p><p className="mt-1 text-xl font-bold">{monthly.reduce((s,x)=>s+x.cantidad,0)}</p></div></div><div className="mt-8 overflow-x-auto"><div className="flex h-72 min-w-[670px] items-end gap-3 border-b border-slate-300 px-1">{monthly.map(m=><div key={m.key} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2"><div className="flex h-[215px] items-end justify-center gap-1"><div title={label(m.key)+' cobrado: '+money(m.cobrado)} className="w-1/2 rounded-t-md bg-sky-700" style={{height:(m.cobrado?Math.max(2,m.cobrado/max*100):0)+'%'}}/><div title={label(m.key)+' emitido: '+money(m.emitido)} className="w-1/2 rounded-t-md bg-cyan-300" style={{height:(m.emitido?Math.max(2,m.emitido/max*100):0)+'%'}}/></div><span className="h-9 text-center text-[11px] font-semibold capitalize text-slate-600">{label(m.key)}</span></div>)}</div></div><p className="mt-5 text-xs text-slate-500">*El total emitido incluye recibos no anulados por fecha de emisión; no equivale al saldo de deuda. Los pagos se agrupan por fecha de pago, no fecha de validación.</p></>:null}
  </section>
  <p className="text-sm text-slate-500">Los indicadores superiores muestran cantidades de registros. Las barras se calculan a partir de movimientos reales del condominio seleccionado. Si una consulta falla, no se presentan importes incompletos.</p>
 </main>
}