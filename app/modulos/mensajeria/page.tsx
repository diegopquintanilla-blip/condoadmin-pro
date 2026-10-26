import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Mail,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {BoletinEditor} from '@/components/mensajeria/BoletinEditor'
export default async function MensajeriaPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:membershipError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible verificar los permisos.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const selected=(await searchParams).condominio
 const current=selected&&ids.includes(selected)?selected:ids[0]
 const canWrite=members?.some(m=>String(m.condominio_id)===current&&['super_admin','admin','junta'].includes(String(m.role)))??false
 const [condos,owners,drafts]=await Promise.all([
  ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
  current&&canWrite?db.from('propietarios').select('id',{count:'exact',head:true}).eq('condominio_id',current).not('email','is',null).neq('email','').eq('estado','activo'):Promise.resolve({count:0,error:null}),
  current?db.from('comunicados').select('id,titulo,estado,created_at').eq('condominio_id',current).eq('canal','email').eq('destinatario_tipo','propietarios').order('created_at',{ascending:false}).limit(30):Promise.resolve({data:[],error:null})
 ])
 const names=new Map((condos.data??[]).map(c=>[String(c.id),String(c.nombre)]))
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><Mail/> Mensajería y boletines</h1><p className="mt-2 text-sm text-sky-100">Boletines informativos destinados a propietarios del condominio.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(current===id?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-xl border bg-white p-5">Primero configura un condominio.</p>:null}
 {canWrite&&current?<BoletinEditor key={current} condominioId={current} recipients={owners.count??0}/>:current?<p className="rounded-xl bg-amber-50 p-5 text-sm">Solo administración y junta pueden preparar boletines.</p>:null}
 <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Boletines guardados</h2><p className="mt-1 text-sm text-slate-500">Estado real de los registros. Guardar un borrador no envía correos electrónicos.</p>{drafts.error?<p role="alert" className="mt-4 text-red-700">No fue posible cargar los boletines.</p>:drafts.data?.length?<div className="mt-5 space-y-3">{drafts.data.map(x=><div key={x.id} className="flex flex-wrap justify-between gap-3 rounded-xl border border-slate-200 p-4"><strong className="text-sm">{x.titulo}</strong><span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold">{x.estado||'borrador'}</span></div>)}</div>:<p className="mt-4 text-sm text-slate-500">Aún no hay boletines registrados.</p>}</section>
 <p className="text-sm text-amber-900">El envío automático requiere integrar un proveedor de correo verificado, configurar remitente y control de entregas. No está activado.</p>
 </main>
}