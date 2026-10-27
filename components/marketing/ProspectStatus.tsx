'use client'
import {useState} from 'react'
import {supabase} from '@/lib/supabase/client'
export function ProspectStatus({id,initial}:{id:string;initial:string}){
 const [estado,setEstado]=useState(initial)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function update(value:string){
  if(busy||value===estado)return;setBusy(true);setError('')
  const {data,error:e}=await supabase.from('prospectos_comerciales').update({estado:value}).eq('id',id).select('id,estado').single()
  setBusy(false)
  if(e||!data){setError('No se pudo actualizar.');return}
  setEstado(data.estado)
 }
 return <div><label className="text-xs font-semibold">Estado <select aria-label="Estado del prospecto" value={estado} disabled={busy} onChange={e=>void update(e.target.value)} className="ml-2 rounded-lg border px-3 py-2 text-sm"><option value="nuevo">Nuevo</option><option value="contactado">Contactado</option><option value="en_seguimiento">En seguimiento</option><option value="cerrado">Cerrado</option></select></label>{error?<p role="alert" className="text-xs text-red-700">{error}</p>:null}</div>
}