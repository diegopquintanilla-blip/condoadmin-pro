'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Trees} from 'lucide-react'
export function RegistrarArea({condominioId}:{condominioId:string}){
 const router=useRouter()
 const [nombre,setNombre]=useState(''),[tipo,setTipo]=useState('otro'),[ubicacion,setUbicacion]=useState(''),[capacidad,setCapacidad]=useState(''),[costo,setCosto]=useState('0'),[aprobacion,setAprobacion]=useState(true)
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const max=capacidad?Number(capacidad):null,price=Number(costo)
  if(nombre.trim().length<3||nombre.length>120||ubicacion.length>160||max!==null&&(!Number.isInteger(max)||max<1||max>100000)||!Number.isFinite(price)||price<0||price>100000){setMessage('Revisa el nombre, capacidad y costo.');return}
  setBusy(true);setMessage('')
  const {error}=await supabase.from('areas_comunes').insert({condominio_id:condominioId,nombre:nombre.trim(),tipo,ubicacion:ubicacion.trim()||null,capacidad:max,costo_reserva:price,requiere_aprobacion:aprobacion})
  setBusy(false)
  if(error){setMessage('No se pudo registrar el área. Revisa permisos y datos.');return}
  setNombre('');setUbicacion('');setCapacidad('');setCosto('0');setMessage('Área común registrada.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><Trees className="text-sky-700"/> Registrar área común</h2><p className="mt-2 text-sm text-slate-500">Inventario real de espacios comunitarios del condominio.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-semibold">Nombre *<input required minLength={3} maxLength={120} value={nombre} onChange={e=>setNombre(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Ej. Salón de usos múltiples"/></label><label className="text-sm font-semibold">Tipo<select value={tipo} onChange={e=>setTipo(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{['piscina','parrilla','salon','cancha','gimnasio','terraza','jardines','otro'].map(x=><option key={x} value={x}>{x}</option>)}</select></label><label className="text-sm font-semibold">Ubicación<input maxLength={160} value={ubicacion} onChange={e=>setUbicacion(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Ej. Torre A, piso 1"/></label><label className="text-sm font-semibold">Capacidad<input type="number" min={1} max={100000} value={capacidad} onChange={e=>setCapacidad(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Personas"/></label><label className="text-sm font-semibold">Costo por reserva (S/)<input type="number" min={0} max={100000} step="0.01" value={costo} onChange={e=>setCosto(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={aprobacion} onChange={e=>setAprobacion(e.target.checked)}/> Requiere aprobación</label></div><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar área común'}</button>{message&&<p role="status" className="mt-3 text-sm">{message}</p>}</form>
}