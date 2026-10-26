import Link from 'next/link'
import {redirect} from 'next/navigation'
import {ShieldCheck,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {AsignarAcceso} from '@/components/acceso/AsignarAcceso'
export default async function ControlAccesoPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No fue posible validar los permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const [condos,linked]=await Promise.all([
  ids.length?db.from('condominios').select('id,nombre,created_by').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string;created_by:string}[]}),
  current?db.from('condominio_usuarios').select('id,user_id,role,is_active').eq('condominio_id',current).order('created_at',{ascending:true}).limit(100):Promise.resolve({data:[],error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const canManage=members?.some(x=>String(x.condominio_id)===current&&['admin','super_admin'].includes(String(x.role)))??false
 const canGrantAdmin=condos.data?.some(x=>String(x.id)===current&&String(x.created_by)===user.id)||members?.some(x=>String(x.condominio_id)===current&&String(x.role)==='super_admin')||false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><ShieldCheck/> Control de acceso</h1><p className="mt-2 text-sm text-sky-100">Usuarios administradores y operadores asignados a cada condominio.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(current===id?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<section className="rounded-2xl bg-white p-6">Primero registra un condominio.</section>:null}
 {current&&canManage?<AsignarAcceso key={current} condominioId={current} canGrantAdmin={canGrantAdmin}/>:current?<p className="rounded-xl bg-amber-50 p-5 text-sm">Solo administradores autorizados pueden asignar usuarios.</p>:null}
 {current&&canManage?<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Usuarios vinculados</h2><p className="mt-1 text-sm text-slate-500">Se muestran identificadores abreviados porque los correos de autenticación no se exponen públicamente.</p>{linked.error?<p role="alert" className="mt-4 text-red-700">No se pudieron consultar los usuarios.</p>:linked.data?.length?<div className="mt-5 overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b bg-slate-50"><th className="p-3">Identificador</th><th className="p-3">Rol</th><th className="p-3">Acceso</th></tr></thead><tbody>{linked.data.map(x=><tr key={x.id} className="border-b border-slate-100"><td className="p-3 font-mono">{String(x.user_id).slice(0,8)}…</td><td className="p-3 capitalize">{String(x.role).replace('_',' ')}</td><td className="p-3">{x.is_active?'Activo':'Inactivo'}</td></tr>)}</tbody></table></div>:<p className="mt-4 text-sm text-slate-500">No hay usuarios vinculados.</p>}</section>:null}
 <section className="rounded-2xl border border-sky-100 bg-sky-50 p-5 text-sm text-sky-950"><strong>Política inicial de acceso</strong><p className="mt-2">Administrador: gestión ampliada de los módulos habilitados. Operador: acceso de miembro con permisos limitados; las operaciones de escritura requieren autorizaciones específicas de cada módulo. Para incorporar a alguien, primero debe tener una cuenta registrada y correo verificado.</p></section>
 </main>
}