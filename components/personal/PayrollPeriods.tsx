'use client'
import {useEffect,useState} from 'react'
import {CalendarRange,LockKeyhole} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'
type Period={id:string;periodo:string;estado:string;created_at:string}
export function PayrollPeriods({condominioId}:{condominioId:string}){
 const [periods,setPeriods]=useState<Period[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{let active=true;async function load(){
 const {data,error}=await supabase.from('hr_payroll_periods').select('id,periodo,estado,created_at').eq('condominio_id',condominioId).order('periodo',{ascending:false}).limit(24)
 if(active){setPeriods((data??[]) as Period[]);setError(error?'Historial no disponible hasta aplicar y validar la migración de planillas.':'');setLoading(false)}
 }void load();return()=>{active=false}},[condominioId])
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center gap-3"><CalendarRange className="text-sky-700"/><h2 className="text-xl font-extrabold">Planillas mensuales</h2></div>
  <p className="mt-2 text-sm text-slate-500">Períodos de nómina separados por condominio, con historial y control de estados.</p>
  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><LockKeyhole className="mr-2 inline h-4 w-4"/>La emisión y aprobación están bloqueadas hasta completar las pruebas legales, de seguridad y de auditoría. No se generan pagos.</div>
  {loading?<p className="mt-4 text-sm text-slate-500">Consultando historial…</p>:error?<p role="alert" className="mt-4 text-sm text-amber-900">{error}</p>:!periods.length?<p className="mt-4 text-sm text-slate-500">Aún no existen planillas registradas.</p>:<div className="mt-4 space-y-2">{periods.map(p=><div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border p-4"><span className="font-semibold">{p.periodo.slice(0,7)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">{p.estado.replaceAll('_',' ')}</span></div>)}</div>}
 </section>
}
