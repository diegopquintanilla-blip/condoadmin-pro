import Link from 'next/link'
import {redirect} from 'next/navigation'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {ProspectStatus} from '@/components/marketing/ProspectStatus'
export default async function ProspectosPage({searchParams}:{searchParams:Promise<{estado?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:role,error:roleError}=await db.from('prospectos_admins').select('user_id').eq('user_id',user.id).maybeSingle()
 if(roleError||!role)return <main className="mx-auto max-w-4xl p-8"><h1 className="text-2xl font-bold">Acceso restringido</h1><p className="mt-2">Solo la administración comercial de Condomin-Pro puede consultar los prospectos.</p><Link href="/dashboard" className="mt-4 inline-block underline">Volver al dashboard</Link></main>
 const params=await searchParams
 const allowed=['nuevo','contactado','en_seguimiento','cerrado']
 const estado=allowed.includes(params.estado??'')?params.estado!:'todos'
 const pagina=Math.max(1,Math.min(10000,Number.parseInt(params.pagina||'1',10)||1))
 const limit=25
 let query=db.from('prospectos_comerciales').select('id,nombre,correo,telefono,condominio,mensaje,estado,created_at',{count:'exact'})
 if(estado!=='todos')query=query.eq('estado',estado)
 const {data,error,count}=await query.order('created_at',{ascending:false}).range((pagina-1)*limit,pagina*limit-1)
 return <main className="mx-auto max-w-7xl space-y-6 p-6"><header className="rounded-3xl bg-[#1f4b7a] p-8 text-white"><Link href="/dashboard" className="text-sm underline">Volver al dashboard</Link><h1 className="mt-4 text-3xl font-extrabold">Prospectos comerciales</h1><p className="mt-2 text-blue-100">Solicitudes recibidas desde Contacto. Solo personal autorizado.</p></header>
 {error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible consultar los prospectos.</p>:<><div className="flex flex-wrap items-center justify-between gap-3"><p className="font-semibold">{count??0} solicitudes · Página {pagina}</p><nav className="flex flex-wrap gap-2 text-sm">{[{id:'todos',label:'Todos'},...allowed.map(id=>({id,label:id.replaceAll('_',' ')}))].map(x=><Link key={x.id} href={'?estado='+x.id} className={'rounded-lg border px-3 py-2 capitalize '+(estado===x.id?'bg-sky-800 text-white':'bg-white')}>{x.label}</Link>)}</nav></div><div className="grid gap-4">{(data??[]).map(p=><section key={p.id} className="rounded-2xl border bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-lg font-bold">{p.nombre}</h2><p className="text-sm text-slate-500">{new Date(p.created_at).toLocaleString('es-PE',{timeZone:'America/Lima'})}</p></div><ProspectStatus id={p.id} initial={p.estado}/></div><div className="mt-3 space-y-1 text-sm"><p><strong>Correo:</strong> <a className="font-semibold text-sky-800 underline" href={'mailto:'+p.correo}>{p.correo}</a></p><p><strong>Teléfono:</strong> <a className="font-semibold text-sky-800 underline" href={'https://wa.me/'+p.telefono.replace(/[^0-9]/g,'')} target="_blank" rel="noopener noreferrer">{p.telefono} · WhatsApp</a></p><p><strong>Condominio:</strong> {p.condominio||'No indicado'}</p><p className="whitespace-pre-wrap"><strong>Solicitud:</strong> {p.mensaje||'Sin comentarios'}</p></div></section>)}</div><nav className="flex gap-3 text-sm">{pagina>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?estado='+estado+'&pagina='+(pagina-1)}>Anterior</Link>:null}{pagina*limit<(count??0)?<Link className="rounded-lg bg-sky-800 px-4 py-2 text-white" href={'?estado='+estado+'&pagina='+(pagina+1)}>Siguiente</Link>:null}</nav>{!data?.length?<p>No hay prospectos para este filtro.</p>:null}</>}
 </main>
}