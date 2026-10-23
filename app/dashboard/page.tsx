import {redirect} from 'next/navigation'
import Link from 'next/link'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {loadCondoDashboard} from '@/lib/dashboard/dashboard-metrics'
import {ExecutiveDashboard} from '@/components/dashboard/ExecutiveDashboard'
export default async function DashboardPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const client=await createSupabaseServerClient()
 const {data:{user}}=await client.auth.getUser()
 if(!user)redirect('/login')
 const {data:memberships,error}=await client.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 const ids=(memberships??[]).map(x=>String(x.condominio_id))
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
 <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Centro de administración</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Dashboard ejecutivo</h1><p className="mt-2 text-sm text-slate-500">Resumen operativo y financiero de tus condominios</p></div><span className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs text-slate-500">CondoAdmin Pro</span></div>
 {error?<section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-800">No se pudieron verificar los permisos de tus condominios. Vuelve a iniciar sesión o contacta al administrador.</section>:null}
 {!error&&!id?<section className="rounded-xl border border-amber-200 bg-amber-50 p-5"><h2 className="text-lg font-bold text-amber-950">Configura tu primer condominio</h2><p className="mt-2 text-sm text-amber-900">Tu sesión está activa, pero todavía no tienes condominios asignados. Los indicadores aparecerán cuando registres tu condominio real.</p><Link className="mt-4 inline-block rounded-lg bg-sky-800 px-5 py-3 text-sm font-semibold text-white" href="/configuracion-inicial">Registrar primer condominio</Link></section>:null}
 {id?<div className="flex flex-wrap gap-2">{ids.map(x=><Link key={x} href={'/dashboard?condominio='+encodeURIComponent(x)} className={`rounded-lg border px-3 py-2 text-sm ${id===x?'border-sky-700 bg-sky-700 text-white':'bg-white text-slate-700'}`}>Condominio {x.slice(0,8)}</Link>)}</div>:null}
 {loadFailed?<section role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">No se pudieron cargar las métricas. Comprueba los permisos de Supabase.</section>:null}
 <ExecutiveDashboard overview={overview} history={history} configured={Boolean(id&&!error&&!loadFailed)}/>
 </main>
}
