import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const validId=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function GET(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user},error:authError}=await db.auth.getUser()
 if(authError||!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const {data:agent,error:agentError}=await db.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
 if(agentError||!agent)return NextResponse.json({error:'No autorizado'},{status:403})
 const ticketId=new URL(request.url).searchParams.get('ticket_id')||''
 if(!validId.test(ticketId))return NextResponse.json({error:'Identificador inválido'},{status:400})
 const {data:ticket,error:ticketError}=await db.from('support_tickets').select('id,condominio_id,asunto,descripcion,created_by').eq('id',ticketId).maybeSingle()
 if(ticketError||!ticket)return NextResponse.json({error:'Ticket no disponible'},{status:404})
 const {data:messages,error}=await db.from('support_ticket_messages').select('id,author_id,body,created_at').eq('ticket_id',ticket.id).eq('condominio_id',ticket.condominio_id).order('created_at',{ascending:true}).limit(200)
 if(error)return NextResponse.json({error:'No se pudo consultar la conversación'},{status:503})
 return NextResponse.json({ticket,messages:messages??[]},{headers:{'Cache-Control':'no-store'}})
}
