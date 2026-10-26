'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {CarFront} from 'lucide-react'
type Space={id:string;codigo:string}
export function CrearVehiculo({condominioId,espacios}:{condominioId:string;espacios:Space[]}){
 const router=useRouter()
 const [placa,setPlaca]=useState(''),[marca,setMarca]=useState(''),[modelo,setModelo]=useState(''),[color,setColor]=useState(''),[espacio,setEspacio]=useState('')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const code=placa.trim().toUpperCase()
  if(!/^[A-Z0-9-]{5,15}$/.test(code)||[marca,modelo,color].some(x=>x.length>80)||Boolean(espacio&&!espacios.some(x=>x.id===espacio))){setNotice('Revisa la placa, los datos y el estacionamiento.');return}
  setBusy(true);setNotice('')
  const {error}=await supabase.from('vehiculos').insert({condominio_id:condominioId,placa:code,marca:marca.trim()||null,modelo:modelo.trim()||null,color:color.trim()||null,estacionamiento_id:espacio||null})
  setBusy(false)
  if(error){setNotice(error.code==='23505'?'Esta placa ya está registrada en el condominio.':'No se pudo guardar el vehículo. Comprueba tus permisos.');return}
  setPlaca('');setMarca('');setModelo('');setColor('');setEspacio('');setNotice('Vehículo registrado correctamente.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><CarFront className="text-sky-700"/> Registrar vehículo</h2><p className="mt-2 text-sm text-slate-500">Registro real y vinculación opcional con un estacionamiento existente.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{([{label:'Placa *',value:placa,set:setPlaca,placeholder:'ABC-123',required:true},{label:'Marca',value:marca,set:setMarca,placeholder:'Marca'},{label:'Modelo',value:modelo,set:setModelo,placeholder:'Modelo'},{label:'Color',value:color,set:setColor,placeholder:'Color'}] as const).map(x=><label key={x.label} className="text-sm font-semibold">{x.label}<input required={'required' in x&&x.required} maxLength={x.label==='Placa *'?15:80} value={x.value} onChange={e=>x.set(e.target.value)} placeholder={x.placeholder} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>)}<label className="text-sm font-semibold">Estacionamiento<select value={espacio} onChange={e=>setEspacio(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"><option value="">Sin asignar</option>{espacios.map(x=><option key={x.id} value={x.id}>{x.codigo}</option>)}</select></label></div><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar vehículo'}</button>{notice&&<p role="status" className="mt-3 text-sm text-slate-700">{notice}</p>}</form>
}