'use client'
import {useEffect,useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import {CalendarDays} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'
type Worker={id:string;full_name:string}
type Day={fecha:string;tipo:string;horas_ordinarias:number;horas_extra_25:number;horas_extra_35:number;observaciones:string|null}
const pad=(n:number)=>String(n).padStart(2,'0')
export function MonthlyAttendance({condominioId,staff}:{condominioId:string;staff:Worker[]}){
 const router=useRouter()
 const today=new Date()
 const [month,setMonth]=useState(today.getFullYear()+'-'+pad(today.getMonth()+1))
 const [person,setPerson]=useState(staff[0]?.id??'')
 const [rows,setRows]=useState<Day[]>([])
 const [selected,setSelected]=useState('')
 const [kind,setKind]=useState('trabajado')
 const [hours,setHours]=useState('8')
 const [h25,setH25]=useState('0')
 const [h35,setH35]=useState('0')
 const [note,setNote]=useState('')
 const [loading,setLoading]=useState(false)
 const [saving,setSaving]=useState(false)
 const [notice,setNotice]=useState('')
 const monthValid=/^\d{4}-(0[1-9]|1[0-2])$/.test(month)
 const dates=useMemo(()=>{if(!monthValid)return [];const [y,m]=month.split('-').map(Number);return Array.from({length:new Date(y,m,0).getDate()},(_,i)=>month+'-'+pad(i+1))},[month,monthValid])
 useEffect(()=>{if(!person||!monthValid)return;let live=true;const fetchRows=async()=>{setLoading(true);const {data,error}=await supabase.from('hr_attendance').select('fecha,tipo,horas_ordinarias,horas_extra_25,horas_extra_35,observaciones').eq('condominio_id',condominioId).eq('personal_id',person).gte('fecha',month+'-01').lte('fecha',dates[dates.length-1]).order('fecha');if(live){setRows((data??[]) as Day[]);setNotice(error?'La asistencia aún no está habilitada o no tienes permisos.':'');setLoading(false)}};void fetchRows();return()=>{live=false}},[condominioId,person,month,monthValid,dates])
 const byDate=useMemo(()=>new Map(rows.map(r=>[r.fecha,r])),[rows])
 function selectDate(date:string){setSelected(date);const r=byDate.get(date);setKind(r?.tipo??'trabajado');setHours(String(r?.horas_ordinarias??8));setH25(String(r?.horas_extra_25??0));setH35(String(r?.horas_extra_35??0));setNote(r?.observaciones??'')}
 async function save(){
  if(!selected||!staff.some(s=>s.id===person))return
  const v=[hours,h25,h35].map(Number);if(v.some(x=>!Number.isFinite(x)||x<0||x>24)||v.reduce((s,x)=>s+x,0)>24){setNotice('Las horas deben ser válidas y no superar 24 por día.');return}
  setSaving(true);setNotice('')
  const {error}=await supabase.from('hr_attendance').upsert({condominio_id:condominioId,personal_id:person,fecha:selected,tipo:kind,horas_ordinarias:v[0],horas_extra_25:v[1],horas_extra_35:v[2],observaciones:note.trim()||null},{onConflict:'condominio_id,personal_id,fecha'})
  setSaving(false)
  if(error){setNotice('No fue posible guardar el registro; comprueba permisos y migración.');return}
  setRows(old=>[...old.filter(x=>x.fecha!==selected),{fecha:selected,tipo:kind,horas_ordinarias:v[0],horas_extra_25:v[1],horas_extra_35:v[2],observaciones:note.trim()||null}].sort((a,b)=>a.fecha.localeCompare(b.fecha)))
  setNotice('Asistencia registrada correctamente.');router.refresh()
 }
 if(!staff.length)return null
 const count=rows.filter(r=>r.tipo==='trabajado').length
 const overtime=rows.reduce((n,r)=>n+Number(r.horas_extra_25)+Number(r.horas_extra_35),0)
 return <section className="rounded-3xl border bg-white p-6 shadow-sm">
  <h2 className="flex items-center gap-2 text-xl font-extrabold"><CalendarDays className="text-sky-700"/> Control mensual de asistencia</h2>
  <p className="mt-2 text-sm text-slate-500">Selecciona un trabajador y un día. Solo se contabilizan registros guardados, sin inventar asistencia.</p>
  <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Trabajador<select value={person} onChange={e=>{setPerson(e.target.value);setSelected('')}} className="mt-2 w-full rounded-xl border p-3">{staff.map(s=><option key={s.id} value={s.id}>{s.full_name}</option>)}</select></label><label className="text-sm font-semibold">Mes<input type="month" value={month} onChange={e=>{setMonth(e.target.value);setSelected('')}} className="mt-2 w-full rounded-xl border p-3"/></label></div>
  <div className="mt-4 flex flex-wrap gap-3 text-sm"><span className="rounded-lg bg-sky-50 px-3 py-2 font-semibold">{count} días registrados como trabajados</span><span className="rounded-lg bg-amber-50 px-3 py-2 font-semibold">{overtime.toFixed(2)} h extras registradas</span>{loading?<span>Consultando registros…</span>:null}</div>
  <div className="mt-5 grid grid-cols-7 gap-2">{['L','M','M','J','V','S','D'].map((d,i)=><span key={i} className="text-center text-xs font-bold text-slate-500">{d}</span>)}{dates.length?Array.from({length:(new Date(dates[0]+'T12:00:00').getDay()+6)%7},(_,i)=><span key={'pad'+i}/>):null}{dates.map(date=>{const r=byDate.get(date);return <button key={date} type="button" onClick={()=>selectDate(date)} aria-label={date+(r?' '+r.tipo:' sin registrar')} className={'min-h-12 rounded-xl border p-2 text-sm font-bold '+(selected===date?'border-sky-700 bg-sky-800 text-white':r?'border-emerald-200 bg-emerald-50 text-emerald-900':'border-slate-200 text-slate-600 hover:bg-slate-50')}>{Number(date.slice(-2))}{r?<span className="block text-[9px] font-normal">{r.tipo.slice(0,4)}</span>:null}</button>})}</div>
  {selected?<div className="mt-5 rounded-2xl bg-slate-50 p-4"><h3 className="font-bold">Registro del {selected}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-bold">Situación<select value={kind} onChange={e=>setKind(e.target.value)} className="mt-1 w-full rounded-lg border p-2">{['trabajado','descanso','falta','vacaciones','licencia','feriado'].map(v=><option key={v} value={v}>{v}</option>)}</select></label>{[{label:'Horas ordinarias',value:hours,set:setHours},{label:'Horas extra 25%',value:h25,set:setH25},{label:'Horas extra 35%',value:h35,set:setH35}].map(x=><label key={x.label} className="text-xs font-bold">{x.label}<input type="number" min="0" max="24" step=".5" value={x.value} onChange={e=>x.set(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>)}</div><label className="mt-3 block text-xs font-bold">Observaciones<textarea maxLength={500} value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border p-2"/></label><button type="button" onClick={()=>void save()} disabled={saving} className="mt-3 rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving?'Guardando…':'Guardar asistencia'}</button></div>:null}
  {notice?<p role="status" className="mt-3 text-sm text-amber-900">{notice}</p>:null}
  <p className="mt-4 text-xs text-slate-500">Los registros de asistencia requieren revisión de RR. HH. antes de liquidar pagos; no se generan remuneraciones automáticamente.</p>
 </section>
}
