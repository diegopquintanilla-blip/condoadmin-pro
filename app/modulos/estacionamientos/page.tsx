import Link from 'next/link'
import {redirect} from 'next/navigation'
import {CarFront,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {CrearEstacionamiento} from '@/components/inmuebles/CrearEstacionamiento'
export default async function EstacionamientosPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:memberError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(memberError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No se pudieron verificar tus permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const query=await searchParams
 const current=query.condominio&&ids.includes(query.condominio)?query.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.pagina||'1',10)||1))
 const names=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[] as {id:string;nombre:string}[]}
 const nameMap=new Map((names.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const {data:items,count,error}=current?await db.from('inmuebles').select('id,codigo,bloque,estado,created_at',{count:'exact'}).eq('condominio_id',current).eq('tipo','estacionamiento').order('codigo').range((page-1)*25,page*25-1):{data:[],count:0,error:null}
 const authorized=members?.some(x=>String(x.condominio_id)===current&&['admin','super_admin','junta'].includes(String(x.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><CarFront/> Estacionamientos</h1><p className="mt-2 text-sm text-sky-100">Registro e inventario de espacios reales por condominio.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/modulos/estacionamientos?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(id===current?'bg-sky-800 text-white':'bg-white text-slate-700')}>{nameMap.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-xl bg-amber-50 p-5">Primero configura un condominio en el dashboard.</p>:null}
 {current&&authorized?<CrearEstacionamiento condominioId={current}/>:null}
 {error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No se pudo consultar el inventario.</p>:<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Espacios registrados</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{count??0} estacionamientos</span></div>{items?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Código</th><th className="p-4">Ubicación</th><th className="p-4">Estado</th></tr></thead><tbody>{items.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{x.codigo}</td><td className="p-4">{x.bloque||'Sin zona asignada'}</td><td className="p-4 capitalize">{x.estado}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Aún no hay estacionamientos registrados.</p>}</section>}
 {(count??0)>25?<div className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</div>:null}
 </main>
}