import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const soles=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
export default async function ConciliacionPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-6">No se pudo verificar permisos.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const params=await searchParams
 const selected=params.condominio&&ids.includes(params.condominio)?params.condominio:ids[0]
 const page=Math.max(1,Math.min(100000,parseInt(params.pagina||'1',10)||1))
 const limit=25
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const names=new Map((condos??[]).map(x=>[x.id,x.nombre]))
 const receipts=selected?await db.from('recibos').select('id,codigo,periodo,total,estado,fecha_vencimiento',{count:'exact'}).eq('condominio_id',selected).order('created_at',{ascending:false}).range((page-1)*limit,page*limit-1):{data:[],error:null,count:0}
 const receiptIds=(receipts.data??[]).map(r=>r.id)
 const payments=receiptIds.length?await db.from('pagos').select('id,recibo_id,monto,estado').eq('condominio_id',selected).in('recibo_id',receiptIds).eq('estado','validado').limit(1000):{data:[],error:null}
 const error=Boolean(receipts.error||payments.error)
 const incomplete=(payments.data?.length??0)>=1000
 const totals=new Map<string,number>()
 for(const p of payments.data??[])if(p.recibo_id)totals.set(p.recibo_id,(totals.get(p.recibo_id)??0)+Number(p.monto||0))
 return <main className="mx-auto max-w-7xl space-y-6">
 <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href="/finanzas" className="text-sm text-sky-100">← Volver a Finanzas</Link><h1 className="mt-4 text-3xl font-bold">Conciliación de recibos</h1><p className="mt-2 text-sky-100">Saldos calculados a partir de pagos validados; no modifica montos ni estados.</p></header>
 <nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} className={'rounded-xl border px-4 py-2 '+(id===selected?'bg-sky-800 text-white':'bg-white')} href={'/finanzas/conciliacion?condominio='+encodeURIComponent(id)}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>
 {!selected?<p className="rounded-xl border bg-white p-6">No hay condominios autorizados.</p>:null}
 {error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No fue posible consultar la conciliación. No se muestran cifras estimadas.</p>:null}
 {payments.data?.length===1000?<p className="rounded-xl bg-amber-50 p-4 text-sm">Hay más de 1000 pagos validados en este lote. Los saldos no deben considerarse completos; se requiere ampliar la paginación de pagos.</p>:null}
 <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Recibo','Periodo','Estado','Total','Pagos validados','Saldo','Observación'].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{!error&&(receipts.data??[]).map(r=>{const total=Number(r.total||0),paid=totals.get(r.id)??0,balance=total-paid;return <tr key={r.id} className="border-t"><td className="p-4 font-semibold">{r.codigo||r.id.slice(0,8)}</td><td className="p-4">{r.periodo||'—'}</td><td className="p-4">{r.estado}</td><td className="p-4">{soles(total)}</td><td className="p-4">{incomplete?'—':soles(paid)}</td><td className="p-4 font-semibold">{incomplete?'—':soles(balance)}</td><td className="p-4">{incomplete?'Consulta incompleta':r.estado==='anulado'?'Recibo anulado':balance<0?'Sobrepago: revisar':balance===0?'Cubierto':'Pendiente'}</td></tr>})}</tbody></table>{!error&&!receipts.data?.length?<p className="p-6 text-sm text-slate-500">No hay recibos registrados.</p>:null}</section>
 <div className="flex items-center justify-between text-sm"><span>Página {page} · {receipts.count??0} recibos</span><div className="flex gap-2">{page>1?<Link className="rounded-lg border px-4 py-2" href={'?condominio='+encodeURIComponent(selected||'')+'&pagina='+(page-1)}>Anterior</Link>:null}{page*limit<(receipts.count??0)?<Link className="rounded-lg bg-sky-800 px-4 py-2 text-white" href={'?condominio='+encodeURIComponent(selected||'')+'&pagina='+(page+1)}>Siguiente</Link>:null}</div></div>
 <p className="text-xs text-slate-500">Vista informativa por recibo; no equivale aún a conciliación bancaria ni cierre contable.</p>
 </main>
}