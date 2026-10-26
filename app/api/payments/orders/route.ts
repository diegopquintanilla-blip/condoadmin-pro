import {NextResponse} from 'next/server'
import {createSupabaseServerClient} from '@/lib/supabase/server'

/**
 * Sandbox payment-order endpoint scaffold.
 * Fail closed until the database migration, tenant ownership check,
 * provider test keys and idempotency flow are tested independently.
 */
export async function POST(request:Request){
 const db=await createSupabaseServerClient()
 const {data:{user},error}=await db.auth.getUser()
 if(error||!user)return NextResponse.json({error:'No autorizado'},{status:401})
 const contentType=request.headers.get('content-type')||''
 if(!contentType.includes('application/json'))return NextResponse.json({error:'Se requiere JSON'},{status:415})
 let body:unknown
 try{body=await request.json()}catch{return NextResponse.json({error:'JSON inválido'},{status:400})}
 if(!body||typeof body!=='object'||Array.isArray(body))return NextResponse.json({error:'Solicitud inválida'},{status:400})
 // No database writes, provider requests or secret lookups in this version.
 return NextResponse.json({error:'Los pagos sandbox todavía no están habilitados',code:'PAYMENTS_SANDBOX_DISABLED'},{status:503,headers:{'Cache-Control':'no-store'}})
}
