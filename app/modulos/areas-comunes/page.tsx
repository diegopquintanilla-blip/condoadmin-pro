import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Trees,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {RegistrarArea} from '@/components/areas/RegistrarArea'
export default async function AreasComunesPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudieron comprobar los permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id)),query=await searchParams
 const current=query.condominio&&ids.includes(query.condominio)?query.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.pagina||'1',10)||1))
 const [condos,areas,reservas]=await Promise.all([
 ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
 current?db.from('areas_comunes').select('id,nombre,tipo,ubicacion,capacidad,costo_reserva,requiere_aprobacion,estado',{count:'exact'}).eq('condominio_id',current).order('nombre').range((page-1)*25,page*25-1):Promise.resolve({data:[] as {id:string;nombre:string;tipo:string;ubicacion:string|null;capacidad:number|null;costo_reserva:number|null;requiere_aprobacion:boolean;estado:string}[],count:0,error:null}),
 current?db.from('reservas').select('id',{count:'exact',head:true}).eq('condominio_id',current):Promise.resolve({count:0,error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const canWrite=members?.some(x=>String(x.condominio_id)===current&&['super_admin','admin','junta'].includes(String(x.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><Trees/> Áreas comunes</h1><p className="mt-2 text-sm text-sky-100">Espacios compartidos, aforo, costos y políticas de reserva.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(current===id?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-2xl bg-white p-6">Primero configura un condominio.</p>:null}
 {current&&canWrite?<RegistrarArea key={current} condominioId={current}/>:null}
 {current?<section className="grid gap-4 sm:grid-cols-2"><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Áreas registradas</p><p className="mt-2 text-3xl font-extrabold">{areas.count??0}</p></div><div className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">Reservas registradas</p><p className="mt-2 text-3xl font-extrabold">{reservas.count??0}</p></div></section>:null}
 {areas.error||reservas.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No se pudo consultar la información de áreas comunes o reservas.</p>:<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Áreas comunes registradas</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{areas.count??0} espacios</span></div>{areas.data?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Área','Tipo','Ubicación','Capacidad','Costo (S/)','Aprobación','Estado'].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{areas.data.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{x.nombre}</td><td className="p-4 capitalize">{x.tipo}</td><td className="p-4">{x.ubicacion||'—'}</td><td className="p-4">{x.capacidad??'—'}</td><td className="p-4">{Number(x.costo_reserva??0).toFixed(2)}</td><td className="p-4">{x.requiere_aprobacion?'Sí':'No'}</td><td className="p-4 capitalize">{x.estado}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Todavía no hay áreas comunes registradas.</p>}</section>}
 {(areas.count??0)>25?<nav className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(areas.count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</nav>:null}
 <p className="text-sm text-slate-500">El formulario de solicitudes de reserva y su aprobación aún no están habilitados en este módulo. El contador utiliza únicamente reservas existentes.</p>
 </main>
}