import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export async function GET(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const id=new URL(request.url).searchParams.get('ticket_id')||''
 if(!uuid.test(id))return NextResponse.json({error:'Ticket inválido'},{status:400})
 const {data:ticket}=await db.from('support_tickets').select('id,condominio_id,created_by,estado').eq('id',id).eq('created_by',user.id).maybeSingle()
 if(!ticket)return NextResponse.json({error:'Ticket no disponible'},{status:404})
 const {data,error}=await db.from('support_ticket_messages').select('id,body,created_at,author_id').eq('ticket_id',ticket.id).eq('condominio_id',ticket.condominio_id).order('created_at',{ascending:true}).limit(100)
 if(error)return NextResponse.json({error:'Mensajería aún no habilitada'},{status:503})
 return NextResponse.json({messages:data??[]},{headers:{'Cache-Control':'no-store'}})
}
export async function POST(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 let data:unknown
 try{data=await request.json()}catch{return NextResponse.json({error:'JSON inválido'},{status:400})}
 if(!data||typeof data!=='object'||Array.isArray(data))return NextResponse.json({error:'Solicitud inválida'},{status:400})
 const body=data as Record<string,unknown>,id=typeof body.ticket_id==='string'?body.ticket_id:'',message=typeof body.message==='string'?body.message.trim():''
 if(!uuid.test(id)||!message||message.length>4000)return NextResponse.json({error:'Mensaje o ticket inválido'},{status:400})
 const {data:ticket}=await db.from('support_tickets').select('id,condominio_id,estado').eq('id',id).eq('created_by',user.id).maybeSingle()
 if(!ticket||!['abierto','en_revision'].includes(ticket.estado))return NextResponse.json({error:'Ticket no disponible para responder'},{status:403})
 const {error}=await db.from('support_ticket_messages').insert({ticket_id:ticket.id,condominio_id:ticket.condominio_id,author_id:user.id,body:message})
 if(error)return NextResponse.json({error:'Mensajería todavía no disponible'},{status:503})
 return NextResponse.json({ok:true},{status:201})
}
