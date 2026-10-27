'use client'
import {useState} from 'react'
import {supabase} from '@/lib/supabase/client'
type Entry={id:string;nota:string;created_at:string}
export function ProspectFollowUp({id,initialDate,initialNotes}:{id:string;initialDate:string|null;initialNotes:Entry[]}){
 const [date,setDate]=useState(initialDate??'')
 const [savedDate,setSavedDate]=useState(initialDate??'')
 const [nota,setNota]=useState('')
 const [notes,setNotes]=useState(initialNotes)
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 async function saveDate(){
  if(busy)return
  if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date)){setMessage('Fecha inválida.');return}
  setBusy(true);setMessage('')
  const {data,error}=await supabase.from('prospectos_comerciales').update({proximo_contacto:date||null}).eq('id',id).select('id,proximo_contacto').single()
  setBusy(false)
  if(error||!data){setMessage('No fue posible programar el seguimiento.');return}
  setSavedDate(data.proximo_contacto??'');setMessage('Próximo contacto actualizado.')
 }
 async function saveNote(){
  const text=nota.trim()
  if(busy||!text||text.length>2000)return
  setBusy(true);setMessage('')
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){setMessage('Inicia sesión nuevamente.');setBusy(false);return}
  const {data,error}=await supabase.from('prospectos_gestiones').insert({prospecto_id:id,actor_id:user.id,nota:text}).select('id,nota,created_at').single()
  setBusy(false)
  if(error||!data){setMessage('No se pudo guardar la gestión.');return}
  setNotes(old=>[data,...old]);setNota('');setMessage('Gestión registrada.')
 }
 return <div className="mt-4 space-y-3 border-t pt-4">
  <div className="flex flex-wrap items-end gap-2"><label className="text-sm font-semibold">Próximo contacto<input type="date" value={date} onChange={e=>setDate(e.target.value)} className="mt-1 block rounded-lg border px-3 py-2"/></label><button disabled={busy||date===savedDate} onClick={()=>void saveDate()} className="rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Guardar fecha</button></div>
  <label className="block text-sm font-semibold">Nota interna de seguimiento<textarea rows={2} maxLength={2000} value={nota} onChange={e=>setNota(e.target.value)} className="mt-1 w-full rounded-lg border p-3" placeholder="Ej. Se envió propuesta comercial..."/></label>
  <button disabled={busy||!nota.trim()} onClick={()=>void saveNote()} className="rounded-lg border border-sky-800 px-4 py-2 text-sm font-bold text-sky-800 disabled:opacity-50">Registrar gestión</button>
  {message?<p role="status" className="text-sm text-slate-700">{message}</p>:null}
  <details className="rounded-lg bg-slate-50 p-3"><summary className="cursor-pointer text-sm font-bold">Historial de gestiones ({notes.length}{notes.length===20?'+':''})</summary><div className="mt-3 max-h-60 space-y-2 overflow-y-auto">{notes.map(x=><div key={x.id} className="rounded-lg border bg-white p-3 text-sm"><p className="text-xs text-slate-500">{new Date(x.created_at).toLocaleString('es-PE',{timeZone:'America/Lima'})}</p><p className="mt-1 whitespace-pre-wrap">{x.nota}</p></div>)}{!notes.length?<p className="text-sm text-slate-500">Sin gestiones todavía.</p>:null}</div></details>
 </div>
}