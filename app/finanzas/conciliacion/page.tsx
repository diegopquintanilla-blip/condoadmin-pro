import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const soles=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
export default async function ConciliacionPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string;periodo?:string;estado?:string}>}){
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
 const periodo=typeof params.periodo==='string'&&/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/.test(params.periodo)?params.periodo:undefined
 const estado=params.estado==='vencido'||params.estado==='pendiente'?params.estado:undefined
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
 const query=db.from('finanzas_saldos_recibos').select('id,codigo,periodo,total,estado,fecha_vencimiento,pagado,saldo,unidad',{count:'exact'}).eq('condominio_id',selected)
 if(periodo)query.eq('periodo',periodo)
 if(estado)query.neq('estado','anulado').gt('saldo',0)
 if(estado==='vencido')query.lt('fecha_vencimiento',today)
 const receipts=selected?await query.order('created_at',{ascending:false}).order('id').range((page-1)*limit,page*limit-1):{data:[],error:null,count:0}
 const error=Boolean(receipts.error)
 function href(id:string,n?:number,filter?:string){
  const p=new URLSearchParams({condominio:id})
  if(periodo)p.set('periodo',periodo)
  if(filter)p.set('estado',filter)
  if(n)p.set('pagina',String(n))
  return '?'+p.toString()
 }
 return <main className="mx-auto max-w-7xl space-y-6">
 <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href={'/finanzas?'+new URLSearchParams({condominio:selected||'',periodo:periodo||''})} className="text-sm text-sky-100">← Volver a Finanzas</Link><h1 className="mt-4 text-3xl font-bold">Conciliación de recibos{periodo?' · '+periodo:''}</h1><p className="mt-2 text-sky-100">Estados calculados: pendiente, vencido, parcial y cubierto. No altera recibos ni pagos.</p></header>
 <nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} className={'rounded-xl border px-4 py-2 '+(id===selected?'bg-sky-800 text-white':'bg-white')} href={href(id,undefined,estado)}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>
 {!selected?<p className="rounded-xl border bg-white p-6">No hay condominios autorizados.</p>:null}
 {error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No fue posible consultar la conciliación. No se muestran cifras estimadas.</p>:null}
 {selected&&<nav aria-label="Filtrar recibos" className="flex flex-wrap gap-2">{[{label:'Todos'},{label:'Por cobrar',value:'pendiente'},{label:'Vencidos',value:'vencido'}].map(f=><Link key={f.label} href={href(selected,undefined,f.value)} aria-current={estado===f.value?'page':undefined} className={'rounded-lg border px-4 py-2 '+(estado===f.value?'bg-sky-800 text-white':'bg-white')}>{f.label}</Link>)}</nav>}
 <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Recibo','Unidad','Periodo','Total','Pagos validados','Saldo','Seguimiento'].map(x=><th scope="col" key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{!error&&(receipts.data??[]).map(r=>{
  const saldo=Number(r.saldo),pagado=Number(r.pagado)
  const observacion=r.estado==='anulado'?'Anulado':saldo<0?'Sobrepago':saldo===0?'Cubierto':r.fecha_vencimiento&&r.fecha_vencimiento<today?(pagado>0?'Vencido con abono':'Vencido'):pagado>0?'Pago parcial':'Pendiente'
  return <tr key={r.id} className="border-t"><td className="p-4 font-semibold">{r.codigo||r.id.slice(0,8)}</td><td className="p-4">{r.unidad??'—'}</td><td className="p-4">{r.periodo||'—'}</td><td className="p-4">{soles(Number(r.total))}</td><td className="p-4">{soles(pagado)}</td><td className="p-4 font-semibold">{soles(saldo)}</td><td className="p-4">{observacion}</td></tr>
 })}</tbody></table>{!error&&!receipts.data?.length?<p className="p-6 text-sm text-slate-500">No hay recibos para esta selección.</p>:null}</section>
 {selected&&!error&&<div className="flex flex-wrap items-center justify-between gap-3 text-sm"><span>Página {page} · {receipts.count??0} recibos</span><div className="flex gap-2">{page>1?<Link className="rounded-lg border px-4 py-2" href={href(selected,page-1,estado)}>Anterior</Link>:null}{page*limit<(receipts.count??0)?<Link className="rounded-lg bg-sky-800 px-4 py-2 text-white" href={href(selected,page+1,estado)}>Siguiente</Link>:null}</div></div>}
 <p className="text-xs text-slate-500">Vista informativa por recibo; no equivale aún a conciliación bancaria ni cierre contable.</p>
 </main>
}