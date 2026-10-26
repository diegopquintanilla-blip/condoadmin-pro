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
 async function save(){
  const bruto=Number(gross),descuentos=Number(discount)
  if(!staff.some(p=>p.id===person)||!Number.isFinite(bruto)||!Number.isFinite(descuentos)||bruto<0||descuentos<0||descuentos>bruto||bruto>1000000){setFeedback('Comprueba el trabajador y los importes.');return}
  if(!draft){setFeedback('Solo se pueden editar planillas en borrador.');return}
  setBusy(true);setFeedback('')
  const {data,error}=await supabase.from('hr_payroll_lines').upsert({payroll_id:payrollId,condominio_id:condominioId,personal_id:person,bruto,descuentos,snapshot:proposal??{source:'manual_draft',verified:false}},{onConflict:'payroll_id,personal_id'}).select('id,personal_id,bruto,descuentos,neto').single()
  setBusy(false)
  if(error){setFeedback('No se pudo guardar el importe. Revisa permisos o migraciones.');return}
  setRows(old=>[...old.filter(x=>x.personal_id!==person),data as Line]);setProposal(null)
  setFeedback('Línea guardada como borrador; requiere validación de RR. HH.')
 }
 const totalGross=rows.reduce((sum,row)=>sum+Number(row.bruto),0)
 const totalDiscount=rows.reduce((sum,row)=>sum+Number(row.descuentos),0)
 const totalNet=rows.reduce((sum,row)=>sum+Number(row.neto),0)
 return <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4"><h4 className="font-bold">Detalle preliminar de remuneraciones</h4><p className="mt-1 text-xs text-slate-500">Ingreso manual sujeto a validación. Los importes aún no son una liquidación oficial.</p>
 <div className="mt-3 grid gap-2 sm:grid-cols-4">{[['Trabajadores',String(rows.length)],['Bruto','S/ '+totalGross.toFixed(2)],['Descuentos','S/ '+totalDiscount.toFixed(2)],['Neto preliminar','S/ '+totalNet.toFixed(2)]].map(([label,value])=><div key={label} className="rounded-xl bg-sky-50 p-3"><p className="text-xs text-slate-600">{label}</p><p className="mt-1 font-extrabold">{value}</p></div>)}</div>
 {rows.length===0?<p className="mt-3 text-xs font-semibold text-amber-700">No se puede enviar a revisión una planilla sin trabajadores registrados.</p>:null}
 <div className="mt-3 space-y-2">{rows.map(r=><div key={r.id} className="flex flex-wrap justify-between gap-2 rounded-lg bg-slate-50 p-3 text-sm"><span className="font-semibold">{staff.find(x=>x.id===r.personal_id)?.full_name??'Trabajador registrado'}</span><span>Bruto S/ {Number(r.bruto).toFixed(2)} · Descuentos S/ {Number(r.descuentos).toFixed(2)} · Neto S/ {Number(r.neto).toFixed(2)}</span></div>)}{!rows.length?<p className="text-sm text-slate-500">No se han registrado importes.</p>:null}</div>
 {draft&&staff.length?<AttendancePayrollProposal condominioId={condominioId} payrollId={payrollId} month={month} staff={staff} onPropose={(workerId,proposed,source)=>{setPerson(workerId);setGross(proposed);setProposal(source);setFeedback('Propuesta copiada: revisa descuentos y guarda manualmente la línea.')}}/>:null}
 {draft&&staff.length?<div className="mt-4 grid gap-3 sm:grid-cols-4"><label className="text-xs font-semibold">Trabajador<select value={person} onChange={e=>setPerson(e.target.value)} className="mt-1 w-full rounded-lg border p-2">{staff.map(x=><option key={x.id} value={x.id}>{x.full_name}</option>)}</select></label><label className="text-xs font-semibold">Bruto (S/)<input type="number" step=".01" min="0" max="1000000" value={gross} onChange={e=>setGross(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><label className="text-xs font-semibold">Descuentos (S/)<input type="number" step=".01" min="0" value={discount} onChange={e=>setDiscount(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label><button type="button" disabled={busy} onClick={()=>void save()} className="self-end rounded-lg bg-sky-800 px-3 py-2 text-sm font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar línea'}</button></div>:null}
 {feedback?<p role="status" className="mt-3 text-sm text-amber-900">{feedback}</p>:null}</div>
}
