'use client'
import {useEffect,useState} from 'react'
import {CalendarRange,LockKeyhole} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'
import {PayrollDraftLines} from '@/components/personal/PayrollDraftLines'
type Period={id:string;periodo:string;estado:string;created_at:string}
export function PayrollPeriods({condominioId,staff}:{condominioId:string;staff:{id:string;full_name:string}[]}){
 const [periods,setPeriods]=useState<Period[]>([])
 const [loading,setLoading]=useState(true)
 const [error,setError]=useState('')
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
 const [saving,setSaving]=useState(false)
 const [feedback,setFeedback]=useState('')
 useEffect(()=>{let active=true;async function load(){
 const {data,error}=await supabase.from('hr_payroll_periods').select('id,periodo,estado,created_at').eq('condominio_id',condominioId).order('periodo',{ascending:false}).limit(24)
 if(active){setPeriods((data??[]) as Period[]);setError(error?'Historial no disponible hasta aplicar y validar la migración de planillas.':'');setLoading(false)}
 }void load();return()=>{active=false}},[condominioId])
 async function createDraft(){
  if(!/^\\d{4}-(0[1-9]|1[0-2])$/.test(month)){setFeedback('Selecciona un mes válido.');return}
  setSaving(true);setFeedback('')
  const {data:{user},error:authError}=await supabase.auth.getUser()
  if(authError||!user){setFeedback('La sesión no está disponible.');setSaving(false);return}
  const {data,error:writeError}=await supabase.from('hr_payroll_periods').insert({condominio_id:condominioId,periodo:month+'-01',estado:'borrador',created_by:user.id}).select('id,periodo,estado,created_at').single()
  if(writeError){setFeedback(writeError.code==='23505'?'Ya existe una planilla para ese período.':'No se pudo crear el borrador. Verifica permisos y migraciones.');setSaving(false);return}
  setPeriods(old=>[data as Period,...old].sort((a,b)=>b.periodo.localeCompare(a.periodo)))
  setFeedback('Borrador creado. No se han generado pagos.');setSaving(false)
 }
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center gap-3"><CalendarRange className="text-sky-700"/><h2 className="text-xl font-extrabold">Planillas mensuales</h2></div>
  <p className="mt-2 text-sm text-slate-500">Períodos de nómina separados por condominio, con historial y control de estados.</p>
  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900"><LockKeyhole className="mr-2 inline h-4 w-4"/>La emisión y aprobación están bloqueadas hasta completar las pruebas legales, de seguridad y de auditoría. No se generan pagos.</div>
  <div className="mt-5 flex flex-wrap items-end gap-3 rounded-xl border border-sky-100 bg-sky-50 p-4"><label className="text-sm font-semibold">Período del borrador<input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="mt-2 block rounded-lg border border-slate-300 bg-white p-2"/></label><button type="button" onClick={()=>void createDraft()} disabled={saving||loading} className="rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving?'Creando…':'Crear borrador mensual'}</button></div>
  {feedback?<p role="status" className="mt-3 text-sm text-slate-700">{feedback}</p>:null}
  {loading?<p className="mt-4 text-sm text-slate-500">Consultando historial…</p>:error?<p role="alert" className="mt-4 text-sm text-amber-900">{error}</p>:!periods.length?<p className="mt-4 text-sm text-slate-500">Aún no existen planillas registradas.</p>:<div className="mt-4 space-y-2">{periods.map(p=><div key={p.id} className="flex items-center justify-between gap-3 rounded-xl border p-4"><span className="font-semibold">{p.periodo.slice(0,7)}</span><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize">{p.estado.replaceAll('_',' ')}</span><PayrollDraftLines condominioId={condominioId} payrollId={p.id} staff={staff}/></div>)}</div>}
 </section>
}
