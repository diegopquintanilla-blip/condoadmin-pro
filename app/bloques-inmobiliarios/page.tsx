import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Building2,House,Layers3,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {CrearInmueble} from '@/components/inmuebles/CrearInmueble'
import {InventarioEditable} from '@/components/inmuebles/InventarioEditable'
export default async function BloquesPage({searchParams}:{searchParams:Promise<{pagina?:string;condominio?:string;etapa?:string;bloque?:string;buscar?:string}>}){
 const filters=await searchParams
 const page=Math.max(1,Math.min(100000,Number.parseInt(filters.pagina||'1',10)||1))
 const pageSize=25
 const client=await createSupabaseServerClient()
 const {data:{user}}=await client.auth.getUser()
 if(!user)redirect('/login')
 const {data:memberships,error:membershipError}=await client.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 const ids=(memberships??[]).map(x=>String(x.condominio_id))
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">No fue posible verificar tus permisos.</main>
 const selected=filters.condominio&&ids.includes(filters.condominio)?filters.condominio:ids[0]
 const scoped=selected?[selected]:[]
 let propertyQuery=client.from('inmuebles').select('id,condominio_id,codigo,tipo,etapa,torre,bloque,estado',{count:'exact'}).eq('condominio_id',selected||'00000000-0000-0000-0000-000000000000')
 if(filters.etapa)propertyQuery=propertyQuery.eq('etapa',filters.etapa)
 if(filters.bloque)propertyQuery=propertyQuery.eq('bloque',filters.bloque)
 if(filters.buscar?.trim())propertyQuery=propertyQuery.ilike('codigo',`%${filters.buscar.trim().replace(/[%_,()]/g,'')}%`)
 const [{data:properties,error:propertiesError,count:total},{data:stages,error:stagesError}]=scoped.length?await Promise.all([
  propertyQuery.order('codigo').range((page-1)*pageSize,page*pageSize-1),
  client.from('etapas').select('id,nombre,tipo').eq('condominio_id',selected).order('nombre').limit(500)
 ]):[{data:[],error:null,count:0},{data:[],error:null}]
 const loadedIds=(properties??[]).map(x=>x.id)
 const {data:residents,error:residentsError}=loadedIds.length?await client.from('residentes').select('id,inmueble_id,full_name,tipo').eq('condominio_id',selected).in('inmueble_id',loadedIds).limit(1000):{data:[],error:null}
 const items=properties??[]
 const groups=new Map<string,number>()
 for(const item of items){const key=String(item.bloque||'Sin bloque asignado');groups.set(key,(groups.get(key)??0)+1)}
 return <main className="mx-auto max-w-7xl space-y-7">
  <section className="rounded-[28px] border border-white/10 shadow-xl bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg">
   <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link>
   <h1 className="mt-5 text-3xl font-extrabold">Bloques inmobiliarios</h1>
   <p className="mt-2 text-sm text-sky-100">Inventario real de inmuebles, bloques y etapas de tus condominios autorizados.</p>
  </section>
  {!ids.length?<section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-bold">Primero registra un condominio</h2><p className="mt-2 text-sm">Para consultar inmuebles necesitas una membresía activa.</p><Link className="mt-4 inline-block rounded-lg bg-sky-800 px-4 py-2 text-white" href="/configuracion-inicial">Configurar condominio</Link></section>:null}
  {propertiesError||stagesError||residentsError?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudo consultar el inventario autorizado.</p>:null}
  <form method="get" className="grid gap-3 rounded-[22px] border border-slate-200/70 bg-white shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)] p-5 sm:grid-cols-2 lg:grid-cols-5"><label className="text-sm font-semibold">Condominio<select name="condominio" defaultValue={selected||''} className="mt-1 w-full rounded-lg border p-2">{ids.map(x=><option key={x} value={x}>{x.slice(0,8)}</option>)}</select></label><label className="text-sm font-semibold">Etapa<input name="etapa" defaultValue={filters.etapa||''} className="mt-1 w-full rounded-lg border p-2" placeholder="Todas"/></label><label className="text-sm font-semibold">Bloque<input name="bloque" defaultValue={filters.bloque||''} className="mt-1 w-full rounded-lg border p-2" placeholder="Todos"/></label><label className="text-sm font-semibold">Buscar código<input name="buscar" defaultValue={filters.buscar||''} className="mt-1 w-full rounded-lg border p-2" placeholder="Código"/></label><button className="self-end rounded-lg bg-sky-800 px-4 py-2 font-bold text-white">Aplicar filtros</button></form>
  <CrearInmueble memberships={(memberships??[]).map(x=>({condominio_id:String(x.condominio_id),role:String(x.role)}))}/>
  <div className="grid gap-4 sm:grid-cols-3">
   {[{name:'Inmuebles encontrados',value:total??0,Icon:House},{name:'Bloques identificados',value:groups.size,Icon:Building2},{name:'Etapas registradas',value:stages?.length??0,Icon:Layers3}].map(({name,value,Icon})=><div key={name} className="rounded-2xl border bg-white p-6 shadow-sm"><Icon className="text-sky-700"/><p className="mt-4 text-sm text-slate-500">{name}</p><p className="mt-1 text-3xl font-extrabold">{value}</p></div>)}
  </div>
  <p className="text-sm text-slate-500">Mostrando {items.length} de {total??0} inmuebles encontrados. La distribución por bloque corresponde a esta página.</p>
  <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Distribución por bloque</h2>{groups.size?<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from(groups).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,count])=><div key={name} className="rounded-xl border bg-slate-50 p-4"><p className="font-semibold">{name}</p><p className="mt-1 text-sm text-slate-500">{count} inmueble(s)</p></div>)}</div>:<p className="mt-5 text-sm text-slate-500">No hay inmuebles registrados. Los bloques aparecerán a medida que se registren.</p>}</section>
  {residents?.length===1000?<p className="rounded-lg bg-amber-50 p-3 text-sm">Se muestran hasta 1000 residentes vinculados.</p>:null}
  <InventarioEditable serverMode residents={(residents??[]).map(r=>({id:String(r.id),inmueble_id:r.inmueble_id?String(r.inmueble_id):null,full_name:String(r.full_name),tipo:String(r.tipo)}))} items={items.map(x=>({...x,codigo:String(x.codigo),tipo:String(x.tipo),estado:String(x.estado)}))} memberships={(memberships??[]).map(x=>({condominio_id:String(x.condominio_id),role:String(x.role)}))}/>
  <div className="flex items-center justify-between rounded-xl border bg-white p-4"><span className="text-sm">Página {page} de {Math.max(1,Math.ceil((total??0)/pageSize))}</span><div className="flex gap-2">{page>1?<Link className="rounded-lg border px-4 py-2" href={'?'+new URLSearchParams({...filters,condominio:selected||'',pagina:String(page-1)}).toString()}>Anterior</Link>:null}{page*pageSize<(total??0)?<Link className="rounded-lg bg-sky-800 px-4 py-2 text-white" href={'?'+new URLSearchParams({...filters,condominio:selected||'',pagina:String(page+1)}).toString()}>Siguiente</Link>:null}</div></div>
 </main>
}