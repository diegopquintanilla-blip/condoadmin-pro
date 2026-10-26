import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Bell} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {NotificationList} from '@/components/soporte/NotificationList'
export default async function SupportNotifications(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:rows,error}=await db.from('support_notifications').select('id,ticket_id,event_type,created_at,read_at').eq('recipient_id',user.id).order('created_at',{ascending:false}).limit(50)
 return <main className="mx-auto max-w-4xl space-y-6 p-6"><header className="rounded-3xl bg-gradient-to-r from-slate-950 to-sky-900 p-8 text-white"><Link href="/modulos/soporte" className="text-sm text-sky-100">← Centro de Soporte</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-bold"><Bell/> Notificaciones de soporte</h1><p className="mt-2 text-sky-100">Marca como leídas las notificaciones que ya revisaste.</p></header><section className="rounded-2xl border bg-white p-6">{error?<p role="alert" className="text-amber-900">No se pudieron consultar las notificaciones.</p>:<NotificationList initial={rows??[]}/>}</section></main>
}
