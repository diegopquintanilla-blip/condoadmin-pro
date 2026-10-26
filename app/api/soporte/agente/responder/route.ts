import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function POST(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const {data:agent,error:agentError}=await db.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
 if(agentError||!agent)return NextResponse.json({error:'Acceso restringido'},{status:403})
 let data:unknown
 try{data=await request.json()}catch{return NextResponse.json({error:'JSON inválido'},{status:400})}
 if(!data||typeof data!=='object'||Array.isArray(data))return NextResponse.json({error:'Solicitud inválida'},{status:400})
 const body=data as Record<string,unknown>
 const id=typeof body.ticket_id==='string'?body.ticket_id:''
 const message=typeof body.message==='string'?body.message.trim():''
 if(!uuid.test(id)||!message||message.length>4000)return NextResponse.json({error:'Datos inválidos'},{status:400})
 const {data:ticket,error:ticketError}=await db.from('support_tickets').select('id,condominio_id,estado').eq('id',id).maybeSingle()
 if(ticketError||!ticket||!['abierto','en_revision'].includes(ticket.estado))return NextResponse.json({error:'Ticket no disponible'},{status:404})
 const {error}=await db.from('support_ticket_messages').insert({ticket_id:ticket.id,condominio_id:ticket.condominio_id,author_id:user.id,body:message})
 if(error)return NextResponse.json({error:'No se pudo registrar la respuesta'},{status:503})
 return NextResponse.json({ok:true},{status:201})
}
