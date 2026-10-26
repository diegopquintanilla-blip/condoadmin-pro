'use client'
import {useState} from 'react'
import {supabase} from '@/lib/supabase/client'
export function PayrollReviewActions({id,status,onUpdated}:{id:string;status:string;onUpdated:(s:string)=>void}){
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const action=status==='borrador'?'enviar_revision':status==='en_revision'?'devolver_borrador':null
 if(!action)return <p className="mt-2 text-xs text-slate-500">Estado bloqueado: no se permiten cambios desde esta pantalla.</p>
 async function submit(){
  setBusy(true);setMessage('')
  const {data,error}=await supabase.rpc('hr_transition_payroll_review',{p_payroll_id:id,p_action:action})
  setBusy(false)
  if(error){setMessage('No fue posible cambiar el estado. Comprueba la autorización y la migración.');return}
  if(typeof data==='string')onUpdated(data)
  setMessage('Transición registrada con auditoría.')
 }
 return <div className="mt-3"><button type="button" disabled={busy} onClick={()=>void submit()} className="rounded-lg border border-sky-300 bg-sky-50 px-3 py-2 text-xs font-bold text-sky-900 disabled:opacity-50">{busy?'Procesando…':action==='enviar_revision'?'Enviar a revisión':'Devolver a borrador'}</button>{message?<p role="status" className="mt-2 text-xs text-slate-600">{message}</p>:null}</div>
}
