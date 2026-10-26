'use client'
import {useState,type FormEvent} from 'react'
export function AgentReply({ticketId}:{ticketId:string}){
 const [message,setMessage]=useState('')
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setNotice('')
  try{
   const r=await fetch('/api/soporte/agente/responder',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket_id:ticketId,message})})
   const data=await r.json()
   if(!r.ok){setNotice(data.error||'No fue posible responder');return}
   setMessage('');setNotice('Respuesta registrada')
  }catch{setNotice('Error de conexión')}finally{setBusy(false)}
 }
 return <form onSubmit={submit} className="mt-3 space-y-2"><label className="block text-xs font-semibold">Responder<textarea className="mt-1 w-full rounded-lg border p-2 text-sm" rows={3} required maxLength={4000} value={message} onChange={e=>setMessage(e.target.value)}/></label><button disabled={busy||!message.trim()} className="rounded-lg bg-sky-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">{busy?'Enviando…':'Enviar respuesta'}</button>{notice?<p role="status" className="text-xs">{notice}</p>:null}</form>
}