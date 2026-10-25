'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Plus,Loader2} from 'lucide-react'
type Role={condominio_id:string;role:string}
const tipos=['lote','casa','departamento','local','estacionamiento','deposito']
export function CrearInmueble({memberships}:{memberships:Role[]}){
 const router=useRouter()
 const allowed=memberships.filter(x=>['admin','super_admin','junta'].includes(x.role))
 const [condominio,setCondominio]=useState(allowed[0]?.condominio_id??'')
 const [codigo,setCodigo]=useState('')
 const [tipo,setTipo]=useState('lote')
 const [bloque,setBloque]=useState('')
 const [etapa,setEtapa]=useState('')
 const [torre,setTorre]=useState('')
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 if(!allowed.length)return null
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('')
  if(!allowed.some(x=>x.condominio_id===condominio)){setMessage('No tienes permiso para registrar en ese condominio.');return}
  if(!codigo.trim()||codigo.trim().length>70){setMessage('Ingresa un código válido de hasta 70 caracteres.');return}
  setBusy(true)
  const {error}=await supabase.from('inmuebles').insert({condominio_id:condominio,codigo:codigo.trim(),tipo,bloque:bloque.trim()||null,etapa:etapa.trim()||null,torre:torre.trim()||null})
  setBusy(false)
  if(error){setMessage(error.code==='23505'?'Ya existe un inmueble con ese código.':'No se pudo registrar el inmueble. Revisa los permisos y el código.');return}
  setCodigo('');setBloque('');setEtapa('');setTorre('');setMessage('Inmueble registrado correctamente.');router.refresh()
 }
 return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><Plus className="text-sky-700"/><div><h2 className="text-xl font-bold">Registrar inmueble</h2><p className="text-sm text-slate-500">Registro real protegido por permisos del condominio</p></div></div><form onSubmit={submit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 <label className="text-sm font-semibold">Condominio<select className="mt-2 w-full rounded-xl border p-3" value={condominio} onChange={e=>setCondominio(e.target.value)}>{allowed.map(x=><option key={x.condominio_id} value={x.condominio_id}>{x.condominio_id.slice(0,8)}</option>)}</select></label>
 <label className="text-sm font-semibold">Código de inmueble *<input required maxLength={70} value={codigo} onChange={e=>setCodigo(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Ej. A-101"/></label>
 <label className="text-sm font-semibold">Tipo<select value={tipo} onChange={e=>setTipo(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{tipos.map(x=><option key={x}>{x}</option>)}</select></label>
 <label className="text-sm font-semibold">Bloque<input maxLength={100} value={bloque} onChange={e=>setBloque(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Opcional"/></label>
 <label className="text-sm font-semibold">Etapa<input maxLength={100} value={etapa} onChange={e=>setEtapa(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Opcional"/></label>
 <label className="text-sm font-semibold">Torre<input maxLength={100} value={torre} onChange={e=>setTorre(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Opcional"/></label>
 <div className="sm:col-span-2 lg:col-span-3 flex flex-wrap items-center gap-4"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?<Loader2 size={17} className="animate-spin"/>:<Plus size={17}/>} Guardar inmueble</button>{message?<p role="status" className="text-sm text-slate-700">{message}</p>:null}</div>
 </form></section>
}
