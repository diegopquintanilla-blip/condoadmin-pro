import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Vote} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {VotacionesGestion} from '@/components/votaciones/VotacionesGestion'
export default async function VotacionesPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient();const {data:{user}}=await db.auth.getUser();if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert">No se pudieron comprobar tus permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id)),requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const [condos,proposals,votes]=await Promise.all([
 ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
 current?db.from('votaciones').select('id,titulo,descripcion,fecha_cierre,estado').eq('condominio_id',current).order('created_at',{ascending:false}).limit(100):Promise.resolve({data:[],error:null}),
 current?db.from('votos').select('votacion_id,opcion').eq('condominio_id',current).eq('user_id',user.id).limit(200):Promise.resolve({data:[],error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 const canCreate=members?.some(x=>String(x.condominio_id)===current&&['admin','super_admin','junta'].includes(String(x.role)))??false
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link className="text-sm text-sky-100" href="/dashboard">← Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><Vote/> Votaciones</h1><p className="mt-2 text-sm text-sky-100">Consultas digitales para usuarios autorizados del condominio.</p></header>{ids.length>1?<nav className="flex gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl px-4 py-2 '+(id===current?'bg-sky-800 text-white':'bg-white')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}{!current?<p className="rounded-xl bg-white p-6">Primero vincula tu cuenta a un condominio.</p>:null}{proposals.error||votes.error?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible cargar las votaciones.</p>:current?<VotacionesGestion key={current} condominio={current} votaciones={proposals.data??[]} misVotos={votes.data??[]} puedeCrear={canCreate}/>:null}</main>
}