'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {UserRoundPlus} from 'lucide-react'
export function RegistrarTrabajador({condominioId}:{condominioId:string}){
 const router=useRouter()
 const [nombre,setNombre]=useState(''),[documento,setDocumento]=useState(''),[cargo,setCargo]=useState(''),[area,setArea]=useState(''),[turno,setTurno]=useState(''),[contrato,setContrato]=useState(''),[telefono,setTelefono]=useState(''),[email,setEmail]=useState(''),[ingreso,setIngreso]=useState(''),[nota,setNota]=useState('')
 const [busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  if(nombre.trim().length<3||cargo.trim().length<2||[nombre,documento,cargo,area,turno,contrato,telefono,email].some(x=>x.length>160)||nota.length>1000){setMessage('Revisa los datos del trabajador y del puesto.');return}
  setBusy(true);setMessage('')
  const {error}=await supabase.from('personal').insert({condominio_id:condominioId,full_name:nombre.trim(),document_number:documento.trim()||null,cargo:cargo.trim(),area_asignada:area.trim()||null,turno:turno.trim()||null,contrato:contrato.trim()||null,telefono:telefono.trim()||null,email:email.trim()||null,fecha_ingreso:ingreso||null,observacion:nota.trim()||null})
  setBusy(false)
  if(error){setMessage('No se pudo registrar al trabajador. Comprueba los permisos y los datos.');return}
  setNombre('');setDocumento('');setCargo('');setArea('');setTurno('');setContrato('');setTelefono('');setEmail('');setIngreso('');setNota('');setMessage('Trabajador registrado.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><UserRoundPlus className="text-sky-700"/> Registrar trabajador</h2><p className="mt-2 text-sm text-slate-500">Datos laborales y del puesto asignado al condominio.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[{label:'Nombre completo *',value:nombre,set:setNombre,required:true},{label:'Documento',value:documento,set:setDocumento},{label:'Cargo / puesto *',value:cargo,set:setCargo,required:true},{label:'Área asignada',value:area,set:setArea},{label:'Turno',value:turno,set:setTurno},{label:'Tipo de contrato',value:contrato,set:setContrato},{label:'Teléfono',value:telefono,set:setTelefono},{label:'Correo electrónico',value:email,set:setEmail}].map(x=><label key={x.label} className="text-sm font-semibold">{x.label}<input required={Boolean('required' in x&&x.required)} type={x.label==='Correo electrónico'?'email':'text'} maxLength={160} value={x.value} onChange={e=>x.set(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label>)}<label className="text-sm font-semibold">Fecha de ingreso<input type="date" value={ingreso} onChange={e=>setIngreso(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label></div><label className="mt-4 block text-sm font-semibold">Observaciones<textarea maxLength={1000} rows={2} value={nota} onChange={e=>setNota(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar trabajador'}</button>{message&&<p role="status" className="mt-3 text-sm text-slate-700">{message}</p>}</form>
}