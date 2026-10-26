import Link from 'next/link'
import {redirect} from 'next/navigation'
import {HelpCircle,MessageCircle,LifeBuoy} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {TicketForm} from '@/components/soporte/TicketForm'
import {TicketConversation} from '@/components/soporte/TicketConversation'
const faq=[
 {q:'¿Cómo registro un inmueble?',a:'Abre Torres e Inmuebles, selecciona Registrar inmueble y completa condominio, código y tipo. Necesitas permisos de administración.'},
 {q:'¿Dónde puedo consultar mis recibos?',a:'Ingresa al módulo Finanzas para consultar recibos y pagos registrados, según los permisos de tu cuenta.'},
 {q:'¿Puedo pagar online?',a:'Los pagos online están en desarrollo. Actualmente puedes consultar y registrar pagos reportados según permisos; no introduzcas datos de tarjeta en solicitudes de soporte.'},
 {q:'¿Cómo preparo un boletín?',a:'Ve a Comunicación, redacta el asunto y contenido y guarda un borrador. El envío automático de correo todavía no está habilitado.'},
 {q:'¿Por qué no veo mi condominio?',a:'Confirma que tu cuenta tenga una membresía activa en el condominio. Contacta con su administrador para revisar permisos.'}
]
export default async function SoportePage(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:agent}=await db.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
 const {data:members}=await db.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const {data:tickets,error}=ids.length?await db.from('support_tickets').select('id,asunto,estado,created_at').eq('created_by',user.id).in('condominio_id',ids).order('created_at',{ascending:false}).limit(20):{data:[],error:null}
 return <main className="mx-auto max-w-7xl space-y-6">
  <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-xl"><Link href="/dashboard" className="text-sm text-sky-100">← Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><LifeBuoy/> Centro de Soporte</h1><Link href="/soporte/notificaciones" className="mt-4 inline-flex rounded-xl border border-white/30 px-4 py-2 text-sm font-bold text-white hover:bg-white/10">Ver notificaciones</Link>{agent?<Link href="/soporte/admin" className="mt-4 ml-2 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-bold text-sky-900">Bandeja de soporte · Administrar tickets</Link>:null}<p className="mt-2 text-sky-100">Resuelve dudas frecuentes y consulta solicitudes sin compartir correos personales.</p></header>
  <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]"><section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><MessageCircle className="text-sky-700"/> CondoBot · Asistente básico</h2><p className="mt-2 text-sm text-slate-500">Respuestas predefinidas de ayuda. No es un chat humano ni un sistema de IA.</p><div className="mt-5 space-y-3">{faq.map(item=><details key={item.q} className="group rounded-xl border border-slate-200 bg-slate-50 p-4"><summary className="cursor-pointer font-semibold text-slate-900">{item.q}</summary><p className="mt-3 text-sm leading-6 text-slate-600">{item.a}</p></details>)}</div></section>
  <section className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><HelpCircle className="text-sky-700"/> Mis solicitudes</h2><p className="mt-2 text-sm text-slate-500">Envía una solicitud privada al equipo de soporte sin compartir direcciones de correo electrónico.</p><TicketForm condominios={(condos??[]).map(x=>({id:String(x.id),nombre:String(x.nombre)}))}/>{error?<p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">Soporte en preparación: aún no se ha aplicado la migración.</p>:tickets?.length?<div className="mt-4 space-y-3">{tickets.map(t=><div key={t.id} className="rounded-lg border p-3"><p className="font-semibold">{t.asunto}</p><p className="text-xs text-slate-500">Estado: {t.estado}</p><TicketConversation ticketId={t.id}/></div>)}</div>:<p className="mt-5 text-sm text-slate-500">No tienes solicitudes registradas.</p>}<p className="mt-5 rounded-lg bg-sky-50 p-4 text-xs text-sky-900">No compartas contraseñas, claves API, tarjetas ni información bancaria en las solicitudes.</p></section></div>
 </main>
}
