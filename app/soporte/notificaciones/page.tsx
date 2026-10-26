import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Bell} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const eventLabels:Record<string,string>={ticket_created:'Nueva solicitud de soporte',agent_replied:'Soporte respondió a tu solicitud',customer_replied:'El solicitante respondió',status_changed:'Estado de solicitud actualizado'}
export default async function SupportNotifications(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:rows,error}=await db.from('support_notifications').select('id,ticket_id,event_type,created_at,read_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(50)
 return <main className="mx-auto max-w-4xl space-y-6 p-6"><header className="rounded-3xl bg-gradient-to-r from-slate-950 to-sky-900 p-8 text-white"><Link href="/modulos/soporte" className="text-sm text-sky-100">← Centro de Soporte</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-bold"><Bell/> Notificaciones de soporte</h1><p className="mt-2 text-sky-100">Avisos privados para tu cuenta. No se muestra ninguna dirección de correo.</p></header>
 <section className="rounded-2xl border bg-white p-6">{error?<p role="alert" className="text-amber-900">Las notificaciones todavía no están habilitadas. Falta validar la migración.</p>:!rows?.length?<p className="text-slate-500">No hay notificaciones registradas.</p>:<div className="space-y-3">{rows.map(x=><div key={x.id} className="rounded-xl border border-slate-200 p-4"><p className="font-semibold">{eventLabels[x.event_type]??'Actividad de soporte'}</p><p className="mt-1 text-xs text-slate-500">Ticket: {x.ticket_id.slice(0,8)} · {new Date(x.created_at).toLocaleString('es-PE')}</p>{!x.read_at?<span className="mt-2 inline-block rounded-full bg-sky-100 px-2 py-1 text-xs font-semibold text-sky-800">Sin leer</span>:null}</div>)}</div>}</section></main>
}
