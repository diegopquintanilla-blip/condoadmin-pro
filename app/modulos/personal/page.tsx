import Link from 'next/link'
import {redirect} from 'next/navigation'
import {Users,ArrowLeft} from 'lucide-react'
import {createSupabaseServerClient} from '@/lib/supabase/server'
import {RegistrarTrabajador} from '@/components/personal/RegistrarTrabajador'
import {PayrollPreview} from '@/components/personal/PayrollPreview'
import {EmploymentTerms} from '@/components/personal/EmploymentTerms'
export default async function PersonalPage({searchParams}:{searchParams:Promise<{condominio?:string;pagina?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:membershipError}=await db.from('condominio_usuarios').select('condominio_id,role').eq('user_id',user.id).eq('is_active',true)
 if(membershipError)return <main role="alert" className="rounded-xl bg-red-50 p-5 text-red-700">No fue posible verificar tus permisos.</main>
 const ids=(members??[]).map(x=>String(x.condominio_id))
 const query=await searchParams
 const current=query.condominio&&ids.includes(query.condominio)?query.condominio:ids[0]
 const page=Math.max(1,Math.min(10000,Number.parseInt(query.pagina||'1',10)||1))
 const canAdmin=members?.some(x=>String(x.condominio_id)===current&&['super_admin','admin','junta'].includes(String(x.role)))??false
 const [condos,staff]=await Promise.all([
  ids.length?db.from('condominios').select('id,nombre').in('id',ids):Promise.resolve({data:[] as {id:string;nombre:string}[]}),
  current&&canAdmin?db.from('personal').select('id,full_name,cargo,area_asignada,turno,fecha_ingreso,estado',{count:'exact'}).eq('condominio_id',current).order('full_name').range((page-1)*25,page*25-1):Promise.resolve({data:[],count:0,error:null})
 ])
 const names=new Map((condos.data??[]).map(x=>[String(x.id),String(x.nombre)]))
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16}/> Volver al dashboard</Link><h1 className="mt-5 flex items-center gap-3 text-3xl font-extrabold"><Users/> Personal</h1><p className="mt-2 text-sm text-sky-100">Gestiona trabajadores, cargos y turnos. Simula remuneraciones y honorarios antes de preparar la planilla.</p></header>
 {ids.length>1?<nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 text-sm '+(current===id?'bg-sky-800 text-white':'bg-white text-slate-700')}>{names.get(id)||id.slice(0,8)}</Link>)}</nav>:null}
 {!current?<p className="rounded-xl border bg-white p-5">Primero configura un condominio.</p>:null}
 {current&&canAdmin?<PayrollPreview/>:null}
 {current&&canAdmin?<EmploymentTerms condominioId={current} staff={(staff.data??[]).map(x=>({id:x.id,full_name:x.full_name}))}/>:null}
 {current&&canAdmin?<RegistrarTrabajador key={current} condominioId={current}/>:current?<p className="rounded-xl bg-amber-50 p-5 text-sm">Los datos laborales están disponibles únicamente para administración y junta.</p>:null}
 {current&&canAdmin?<section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3 p-6"><h2 className="text-lg font-bold">Personal registrado</h2><span className="rounded-full bg-sky-50 px-3 py-1 text-sm font-semibold text-sky-800">{staff.count??0} trabajadores</span></div>{staff.error?<p role="alert" className="px-6 pb-6 text-red-700">No fue posible consultar el personal.</p>:staff.data?.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr>{['Trabajador','Cargo','Área','Turno','Ingreso','Estado'].map(x=><th key={x} className="p-4">{x}</th>)}</tr></thead><tbody>{staff.data.map(x=><tr key={x.id} className="border-t border-slate-100"><td className="p-4 font-semibold">{x.full_name}</td><td className="p-4">{x.cargo||'—'}</td><td className="p-4">{x.area_asignada||'—'}</td><td className="p-4">{x.turno||'—'}</td><td className="p-4">{x.fecha_ingreso||'—'}</td><td className="p-4 capitalize">{x.estado}</td></tr>)}</tbody></table></div>:<p className="px-6 pb-6 text-sm text-slate-500">Aún no hay trabajadores registrados.</p>}</section>:null}
 {canAdmin&&(staff.count??0)>25?<nav className="flex gap-3 text-sm">{page>1?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page-1)}>Anterior</Link>:null}{page*25<(staff.count??0)?<Link className="rounded-lg border bg-white px-4 py-2" href={'?condominio='+current+'&pagina='+(page+1)}>Siguiente</Link>:null}</nav>:null}
 </main>
}