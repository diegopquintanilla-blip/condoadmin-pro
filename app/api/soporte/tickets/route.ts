import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'
export async function GET(){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const {data,error}=await db.from('support_tickets').select('id,asunto,categoria,prioridad,estado,created_at,condominio_id').eq('created_by',user.id).order('created_at',{ascending:false}).limit(30)
 if(error)return NextResponse.json({error:'El servicio de tickets no está habilitado'},{status:503})
 return NextResponse.json({tickets:data??[]},{headers:{'Cache-Control':'no-store'}})
}
export async function POST(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)return NextResponse.json({error:'No autorizado'},{status:401})
 if(!(request.headers.get('content-type')||'').includes('application/json'))return NextResponse.json({error:'Se requiere JSON'},{status:415})
 let body:Record<string,unknown>
 try {const value=await request.json();if(!value||typeof value!=='object'||Array.isArray(value))throw Error('bad');body=value}
 catch{return NextResponse.json({error:'JSON inválido'},{status:400})}
 const condo=String(body.condominio_id||'')
 const asunto=String(body.asunto||'').trim()
 const descripcion=String(body.descripcion||'').trim()
 const categoria=String(body.categoria||'consulta')
 if(!/^[0-9a-f-]{36}$/i.test(condo)||asunto.length<5||asunto.length>150||descripcion.length<15||descripcion.length>5000||!['consulta','incidencia','acceso','facturacion','otro'].includes(categoria))return NextResponse.json({error:'Datos inválidos'},{status:400})
 const {data:membership}=await db.from('condominio_usuarios').select('condominio_id').eq('condominio_id',condo).eq('user_id',user.id).eq('is_active',true).maybeSingle()
 if(!membership)return NextResponse.json({error:'No autorizado para ese condominio'},{status:403})
 const {data,error}=await db.from('support_tickets').insert({condominio_id:condo,created_by:user.id,asunto,descripcion,categoria,prioridad:'normal',estado:'abierto'}).select('id').single()
 if(error)return NextResponse.json({error:'Soporte temporalmente no disponible. Revisa la migración.'},{status:503})
 return NextResponse.json({ticket_id:data.id},{status:201})
}
