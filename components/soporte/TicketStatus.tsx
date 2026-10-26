'use client'
import {useRouter} from 'next/navigation'
import {useState} from 'react'
const nextStates:Record<string,{value:string;label:string}[]>={abierto:[{value:'en_revision',label:'En revisión'},{value:'cerrado',label:'Cerrar'}],en_revision:[{value:'resuelto',label:'Resuelto'},{value:'cerrado',label:'Cerrar'}],resuelto:[{value:'en_revision',label:'Reabrir'},{value:'cerrado',label:'Cerrar'}],cerrado:[]}
export function TicketStatus({ticketId,status}:{ticketId:string;status:string}){
 const router=useRouter()
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 async function update(estado:string){
  if(!estado)return
  setBusy(true);setNotice('')
  try{
   const r=await fetch('/api/soporte/agente/estado',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ticket_id:ticketId,estado})})
   const d=await r.json()
   if(!r.ok){setNotice(d.error||'No se pudo actualizar');return}
   setNotice('Estado actualizado');router.refresh()
  }catch{setNotice('Error de conexión')}finally{setBusy(false)}
 }
 return <div className="mt-3 space-y-1"><label className="block text-xs font-semibold text-slate-600">Cambiar estado<select className="mt-1 w-full rounded-lg border p-2 text-sm" disabled={busy||!nextStates[status]?.length} value="" onChange={e=>void update(e.target.value)}><option value="">Seleccionar acción</option>{(nextStates[status]??[]).map(o=><option key={o.value} value={o.value}>{o.label}</option>)}</select></label>{notice?<p role="status" className="text-xs text-slate-600">{notice}</p>:null}</div>
}
