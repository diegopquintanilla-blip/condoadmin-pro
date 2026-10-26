'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
export function TicketForm({condominios}:{condominios:{id:string;nombre:string}[]}){
 const router=useRouter()
 const [condominio,setCondominio]=useState(condominios[0]?.id??'')
 const [asunto,setAsunto]=useState('')
 const [descripcion,setDescripcion]=useState('')
 const [categoria,setCategoria]=useState('consulta')
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setNotice('')
  if(!condominios.some(x=>x.id===condominio)){setNotice('Selecciona un condominio válido.');return}
  setBusy(true)
  try{
   const r=await fetch('/api/soporte/tickets',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({condominio_id:condominio,asunto,descripcion,categoria})})
   const result=await r.json()
   if(!r.ok){setNotice(result.error||'No fue posible enviar la solicitud.');return}
   setNotice('Solicitud registrada: '+String(result.ticket_id).slice(0,8))
   setAsunto('');setDescripcion('');router.refresh()
  }catch{setNotice('No fue posible conectar con el servidor.')}
  finally{setBusy(false)}
 }
 if(!condominios.length)return <p className="text-sm text-amber-900">Necesitas pertenecer a un condominio activo para registrar solicitudes.</p>
 return <form onSubmit={submit} className="mt-5 space-y-4">
 <label className="block text-sm font-semibold">Condominio<select required value={condominio} onChange={e=>setCondominio(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{condominios.map(x=><option key={x.id} value={x.id}>{x.nombre}</option>)}</select></label>
 <label className="block text-sm font-semibold">Categoría<select value={categoria} onChange={e=>setCategoria(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="consulta">Consulta</option><option value="incidencia">Incidencia</option><option value="acceso">Acceso</option><option value="facturacion">Facturación</option><option value="otro">Otro</option></select></label>
 <label className="block text-sm font-semibold">Asunto<input required minLength={5} maxLength={150} value={asunto} onChange={e=>setAsunto(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Describe brevemente tu consulta"/></label>
 <label className="block text-sm font-semibold">Descripción<textarea required minLength={15} maxLength={5000} rows={5} value={descripcion} onChange={e=>setDescripcion(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Explica qué ocurre y en qué módulo..."/></label>
 <button disabled={busy} className="rounded-xl bg-sky-800 px-5 py-3 text-sm font-bold text-white disabled:opacity-50">{busy?'Enviando…':'Registrar solicitud'}</button>
 {notice?<p role="status" className="text-sm text-slate-600">{notice}</p>:null}
 </form>
}
