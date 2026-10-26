'use client'
import {useEffect,useState} from 'react'
type Msg={id:string;author_id:string;body:string;created_at:string}
type Ticket={id:string;asunto:string;descripcion:string;created_by:string}
export function AgentConversation({ticketId}:{ticketId:string}){
 const [open,setOpen]=useState(false)
 const [messages,setMessages]=useState<Msg[]>([])
 const [ticket,setTicket]=useState<Ticket|null>(null)
 const [loading,setLoading]=useState(false)
 const [error,setError]=useState('')
 async function load(){
  setLoading(true);setError('')
  try{
   const r=await fetch('/api/soporte/agente/conversacion?ticket_id='+encodeURIComponent(ticketId),{cache:'no-store'})
   const d=await r.json()
   if(!r.ok){setError(d.error||'No disponible');return}
   setTicket(d.ticket);setMessages(d.messages??[])
  }catch{setError('No se pudo consultar la conversación')}finally{setLoading(false)}
 }
 useEffect(()=>{if(!open)return;void load()},[open])
 return <section className="mt-4 min-w-0">
  <button type="button" onClick={()=>setOpen(x=>!x)} className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-900">{open?'Ocultar conversación':'Ver conversación'}</button>
  {open?<div className="mt-3 max-w-2xl rounded-xl border bg-slate-50 p-4">
   <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="font-bold">Historial de mensajes</h4><button type="button" disabled={loading} onClick={()=>void load()} className="text-xs font-semibold text-sky-700 underline">Actualizar</button></div>
   {loading?<p className="mt-2 text-sm text-slate-500">Consultando…</p>:null}
   {error?<p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>:null}
   {ticket?<div className="mt-3 rounded-lg bg-white p-3"><p className="text-xs font-semibold text-slate-500">Solicitud inicial</p><p className="whitespace-pre-wrap break-words text-sm">{ticket.descripcion}</p></div>:null}
   <div className="mt-3 max-h-96 space-y-2 overflow-y-auto">{messages.map(m=><div key={m.id} className={'rounded-lg border p-3 '+(m.author_id===ticket?.created_by?'bg-white':'bg-sky-50 border-sky-200')}><p className="text-xs font-bold text-slate-600">{m.author_id===ticket?.created_by?'Solicitante':'Agente de soporte'}</p><p className="mt-1 whitespace-pre-wrap break-words text-sm">{m.body}</p><p className="mt-2 text-xs text-slate-500">{new Date(m.created_at).toLocaleString('es-PE')}</p></div>)}</div>
   {!loading&&!messages.length?<p className="mt-3 text-sm text-slate-500">Sin respuestas adicionales.</p>:null}
  </div>:null}
 </section>
}
