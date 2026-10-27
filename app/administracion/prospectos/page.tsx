import Link from 'next/link'
import {redirect} from 'next/navigation'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {ProspectStatus} from '@/components/marketing/ProspectStatus'
export default async function ProspectosPage(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:role,error:roleError}=await db.from('prospectos_admins').select('user_id').eq('user_id',user.id).maybeSingle()
 if(roleError||!role)return <main className="mx-auto max-w-4xl p-8"><h1 className="text-2xl font-bold">Acceso restringido</h1><p className="mt-2">Solo la administración comercial de Condomin-Pro puede consultar los prospectos.</p><Link href="/dashboard" className="mt-4 inline-block underline">Volver al dashboard</Link></main>
 const {data, error}=await db.from('prospectos_comerciales').select('id,nombre,correo,telefono,condominio,mensaje,estado,created_at').order('created_at',{ascending:false}).limit(200)
 return <main className="mx-auto max-w-7xl space-y-6 p-6"><header className="rounded-3xl bg-[#1f4b7a] p-8 text-white"><Link href="/dashboard" className="text-sm underline">Volver al dashboard</Link><h1 className="mt-4 text-3xl font-extrabold">Prospectos comerciales</h1><p className="mt-2 text-blue-100">Solicitudes recibidas desde Contacto. Solo personal autorizado.</p></header>
 {error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible consultar los prospectos.</p>:<><p className="font-semibold">{data?.length??0} solicitudes recientes (máximo 200)</p><div className="grid gap-4">{(data??[]).map(p=><section key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold">{p.nombre}</h2><p className="text-sm text-slate-500">{new Date(p.created_at).toLocaleString('es-PE',{timeZone:'America/Lima'})}</p></div><ProspectStatus id={p.id} initial={p.estado}/></div><div className="mt-3 space-y-1 text-sm"><p><strong>Correo:</strong> {p.correo}</p><p><strong>Teléfono:</strong> {p.telefono}</p><p><strong>Condominio:</strong> {p.condominio||'No indicado'}</p><p className="whitespace-pre-wrap"><strong>Solicitud:</strong> {p.mensaje||'Sin comentarios'}</p></div></section>)}</div>{!data?.length?<p>No hay prospectos registrados todavía.</p>:null}</>}
 </main>
}