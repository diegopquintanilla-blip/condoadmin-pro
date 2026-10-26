'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Archive} from 'lucide-react'
export function CrearDeposito({condominioId}:{condominioId:string}){
 const router=useRouter()
 const [codigo,setCodigo]=useState('')
 const [bloque,setBloque]=useState('')
 const [busy,setBusy]=useState(false)
 const [mensaje,setMensaje]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const code=codigo.trim()
  if(!code||code.length>70){setMensaje('Ingresa un código válido.');return}
  setBusy(true);setMensaje('')
  const {error}=await supabase.from('inmuebles').insert({condominio_id:condominioId,codigo:code,tipo:'deposito',bloque:bloque.trim()||null})
  setBusy(false)
  if(error){setMensaje(error.code==='23505'?'El código ya existe en este condominio.':'No se pudo guardar. Comprueba tus permisos.');return}
  setCodigo('');setBloque('');setMensaje('Depósito registrado.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-lg font-bold"><Archive className="text-sky-700"/> Registrar depósito</h2><p className="mt-2 text-sm text-slate-500">Registro real dentro del inventario del condominio.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Código del espacio<input required maxLength={70} placeholder="Ej. DEP-001" className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={codigo} onChange={e=>setCodigo(e.target.value)}/></label><label className="text-sm font-semibold">Zona o bloque (opcional)<input maxLength={100} placeholder="Ej. Sótano 1" className="mt-2 w-full rounded-xl border border-slate-300 p-3" value={bloque} onChange={e=>setBloque(e.target.value)}/></label></div><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar depósito'}</button>{mensaje&&<p role="status" className="mt-3 text-sm text-slate-700">{mensaje}</p>}</form>
}