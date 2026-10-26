import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Wrench,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {RegistrarServicio} from '@/components/servicios/RegistrarServicio'
export default async function ServiciosPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudieron comprobar los permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const query=await searchParams
 const current=query.condominio&&ids.includes(query.condominio)?query.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.pagina||'1',10)||1))
 const [condos,services]=await Promise.all([
 ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
 current?db.from('servicios').select('id,nombre,categoria,proveedor,frecuencia,estado',{count:'exact'}).eq('condominio_id',current).order('created_at',{ascending:false}).range((page-1)*25,page*25-1):Promise.resolve({data:[] as {id:string;nombre:string;categoria:string;proveedor:string|null;frecuencia:string|null;estado:string}[],count:0,error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const canWrite=members?.some(x=>String(x.condominio_id)===current&&['super_admin','admin','junta'].includes(String(x.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><Wrench/> Servicios</h1><p className="mt-2 text-sm text-sky-100">Servicios contratados y responsables de la operación del condominio.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(current===id?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-2xl bg-white p-6">Primero registra un condominio.</p>:null}
 {current&&canWrite?<RegistrarServicio key={current} condominioId={current}/>:null}
 {services.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No se pudo cargar el inventario de servicios.</p>:<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Servicios registrados</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{services.count??0} servicios</span></div>{services.data?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Servicio','Categoría','Proveedor','Frecuencia','Estado'].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{services.data.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{x.nombre}</td><td className="p-4 capitalize">{x.categoria}</td><td className="p-4">{x.proveedor||'—'}</td><td className="p-4">{x.frecuencia||'—'}</td><td className="p-4 capitalize">{x.estado}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Todavía no hay servicios registrados.</p>}</section>}
 {(services.count??0)>25?<nav className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(services.count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</nav>:null}
 </main>
}