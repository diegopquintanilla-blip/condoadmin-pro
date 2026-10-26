'use client'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase/client'
import {AttendancePayrollProposal} from '@/components/personal/AttendancePayrollProposal'
type Worker={id:string;full_name:string}
type Line={id:string;personal_id:string;bruto:number;descuentos:number;neto:number}
export function PayrollDraftLines({condominioId,payrollId,month,staff}:{condominioId:string;payrollId:string;month:string;staff:Worker[]}){
 const [rows,setRows]=useState<Line[]>([])
 const [person,setPerson]=useState(staff[0]?.id??'')
 const [gross,setGross]=useState('')
 const [discount,setDiscount]=useState('0')
 const [basic,setBasic]=useState('')
 const [days,setDays]=useState('30')
 const [basis,setBasis]=useState('30')
 const [dailyHours,setDailyHours]=useState('8')
 const [extra25,setExtra25]=useState('0')
 const [extra35,setExtra35]=useState('0')
 const [additional,setAdditional]=useState('0')
 const [advance,setAdvance]=useState('0')
 const [otherDeduction,setOtherDeduction]=useState('0')
 const [busy,setBusy]=useState(false)
 const [feedback,setFeedback]=useState('')
 const [proposal,setProposal]=useState<Record<string,unknown>|null>(null)
 const [draft,setDraft]=useState(false)
 useEffect(()=>{let active=true;async function load(){
  const [p,l]=await Promise.all([
   supabase.from('hr_payroll_periods').select('estado').eq('id',payrollId).eq('condominio_id',condominioId).maybeSingle(),
   supabase.from('hr_payroll_lines').select('id,personal_id,bruto,descuentos,neto').eq('payroll_id',payrollId).eq('condominio_id',condominioId).order('created_at')
  ])
  if(active){setDraft(p.data?.estado==='borrador');setRows((l.data??[]) as Line[]);setFeedback(p.error||l.error?'No se pudo cargar el detalle de la planilla.':'')}
 }void load();return()=>{active=false}},[payrollId,condominioId])
 const amount=(s:string)=>Number(s)
 const rounded=(v:number)=>Math.round((v+Number.EPSILON)*100)/100
 const validInputs=[basic,days,basis,dailyHours,extra25,extra35,additional,advance,otherDeduction].every(x=>x.trim()!==''&&Number.isFinite(amount(x))&&amount(x)>=0)
 const validBasis=amount(basis)>0&&amount(basis)<=31&&amount(dailyHours)>0&&amount(dailyHours)<=24&&amount(days)<=amount(basis)
 const proportional=validInputs&&validBasis?rounded(amount(basic)*amount(days)/amount(basis)):0
 const overtime25=validInputs&&validBasis?rounded(amount(basic)/amount(basis)/amount(dailyHours)*amount(extra25)*1.25):0
 const overtime35=validInputs&&validBasis?rounded(amount(basic)/amount(basis)/amount(dailyHours)*amount(extra35)*1.35):0
 const computedGross=rounded(proportional+overtime25+overtime35+amount(additional))
 const computedDeductions=rounded(amount(advance)+amount(otherDeduction))
 const validCalculated=validInputs&&validBasis&&computedGross>=computedDeductions&&computedGross<=1000000&&amount(extra25)+amount(extra35)<=200
 async function save(){
  const bruto=computedGross,descuentos=computedDeductions
  if(!staff.some(p=>p.id===person)||!validCalculated){setFeedback('Comprueba el trabajador y los importes.');return}
  if(!draft){setFeedback('Solo se pueden editar planillas en borrador.');return}
  setBusy(true);setFeedback('')
  const {data,error}=await supabase.from('hr_payroll_lines').upsert({payroll_id:payrollId,condominio_id:condominioId,personal_id:person,bruto,descuentos,snapshot:{source:'excel_logic_v1',verified:false,period:month,basic:amount(basic),paid_days:amount(days),day_basis:amount(basis),daily_hours:amount(dailyHours),overtime_hours_25:amount(extra25),overtime_hours_35:amount(extra35),overtime_amount_25:overtime25,overtime_amount_35:overtime35,proportional,additional_income:amount(additional),advance:amount(advance),other_deductions:amount(otherDeduction)}},{onConflict:'payroll_id,personal_id'}).select('id,personal_id,bruto,descuentos,neto').single()
  setBusy(false)
  if(error){setFeedback('No se pudo guardar el importe. Revisa permisos o migraciones.');return}
  setRows(old=>[...old.filter(x=>x.personal_id!==person),data as Line]);setProposal(null)
  setFeedback('Línea guardada como borrador; requiere validación de RR. HH.')
 }
 return <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><h4 className="font-bold">Detalle preliminar de remuneraciones</h4><p className="mt-1 text-xs text-slate-500">Ingreso manual sujeto a validación. Los importes aún no son una liquidación oficial.</p>
 <div className="mt-3 space-y-2">{rows.map(r=><div key={r.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{staff.find(x=>x.id===r.personal_id)?.full_name??'Trabajador registrado'}</span><span>Bruto S/ {Number(r.bruto).toFixed(2)} · Descuentos S/ {Number(r.descuentos).toFixed(2)} · Neto S/ {Number(r.neto).toFixed(2)}</span></div>)}{!rows.length?<p className="text-sm text-slate-500">No se han registrado importes.</p>:null}</div>
 {draft&&staff.length?<div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 p-4">
 <h5 className="font-bold text-slate-900">Cálculo según plantilla Excel</h5>
 <p className="mt-1 text-xs text-slate-600">Días remunerados, básico y horas extras. Importes en soles. El registro queda como borrador sujeto a revisión.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
 <label className="text-xs font-semibold">Trabajador<select value={person} onChange={e=>setPerson(e.target.value)} className="mt-1 w-full rounded-lg border p-2">{staff.map(x=><option key={x.id} value={x.id}>{x.full_name}</option>)}</select></label>
 {([{label:'Sueldo básico S/',val:basic,set:setBasic},{label:'Días remunerados',val:days,set:setDays},{label:'Días base del cálculo',val:basis,set:setBasis},{label:'Horas de jornada diaria',val:dailyHours,set:setDailyHours},{label:'Horas extra 25%',val:extra25,set:setExtra25},{label:'Horas extra 35%',val:extra35,set:setExtra35},{label:'Otros ingresos S/',val:additional,set:setAdditional},{label:'Adelantos S/',val:advance,set:setAdvance},{label:'Otros descuentos S/',val:otherDeduction,set:setOtherDeduction}]).map(field=><label key={field.label} className="text-xs font-semibold">{field.label}<input type="number" min="0" step="0.01" value={field.val} onChange={e=>field.set(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>)}
 </div>
 <div className="mt-4 grid gap-2 sm:grid-cols-4">{[['Sueldo proporcional',proportional],['Horas extras',rounded(overtime25+overtime35)],['Descuentos',computedDeductions],['Neto estimado',rounded(computedGross-computedDeductions)]].map(([title,value])=><div key={String(title)} className="rounded-lg bg-white p-3"><p className="text-xs text-slate-600">{title}</p><strong className="text-lg">S/ {Number(value).toFixed(2)}</strong></div>)}</div>
 {!validCalculated?<p role="alert" className="mt-3 text-xs text-amber-900">Verifica el básico, los días base y los descuentos: no pueden superar los ingresos.</p>:null}
 <button disabled={busy||!validCalculated} type="button" onClick={()=>void save()} className="mt-4 rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar cálculo en borrador'}</button>
 </div>:null}
 {feedback?<p role="status" className="mt-3 text-sm text-amber-900">{feedback}</p>:null}</div>
}
