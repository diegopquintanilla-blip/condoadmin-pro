import Link from 'next/link'
import {redirect} from 'next/navigation'
import {LifeBuoy,ShieldCheck,Clock3} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {AgentReply} from '@/components/soporte/AgentReply'
export default async function SupportAdminPage(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:agent,error:permissionError}=await db.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
 if(permissionError)return <main role="alert" className="p-8">Panel no habilitado. Verifica la migración y los permisos.</main>
 if(!agent)redirect('/dashboard')
 const {data:tickets,error}=await db.from('support_tickets').select('id,condominio_id,asunto,categoria,estado,prioridad,created_at').order('created_at',{ascending:false}).limit(100)
 return <main className="mx-auto max-w-7xl space-y-6 p-6">
 <header className="rounded-3xl bg-gradient-to-r from-slate-950 to-sky-900 p-8 text-white"><Link href="/dashboard" className="text-sm text-sky-100">← Dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-bold"><LifeBuoy/> Mesa de Soporte · Plataforma</h1><p className="mt-2 text-slate-200">Bandeja central de solicitudes, exclusiva para agentes autorizados.</p></header>
 <div className="grid gap-4 md:grid-cols-3"><div className="rounded-xl border bg-white p-5"><ShieldCheck className="text-sky-700"/><p className="mt-2 text-sm text-slate-500">Tickets visibles</p><strong className="text-3xl">{error?'—':tickets?.length??0}</strong></div><div className="rounded-xl border bg-white p-5"><Clock3 className="text-amber-600"/><p className="mt-2 text-sm text-slate-500">Abiertos</p><strong className="text-3xl">{error?'—':tickets?.filter(t=>t.estado==='abierto').length??0}</strong></div><div className="rounded-xl border bg-white p-5"><LifeBuoy className="text-sky-700"/><p className="mt-2 text-sm text-slate-500">En revisión</p><strong className="text-3xl">{error?'—':tickets?.filter(t=>t.estado==='en_revision').length??0}</strong></div></div>
 <section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Últimas solicitudes</h2><p className="mt-1 text-xs text-slate-500">Máximo 100 registros; los indicadores de esta pantalla reflejan únicamente la lista mostrada.</p>
 {error?<p role="alert" className="mt-4 text-red-700">No se pudieron cargar los tickets.</p>:!tickets?.length?<p className="mt-4 text-slate-500">No hay solicitudes disponibles.</p>:<div className="mt-5 space-y-3">{tickets.map(t=><div key={t.id} className="flex flex-wrap items-center justify-between gap-4 rounded-xl border p-4"><div><h3 className="font-bold">{t.asunto}</h3><p className="mt-1 text-xs text-slate-500">Condominio: {t.condominio_id} · {new Date(t.created_at).toLocaleDateString('es-PE')}</p></div><div><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold">{t.estado}</span>{["abierto","en_revision"].includes(t.estado)?<AgentReply ticketId={t.id}/>:null}</div></div>)}</div>}
 </section><p className="text-sm text-slate-500">Los agentes autorizados pueden responder. El cambio de estados continúa deshabilitado hasta validar la auditoría.</p></main>
}