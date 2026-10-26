import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const transitions:Record<string,string[]>={abierto:['en_revision','cerrado'],en_revision:['resuelto','cerrado'],resuelto:['en_revision','cerrado'],cerrado:[]}
export async function PATCH(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const {data:agent,error:agentError}=await db.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
 if(agentError||!agent)return NextResponse.json({error:'Acceso restringido'},{status:403})
 if(!(request.headers.get('content-type')||'').includes('application/json'))return NextResponse.json({error:'Se requiere JSON'},{status:415})
 let payload:unknown
 try{payload=await request.json()}catch{return NextResponse.json({error:'JSON inválido'},{status:400})}
 if(!payload||typeof payload!=='object'||Array.isArray(payload))return NextResponse.json({error:'Solicitud inválida'},{status:400})
 const b=payload as Record<string,unknown>
 const ticket_id=typeof b.ticket_id==='string'?b.ticket_id:''
 const estado=typeof b.estado==='string'?b.estado:''
 if(!uuid.test(ticket_id)||!Object.hasOwn(transitions,estado))return NextResponse.json({error:'Valores inválidos'},{status:400})
 const {data:ticket,error:readError}=await db.from('support_tickets').select('id,estado').eq('id',ticket_id).maybeSingle()
 if(readError||!ticket)return NextResponse.json({error:'Ticket no encontrado'},{status:404})
 if(!transitions[ticket.estado]?.includes(estado))return NextResponse.json({error:'Transición de estado no permitida'},{status:409})
 const {data:updated,error}=await db.from('support_tickets').update({estado}).eq('id',ticket_id).eq('estado',ticket.estado).select('id,estado').maybeSingle()
 if(error)return NextResponse.json({error:'No se pudo actualizar. Revisa permisos y migraciones.'},{status:503})
 if(!updated)return NextResponse.json({error:'El ticket cambió de estado. Actualiza la página.'},{status:409})
 return NextResponse.json({ticket:updated},{headers:{'Cache-Control':'no-store'}})
}
