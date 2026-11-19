import {createServerClient} from '@supabase/ssr'
import {NextRequest,NextResponse} from 'next/server'

export async function GET(request:NextRequest){
 const destino=new URL('/auth/activacion',request.nextUrl.origin)
 const respuesta=NextResponse.redirect(destino)
 const code=request.nextUrl.searchParams.get('code')
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
 let confirmado=false
 if(code&&url&&key&&!request.nextUrl.searchParams.has('error')){
  // Retain the verifier for the exchange but leave sign-in to the login form.
  const auth=createServerClient(url,key,{cookies:{getAll:()=>request.cookies.getAll(),setAll:()=>{}}}).auth
  const {data,error}=await auth.exchangeCodeForSession(code)
  confirmado=!error&&Boolean(data.user?.email_confirmed_at)
 }
 respuesta.cookies.set('condomin_activacion',confirmado?'confirmada':'pendiente',{
  httpOnly:true,sameSite:'lax',secure:request.nextUrl.protocol==='https:',path:'/auth/activacion',maxAge:180,
 })
 return respuesta
}
