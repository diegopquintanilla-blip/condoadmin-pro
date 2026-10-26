'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
export function EmploymentTerms({condominioId,staff}:{condominioId:string;staff:{id:string;full_name:string}[]}){
 const router=useRouter()
 const [person,setPerson]=useState(staff[0]?.id??'')
 const [type,setType]=useState('dependiente')
 const [regime,setRegime]=useState('pendiente_verificacion')
 const [salary,setSalary]=useState('')
 const [fee,setFee]=useState('')
 const [hours,setHours]=useState('8')
 const [start,setStart]=useState('')
 const [end,setEnd]=useState('')
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
 e.preventDefault();setNotice('')
 if(!staff.some(x=>x.id===person)||!start||end&&end<start){setNotice('Selecciona un trabajador y verifica las fechas.');return}
 setBusy(true)
 const {error}=await supabase.from('hr_employee_terms').upsert({condominio_id:condominioId,personal_id:person,vinculo:type,regimen:regime,sueldo_base:type==='dependiente'?Number(salary||0):0,honorario_referencial:type==='independiente'?Number(fee||0):0,jornada_horas:hours?Number(hours):null,fecha_inicio:start,fecha_fin:end||null},{onConflict:'condominio_id,personal_id'})
 setBusy(false)
 if(error){setNotice('No se pudo guardar. El esquema de RR. HH. sigue pendiente de activación o faltan permisos.');return}
 setNotice('Ficha laboral guardada correctamente.');router.refresh()
 }
 if(!staff.length)return <p className="rounded-xl bg-white p-5 text-sm text-slate-600">Registra primero un trabajador para completar su ficha laboral.</p>
 return <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold">Ficha laboral y condiciones de pago</h2><p className="mt-2 text-sm text-slate-500">Datos reservados para administración. No ejecuta pagos ni genera declaraciones oficiales.</p>
 <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 <label className="text-sm font-semibold">Trabajador<select required value={person} onChange={e=>setPerson(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{staff.map(x=><option key={x.id} value={x.id}>{x.full_name}</option>)}</select></label>
 <label className="text-sm font-semibold">Tipo de vínculo<select value={type} onChange={e=>setType(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="dependiente">Dependiente</option><option value="independiente">Servicios independientes</option></select></label>
 <label className="text-sm font-semibold">Régimen / verificación<input required maxLength={120} value={regime} onChange={e=>setRegime(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 {type==='dependiente'?<label className="text-sm font-semibold">Sueldo mensual (S/)<input required type="number" min="0" max="1000000" step=".01" value={salary} onChange={e=>setSalary(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>:<label className="text-sm font-semibold">Honorario referencial (S/)<input required type="number" min="0" max="1000000" step=".01" value={fee} onChange={e=>setFee(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>}
 <label className="text-sm font-semibold">Horas diarias<input type="number" min="1" max="24" step=".5" value={hours} onChange={e=>setHours(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold">Fecha de inicio<input required type="date" value={start} onChange={e=>setStart(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold">Fecha de fin (opcional)<input type="date" value={end} onChange={e=>setEnd(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 </div><button type="submit" disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar condiciones laborales'}</button>{notice?<p role="status" className="mt-3 text-sm text-slate-700">{notice}</p>:null}</form>
}
