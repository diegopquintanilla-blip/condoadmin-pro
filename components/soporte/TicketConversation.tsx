'use client'
import {useState,type FormEvent} from 'react'
type Message={id:string;body:string;created_at:string;author_id:string}
export function TicketConversation({ticketId}:{ticketId:string}){
 const [open,setOpen]=useState(false),[messages,setMessages]=useState<Message[]>([]),[body,setBody]=useState(''),[loading,setLoading]=useState(false),[notice,setNotice]=useState('')
 async function load(){
  setLoading(true);setNotice('')
  try{const r=await fetch('/api/soporte/mensajes?ticket_id='+encodeURIComponent(ticketId),{cache:'no-store'});const d=await r.json();if(!r.ok){setNotice(d.error||'Sin mensajes disponibles');return}setMessages(d.messages||[])}
  catch{setNotice('Error de conexión')}finally{setLoading(false)}
 }
 async function send(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);setNotice('')
  try{const r=await fetch('/api/soporte/mensajes',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket_id:ticketId,message:body})});const d=await r.json();if(!r.ok){setNotice(d.error||'No se pudo enviar');return}setBody('');await load()}
  catch{setNotice('Error de conexión')}finally{setLoading(false)}
 }
 return <div className="mt-3">
 <button type="button" className="text-sm font-semibold text-sky-800 underline" onClick={()=>{setOpen(!open);if(!open)void load()}}>{open?'Ocultar conversación':'Ver conversación'}</button>
 {open?<div className="mt-3 space-y-3 rounded-xl bg-slate-50 p-3">{loading?<p className="text-xs text-slate-500">Cargando…</p>:null}{messages.length?messages.map(m=><div key={m.id} className="rounded-lg border bg-white p-3"><p className="whitespace-pre-wrap break-words text-sm">{m.body}</p><p className="mt-1 text-xs text-slate-500">{new Date(m.created_at).toLocaleString('es-PE')}</p></div>):<p className="text-xs text-slate-500">Sin mensajes registrados</p>}<form className="space-y-2" onSubmit={send}><textarea required maxLength={4000} rows={3} value={body} onChange={e=>setBody(e.target.value)} className="w-full rounded-lg border p-2 text-sm" placeholder="Escribe un mensaje (sin contraseñas ni datos bancarios)"/><button disabled={loading} className="rounded-lg bg-sky-800 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">Enviar mensaje</button></form>{notice?<p role="status" className="text-xs text-amber-800">{notice}</p>:null}</div>:null}
 </div>
}
