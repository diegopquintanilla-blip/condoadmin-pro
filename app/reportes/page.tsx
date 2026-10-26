import Link from 'next/link'
import {redirect} from 'next/navigation'
import {createSupabaseServerClient} from '@/lib/supabase/server'
export default async function ReportesPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const db=await createSupabaseServerClient()
 const {data:{user}}=await db.auth.getUser()
 if(!user)redirect('/login')
 const {data:members,error:accessError}=await db.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true)
 if(accessError)return <main role="alert">Error verificando autorización.</main>
 const ids=(members??[]).map(m=>String(m.condominio_id))
 const requested=(await searchParams).condominio
 const current=requested&&ids.includes(requested)?requested:ids[0]
 const {data:condos}=ids.length?await db.from('condominios').select('id,nombre').in('id',ids):{data:[]}
 const labels=new Map((condos??[]).map(c=>[c.id,c.nombre]))
 const tables=['inmuebles','residentes','incidencias','tareas','comunicados','recibos','pagos'] as const
 const summary=current?await Promise.all(tables.map(table=>db.from(table).select('id',{count:'exact',head:true}).eq('condominio_id',current))):[]
 const failed=summary.some(r=>r.error)
 return <main className="mx-auto max-w-7xl space-y-6"><header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white"><Link href="/dashboard" className="text-sm text-sky-100">← Volver al Dashboard</Link><h1 className="mt-4 text-3xl font-extrabold">Reporte ejecutivo</h1><p className="mt-2 text-sky-100">Conteos en tiempo real, por condominio autorizado. Sin datos estimados.</p></header>
 <nav className="flex flex-wrap gap-2">{ids.map(id=><Link key={id} href={'/reportes?condominio='+encodeURIComponent(id)} className={'rounded-xl border px-4 py-2 '+(id===current?'bg-sky-800 text-white':'bg-white')}>{labels.get(id)||id.slice(0,8)}</Link>)}</nav>
 {!current?<p className="rounded-xl border bg-white p-6">No hay condominios asignados.</p>:null}
 {failed?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">Algunas consultas fallaron; comprueba los permisos antes de utilizar este resumen.</p>:null}
 <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{tables.map((table,i)=><div key={table} className="rounded-2xl border bg-white p-6 shadow-sm"><p className="text-sm font-semibold capitalize text-slate-500">{table}</p><p className="mt-4 text-3xl font-extrabold">{current&&!summary[i]?.error?summary[i]?.count??0:'—'}</p></div>)}</section>
 <p className="text-sm text-slate-500">Los conteos indican cantidad de registros. No equivalen a ingresos, deuda ni indicadores de desempeño. La exportación y gráficos históricos requieren una fase adicional.</p></main>
}