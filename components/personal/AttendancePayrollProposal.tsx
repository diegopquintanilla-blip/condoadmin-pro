'use client'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase/client'
type Worker={id:string;full_name:string}
type Row={tipo:string;horas_extra_25:number;horas_extra_35:number}
const n=(s:string)=>Number(s)
const money=(v:number)=>Math.round((v+Number.EPSILON)*100)/100
export function AttendancePayrollProposal({condominioId,payrollId,month,staff,onPropose}:{condominioId:string;payrollId:string;month:string;staff:Worker[];onPropose:(workerId:string,gross:string,source:Record<string,unknown>)=>void}){
 const [worker,setWorker]=useState(staff[0]?.id??'')
 const [base,setBase]=useState('')
 const [daysBasis,setDaysBasis]=useState('30')
 const [dailyHours,setDailyHours]=useState('8')
 const [unpaidDays,setUnpaidDays]=useState('0')
 const [rows,setRows]=useState<Row[]>([])
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 useEffect(()=>{let live=true;async function load(){if(!worker)return;setLoading(true);const start=month.slice(0,7)+'-01';const [year,m]=month.slice(0,7).split('-').map(Number);const end=month.slice(0,7)+'-'+String(new Date(year,m,0).getDate()).padStart(2,'0');const {data,error}=await supabase.from('hr_attendance').select('tipo,horas_extra_25,horas_extra_35').eq('condominio_id',condominioId).eq('personal_id',worker).gte('fecha',start).lte('fecha',end);if(live){setRows((data??[]) as Row[]);setError(error?'No se pudo consultar la asistencia.':'');setLoading(false)}}void load();return()=>{live=false}},[condominioId,worker,month])
 const worked=rows.filter(r=>r.tipo==='trabajado').length
 const extra25=rows.reduce((a,r)=>a+Number(r.horas_extra_25),0)
 const extra35=rows.reduce((a,r)=>a+Number(r.horas_extra_35),0)
 const valid=Number.isFinite(n(base))&&n(base)>0&&n(daysBasis)>0&&n(daysBasis)<=31&&n(dailyHours)>0&&n(dailyHours)<=24&&worked<=n(daysBasis)&&n(unpaidDays)>=0&&n(unpaidDays)<=n(daysBasis)&&extra25>=0&&extra35>=0
 const earned=valid?money(n(base)*(n(daysBasis)-n(unpaidDays))/n(daysBasis)):0
 const extra=valid?money(n(base)/n(daysBasis)/n(dailyHours)*(1.25*extra25+1.35*extra35)):0
 return <div className="mt-4 rounded-xl border border-sky-100 bg-sky-50 p-4">
 <h5 className="font-bold text-slate-900">Propuesta desde asistencia</h5><p className="mt-1 text-xs text-slate-600">La asistencia registrada es informativa: los días sin marca NO se descuentan automáticamente. Registra únicamente ausencias sin remuneración previamente verificadas. Revisión laboral obligatoria.</p>
 <div className="mt-3 grid gap-3 sm:grid-cols-4"><label className="text-xs font-semibold">Trabajador<select value={worker} onChange={e=>setWorker(e.target.value)} className="mt-1 w-full rounded-lg border p-2">{staff.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></label><label className="text-xs font-semibold">Sueldo mensual (S/)<input type="number" min="0" step=".01" value={base} onChange={e=>setBase(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><label className="text-xs font-semibold">Días base del período<input type="number" min="1" max="31" value={daysBasis} onChange={e=>setDaysBasis(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><label className="text-xs font-semibold">Horas por jornada<input type="number" min="1" max="24" step=".5" value={dailyHours} onChange={e=>setDailyHours(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><label className="text-xs font-semibold">Días no remunerados verificados<input type="number" min="0" max="31" step="1" value={unpaidDays} onChange={e=>setUnpaidDays(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label></div>
 <p className="mt-3 text-sm">Jornadas: <strong>{worked}</strong> · Horas 25%: <strong>{extra25}</strong> · Horas 35%: <strong>{extra35}</strong></p><p className="mt-2 text-sm">Sueldo con ausencias descontables: <strong>S/ {earned.toFixed(2)}</strong> · Extras: <strong>S/ {extra.toFixed(2)}</strong> · Bruto propuesto: <strong>S/ {money(earned+extra).toFixed(2)}</strong></p>
 <button type="button" disabled={!valid||loading||Boolean(error)||!rows.length} onClick={()=>onPropose(worker,money(earned+extra).toFixed(2),{source:'attendance_proposal',verified:false,period:month,worked_days_recorded:worked,unpaid_days:n(unpaidDays),extra_hours_25:extra25,extra_hours_35:extra35,monthly_base:n(base),day_basis:n(daysBasis),daily_hours:n(dailyHours)})} className="mt-3 rounded-lg bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Copiar propuesta al borrador</button>
 {error?<p role="alert" className="mt-2 text-xs text-red-700">{error}</p>:null}
 {!loading&&!rows.length?<p className="mt-2 text-xs text-amber-800">Sin asistencia registrada; no se calcula remuneración automática.</p>:null}
 </div>
}
