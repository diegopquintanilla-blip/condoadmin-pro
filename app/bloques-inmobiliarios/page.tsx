import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Building2,House,Layers3,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {CrearInmueble} from '@/components/inmuebles/CrearInmueble'
export default async function BloquesPage(){
 const client=await createSupabaseServerClient()
 const {data:{user}}=await client.auth.getUser()
 if(!user)redirect('/login')
 const {data:memberships,error:membershipError}=await client.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 const ids=(memberships??[]).map(x=>String(x.condominio_id))
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-6 text-red-800">No fue posible verificar tus permisos.</main>
 const [{data:properties,error:propertiesError},{data:stages,error:stagesError}]=ids.length?await Promise.all([
  client.from('inmuebles').select('id,codigo,tipo,etapa,torre,bloque,estado').in('condominio_id',ids).order('codigo').limit(500),
  client.from('etapas').select('id,nombre,tipo').in('condominio_id',ids).order('nombre').limit(500)
 ]):[{data:[],error:null},{data:[],error:null}]
 const items=properties??[]
 const groups=new Map<string,number>()
 for(const item of items){const key=String(item.bloque||'Sin bloque asignado');groups.set(key,(groups.get(key)??0)+1)}
 return <main className="mx-auto max-w-7xl space-y-7">
  <section className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg">
   <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link>
   <h1 className="mt-5 text-3xl font-extrabold">Bloques inmobiliarios</h1>
   <p className="mt-2 text-sm text-sky-100">Inventario real de inmuebles, bloques y etapas de tus condominios autorizados.</p>
  </section>
  {!ids.length?<section className="rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-bold">Primero registra un condominio</h2><p className="mt-2 text-sm">Para consultar inmuebles necesitas una membresía activa.</p><Link className="mt-4 inline-block rounded-lg bg-sky-800 px-4 py-2 text-white" href="/configuracion-inicial">Configurar condominio</Link></section>:null}
  {propertiesError||stagesError?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudo consultar el inventario autorizado.</p>:null}
  <CrearInmueble memberships={(memberships??[]).map(x=>({condominio_id:String(x.condominio_id),role:String(x.role)}))}/>
  <div className="grid gap-4 sm:grid-cols-3">
   {[{name:'Inmuebles consultados',value:items.length,Icon:House},{name:'Bloques identificados',value:groups.size,Icon:Building2},{name:'Etapas registradas',value:stages?.length??0,Icon:Layers3}].map(({name,value,Icon})=><div key={name} className="rounded-2xl border bg-white p-6 shadow-sm"><Icon className="text-sky-700"/><p className="mt-4 text-sm text-slate-500">{name}</p><p className="mt-1 text-3xl font-extrabold">{value}</p></div>)}
  </div>
  {items.length===500?<p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">Se muestran los primeros 500 inmuebles. El listado no representa necesariamente el total.</p>:null}
  <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Distribución por bloque</h2>{groups.size?<div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Array.from(groups).sort((a,b)=>a[0].localeCompare(b[0])).map(([name,count])=><div key={name} className="rounded-xl border bg-slate-50 p-4"><p className="font-semibold">{name}</p><p className="mt-1 text-sm text-slate-500">{count} inmueble(s)</p></div>)}</div>:<p className="mt-5 text-sm text-slate-500">No hay inmuebles registrados. Los bloques aparecerán a medida que se registren.</p>}</section>
  <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><h2 className="p-6 text-xl font-bold">Inventario de inmuebles</h2><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-4">Código</th><th className="p-4">Tipo</th><th className="p-4">Etapa</th><th className="p-4">Torre</th><th className="p-4">Bloque</th><th className="p-4">Estado</th></tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-t"><td className="p-4 font-semibold">{item.codigo}</td><td className="p-4">{item.tipo}</td><td className="p-4">{item.etapa||'—'}</td><td className="p-4">{item.torre||'—'}</td><td className="p-4">{item.bloque||'—'}</td><td className="p-4">{item.estado}</td></tr>)}</tbody></table></div>{!items.length?<p className="px-6 pb-6 text-sm text-slate-500">Sin inmuebles para mostrar.</p>:null}</section>
 </main>
}