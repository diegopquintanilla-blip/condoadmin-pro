import Link from 'next/link'
import {redirect} from 'next/navigation'
import {PawPrint,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {CrearMascota} from '@/components/mascotas/CrearMascota'
export default async function MascotasPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:membershipError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No se pudieron verificar tus permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const params=await searchParams
 const current=params.condominio&&ids.includes(params.condominio)?params.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(params.pagina||'1',10)||1))
 const [condos,units,pets]=await Promise.all([
  ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
  current?db.from('inmuebles').select('id,codigo').eq('condominio_id',current).order('codigo').limit(200):Promise.resolve({data:[] as {id:string;codigo:string}[]}),
  current?db.from('mascotas').select('id,nombre,especie,raza,color,inmueble_id,estado',{count:'exact'}).eq('condominio_id',current).order('created_at',{ascending:false}).range((page-1)*25,page*25-1):Promise.resolve({data:[] as {id:string;nombre:string;especie:string;raza:string|null;color:string|null;inmueble_id:string|null;estado:string}[],count:0,error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const unitsMap=new Map((units.data??[]).map(x=>[String(x.id),String(x.codigo)]))
 const canWrite=members?.some(m=>String(m.condominio_id)===current&&['super_admin','admin','junta'].includes(String(m.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><PawPrint/> Mascotas</h1><p className="mt-2 text-sm text-sky-100">Registro de mascotas de la comunidad residencial.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(id===current?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-xl border bg-white p-5">Primero configura un condominio.</p>:null}
 {current&&canWrite?<CrearMascota key={current} condominioId={current} inmuebles={units.data??[]}/>:null}
 {pets.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible cargar las mascotas.</p>:<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Mascotas registradas</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{pets.count??0} mascotas</span></div>{pets.data?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Nombre','Especie','Raza','Inmueble','Estado'].map(h=><th key={h} className="p-4">{h}</th>)}</tr></thead><tbody>{pets.data.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{x.nombre}</td><td className="p-4 capitalize">{x.especie}</td><td className="p-4">{x.raza||'—'}</td><td className="p-4">{x.inmueble_id?unitsMap.get(x.inmueble_id)||'Unidad registrada':'Sin asignar'}</td><td className="p-4 capitalize">{x.estado}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Aún no hay mascotas registradas.</p>}</section>}
 {(pets.count??0)>25?<nav className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(pets.count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</nav>:null}
 </main>
}