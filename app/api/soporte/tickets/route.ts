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
export async function POST(){
 return NextResponse.json({error:'Creación de tickets en preparación: falta validar la migración y el servicio seguro',code:'SUPPORT_NOT_ENABLED'},{status:503})
}
