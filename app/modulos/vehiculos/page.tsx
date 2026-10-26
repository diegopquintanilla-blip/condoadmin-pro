import Link from 'next/link'
import {redirect} from 'next/navigation'
import {CarFront,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {CrearVehiculo} from '@/components/vehiculos/CrearVehiculo'
export default async function VehiculosPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:membershipError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">No se pudieron verificar los permisos.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const query=await searchParams
 const current=query.condominio&&ids.includes(query.condominio)?query.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.pagina||'1',10)||1))
 const [condos,spaces,vehicles]=await Promise.all([
  ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
  current?db.from('inmuebles').select('id,codigo').eq('condominio_id',current).eq('tipo','estacionamiento').order('codigo').limit(200):Promise.resolve({data:[] as {id:string;codigo:string}[]}),
  current?db.from('vehiculos').select('id,placa,marca,modelo,color,estacionamiento_id',{count:'exact'}).eq('condominio_id',current).order('placa').range((page-1)*25,page*25-1):Promise.resolve({data:[] as {id:string;placa:string;marca:string|null;modelo:string|null;color:string|null;estacionamiento_id:string|null}[],count:0,error:null})
 ])
 const condoNames=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const parkNames=new Map((spaces.data??[]).map(x=>[String(x.id),String(x.codigo)]))
 const canCreate=members?.some(m=>String(m.condominio_id)===current&&['admin','super_admin','junta'].includes(String(m.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><CarFront/> Vehículos</h1><p className="mt-2 text-sm text-sky-100">Registro y consulta de vehículos autorizados del condominio.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/modulos/vehiculos?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(id===current?'bg-sky-800 text-white':'bg-white text-slate-700')}>{condoNames.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-xl border bg-white p-5">Primero registra un condominio.</p>:null}
 {current&&canCreate?<CrearVehiculo condominioId={current} espacios={spaces.data??[]}/>:null}
 {vehicles.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible cargar los vehículos.</p>:<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Vehículos registrados</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{vehicles.count??0} vehículos</span></div>{vehicles.data?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Placa','Marca / modelo','Color','Estacionamiento'].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{vehicles.data.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-bold">{x.placa}</td><td className="p-4">{[x.marca,x.modelo].filter(Boolean).join(' ')||'—'}</td><td className="p-4">{x.color||'—'}</td><td className="p-4">{x.estacionamiento_id?parkNames.get(x.estacionamiento_id)||'Espacio registrado':'Sin asignar'}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Todavía no hay vehículos registrados.</p>}</section>}
 {(vehicles.count??0)>25?<nav className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(vehicles.count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</nav>:null}
 </main>
}