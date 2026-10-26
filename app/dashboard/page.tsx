import {redirect} from 'next/navigation'
import Link from 'next/link'
import {ArrowRight,Building2,House,Receipt,Wallet} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {loadCondoDashboard} from '@/lib/dashboard/dashboard-metrics'
import {ExecutiveDashboard} from '@/components/dashboard/ExecutiveDashboard'
export default async function DashboardPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const client=await createSupabaseServerClient()
 const {data:{user}}=await client.auth.getUser()
 if(!user)redirect('/login')
 const {data:memberships,error}=await client.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 const ids=(memberships??[]).map(x=>String(x.condominio_id))
 const {data:condos}=ids.length?await client.from('condominios').select('id,nombre').in('id',ids):{data:[] as {id:string;nombre:string}[]}
 const names=new Map((condos??[]).map(x=>[String(x.id),String(x.nombre)]))
 const requested=(await searchParams).condominio
 const id=requested&&ids.includes(requested)?requested:ids[0]
 let overview:Record<string,unknown>={}
 let history:Record<string,unknown>[]=[]
 let loadFailed=false
 if(id&&!error){
  const now=new Date()
  const from=new Date(Date.UTC(now.getUTCFullYear(),now.getUTCMonth()-11,1)).toISOString().slice(0,10)
  const to=now.toISOString().slice(0,10)
  try{const data=await loadCondoDashboard(client,id,from,to);overview=(data.overview??{}) as Record<string,unknown>;history=data.history as Record<string,unknown>[]}
  catch{loadFailed=true}
 }
 return <main className="mx-auto max-w-7xl space-y-6">
 <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0b2446] via-[#123d70] to-[#087c9e] px-7 py-9 text-white shadow-xl md:px-10"><div className="pointer-events-none absolute -right-16 -top-32 h-80 w-80 rounded-full border-[45px] border-white/10"/><div className="relative flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-bold uppercase tracking-[.23em] text-cyan-200">Condomin-Pro / Centro de control</p><h1 className="mt-4 text-3xl font-extrabold tracking-tight md:text-4xl">Dashboard ejecutivo</h1><p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">Visibilidad de tu operación, finanzas y comunidad desde un solo lugar.</p></div><div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur"><p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Estado de gestión</p><p className="mt-1 text-lg font-bold">{id?'Condominio activo':'Configuración pendiente'}</p></div></div></section>
 {error?<section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">No se pudieron verificar los permisos de tus condominios. Vuelve a iniciar sesión o contacta al administrador.</section>:null}
 {!error&&!id?<section className="rounded-[26px] border border-sky-200 bg-white p-7 shadow-sm md:p-9"><div className="flex items-start gap-4"><div className="rounded-2xl bg-sky-100 p-3 text-sky-800"><Building2 size={26}/></div><div><p className="text-xs font-bold uppercase tracking-widest text-sky-700">Activación inicial</p><h2 className="mt-2 text-2xl font-extrabold text-slate-900">Tu condominio está a un paso</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Registra el nombre oficial de tu primer condominio para activar la gestión de inmuebles, residentes y finanzas. No se crearán datos de prueba.</p><Link className="mt-5 inline-flex items-center gap-2 rounded-xl bg-sky-800 px-6 py-3 text-sm font-bold text-white hover:bg-sky-900" href="/configuracion-inicial">Configurar mi condominio <ArrowRight size={17}/></Link></div></div></section>:null}
 {id&&!error?<section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-slate-900">Empieza a operar tu condominio</h2><p className="mt-1 text-sm text-slate-500">Ruta recomendada para tus primeros registros reales.</p><div className="mt-5 grid gap-3 md:grid-cols-3">{[{label:'1. Registrar inmuebles',href:'/bloques-inmobiliarios',Icon:House},{label:'2. Emitir recibos',href:'/finanzas?condominio='+encodeURIComponent(id),Icon:Receipt},{label:'3. Registrar pagos',href:'/finanzas?condominio='+encodeURIComponent(id),Icon:Wallet}].map(({label,href,Icon})=><Link key={label} href={href} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm font-bold text-slate-800 hover:border-sky-300 hover:bg-sky-50"><Icon size={20} className="text-sky-700"/>{label}<ArrowRight size={16} className="ml-auto text-slate-400"/></Link>)}</div></section>:null}
 {id?<div className="flex flex-wrap gap-2">{ids.map(x=><Link key={x} href={'/dashboard?condominio='+encodeURIComponent(x)} className={`rounded-lg border px-3 py-2 text-sm ${id===x?'border-sky-700 bg-sky-700 text-white':'bg-white text-slate-700'}`}>{names.get(x)??'Condominio '+x.slice(0,8)}</Link>)}</div>:null}
 {loadFailed?<section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">No se pudieron cargar las métricas. Comprueba los permisos de Supabase.</section>:null}
 <ExecutiveDashboard overview={overview} history={history} configured={Boolean(id&&!error&&!loadFailed)}/>
 </main>
}
