'use client'
import {useEffect,useRef,useState} from 'react'
import {CheckCheck,Check} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'
type Notice={id:string;ticket_id:string;event_type:string;created_at:string;read_at:string|null}
const labels:Record<string,string>={ticket_created:'Nueva solicitud de soporte',agent_replied:'Soporte respondió a tu solicitud',customer_replied:'El solicitante respondió',status_changed:'Estado de solicitud actualizado'}
export function NotificationList({initial}:{initial:Notice[]}){
 const [items,setItems]=useState(initial)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function mark(ids:string[]){
  if(!ids.length||busy)return
  setBusy(true);setError('')
  try{
   const {data:{user},error:authError}=await supabase.auth.getUser()
   if(authError||!user){setError('Tu sesión ya no está activa.');return}
   const stamp=new Date().toISOString()
   const {data,error:writeError}=await supabase.from('support_notifications').update({read_at:stamp}).eq('recipient_id',user.id).in('id',ids).is('read_at',null).select('id')
   if(writeError){setError('No se pudieron marcar las notificaciones.');return}
   const updated=new Set((data??[]).map(row=>row.id))
   setItems(old=>old.map(item=>updated.has(item.id)?{...item,read_at:stamp}:item))
   window.dispatchEvent(new Event('support-notifications-updated'))
  }catch{setError('No se pudo conectar con el servidor.')}finally{setBusy(false)}
 }
 const hasAcknowledged=useRef(false)
 useEffect(()=>{
  if(hasAcknowledged.current)return
  hasAcknowledged.current=true
  const ids=initial.filter(item=>!item.read_at).map(item=>item.id)
  if(ids.length)void mark(ids)
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[])
 const unread=items.filter(x=>!x.read_at)
 return <div className="space-y-4">
  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">{unread.length} sin leer</p><button type="button" disabled={busy||!unread.length} onClick={()=>void mark(unread.map(x=>x.id))} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"><CheckCheck size={16}/> Marcar todas como leídas</button></div>
  {error?<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>:null}
  {!items.length?<p className="text-slate-500">No hay notificaciones registradas.</p>:items.map(x=><div key={x.id} className={'flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4 '+(!x.read_at?'border-sky-200 bg-sky-50/60':'border-slate-200')}><div><p className="font-semibold">{labels[x.event_type]??'Actividad de soporte'}</p><p className="mt-1 text-xs text-slate-500">Ticket: {x.ticket_id.slice(0,8)} · {new Date(x.created_at).toLocaleString('es-PE')}</p><p className="mt-2 text-xs font-semibold text-slate-600">{x.read_at?'Leída':'Sin leer'}</p></div>{!x.read_at?<button type="button" disabled={busy} onClick={()=>void mark([x.id])} className="inline-flex items-center gap-1 rounded-lg border border-sky-300 bg-white px-3 py-2 text-xs font-semibold text-sky-900 disabled:opacity-50"><Check size={14}/> Marcar como leída</button>:null}</div>)}
 </div>
}
