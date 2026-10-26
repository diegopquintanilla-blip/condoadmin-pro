import Link from 'next/link'
import {redirect,notFound} from 'next/navigation'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {OperacionesGestion} from '@/components/operaciones/OperacionesGestion'
const titles={incidencias:'Incidencias y mantenimiento',tareas:'Tareas operativas',comunicados:'Comunicados administrativos'} as const
type Module=keyof typeof titles
export default async function OperacionesPage({params,searchParams}:{params:Promise<{modulo:string}>;searchParams:Promise<{condominio?:string}>}){
 const {modulo}=await params
 if(!(modulo in titles))notFound()
 const key=modulo as Module
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert">No se pudo validar tus permisos.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const names=new Map((condos??[]).map(x=>[x.id,x.nombre]))
 const result=current?(key==='incidencias'?await db.from('incidencias').select('id,titulo,descripcion,estado,fecha_programada,hora_programada').eq('condominio_id',current).order('created_at',{ascending:false}).limit(100):await db.from(key).select('id,titulo,descripcion,estado').eq('condominio_id',current).order('created_at',{ascending:false}).limit(100)):{data:[],error:null}
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] border border-white/10 bg-gradient-to-r from-[#0b2446] via-[#124c71] to-[#087c9e] p-8 text-white shadow-xl"><Link href="/dashboard" className="text-sm text-sky-100">← Volver al Dashboard</Link><h1 className="mt-4 text-3xl font-extrabold">{titles[key]}</h1><p className="mt-2 text-sm text-sky-100">Operaciones reales, protegidas por las políticas de acceso de tu condominio.</p></header>
 <nav className="flex flex-wrap gap-2">{ids.map(id=><Link href={'/operaciones/'+key+'?condominio='+encodeURIComponent(id)} key={id} className={'rounded-xl border px-4 py-2 '+(id===current?'border-sky-700 bg-sky-800 text-white shadow-sm':'border-slate-200 bg-white text-slate-700 hover:border-sky-300')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>
 {!current?<p className="rounded-lg border bg-white p-6">Todavía no hay condominios vinculados a este usuario.</p>:null}
 {result.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudieron cargar los registros. Revisa los permisos.</p>:current?<OperacionesGestion key={current} modulo={key} condominio={current} role={String(members?.find(m=>m.condominio_id===current)?.role||'')} items={(result.data??[]).map(x=>({id:String(x.id),titulo:String(x.titulo),descripcion:x.descripcion,estado:x.estado,fecha_programada:'fecha_programada' in x?String(x.fecha_programada||''):null,hora_programada:'hora_programada' in x?String(x.hora_programada||''):null}))}/>:null}
 {result.data?.length===100?<p className="rounded-lg bg-amber-50 p-3 text-sm">Se muestran los últimos 100 registros; se requiere paginación para listados mayores.</p>:null}
 </main>
}