'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
type Module='incidencias'|'tareas'|'comunicados'
type Item={id:string;titulo:string;descripcion:string|null;estado:string|null;prioridad?:string|null}
const statuses:Record<Module,string[]>={incidencias:['abierta','en_proceso','resuelta','cerrada'],tareas:['pendiente','en_proceso','terminada','cancelada'],comunicados:[]}
export function OperacionesGestion({modulo,condominio,items,role}:{modulo:Module;condominio:string;items:Item[];role:string}){
 const router=useRouter()
 const [titulo,setTitulo]=useState(''),[descripcion,setDescripcion]=useState(''),[busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 const write=modulo==='incidencias'?!!role:['super_admin','admin','junta',...(modulo==='tareas'?['conserje']:[])].includes(role)
 const manage=['super_admin','admin','junta',...(modulo==='tareas'||modulo==='incidencias'?['conserje']:[])].includes(role)
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!write||!titulo.trim()||titulo.length>150)return
  setBusy(true);setNotice('')
  const payload={condominio_id:condominio,titulo:titulo.trim(),descripcion:descripcion.trim()||null,...(modulo==='tareas'?{tipo:'general'}:{})}
  const {error}=await supabase.from(modulo).insert(payload)
  setBusy(false)
  if(error){setNotice('No se pudo registrar. Comprueba tus permisos y los datos.');return}
  setTitulo('');setDescripcion('');setNotice('Registro guardado.');router.refresh()
 }
 async function change(item:Item,value:string){
  if(!manage||busy||!statuses[modulo].includes(value))return
  setBusy(true);setNotice('')
  const {data,error}=await supabase.from(modulo).update({estado:value}).eq('id',item.id).eq('condominio_id',condominio).select('id').maybeSingle()
  setBusy(false)
  if(error||!data){setNotice('No se pudo actualizar el estado.');return}
  setNotice('Estado actualizado.');router.refresh()
 }
 return <div className="space-y-5">{write&&<form onSubmit={create} className="rounded-2xl border bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Nuevo registro</h2><div className="mt-4 grid gap-3"><label className="text-sm font-semibold">Título<input required maxLength={150} value={titulo} onChange={e=>setTitulo(e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label><label className="text-sm font-semibold">Descripción<textarea maxLength={2000} value={descripcion} onChange={e=>setDescripcion(e.target.value)} className="mt-1 w-full rounded-lg border p-3" rows={3}/></label></div><button disabled={busy} className="mt-4 rounded-lg bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50">Guardar registro</button></form>}{notice&&<p role="status" className="rounded-lg bg-sky-50 p-3 text-sm">{notice}</p>}
 <section className="overflow-x-auto rounded-2xl border bg-white shadow-sm"><h2 className="p-6 text-xl font-bold">Registros existentes</h2><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Título','Descripción','Estado'].map(x=><th className="p-4" key={x}>{x}</th>)}</tr></thead><tbody>{items.map(item=><tr key={item.id} className="border-t"><td className="p-4 font-semibold">{item.titulo}</td><td className="max-w-xs p-4 text-slate-600">{item.descripcion||'—'}</td><td className="p-4">{manage&&statuses[modulo].length?<select aria-label={'Estado de '+item.titulo} defaultValue={item.estado||statuses[modulo][0]} onChange={e=>change(item,e.target.value)} disabled={busy} className="rounded-lg border p-2">{statuses[modulo].map(s=><option key={s} value={s}>{s.replaceAll('_',' ')}</option>)}</select>:item.estado||'—'}</td></tr>)}</tbody></table>{!items.length&&<p className="p-6 text-sm text-slate-500">No hay registros en este condominio.</p>}</section></div>
}