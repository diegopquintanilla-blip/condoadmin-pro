'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Wrench} from 'lucide-react'
export function RegistrarServicio({condominioId}:{condominioId:string}){
 const router=useRouter()
 const [nombre,setNombre]=useState(''),[categoria,setCategoria]=useState('general'),[proveedor,setProveedor]=useState(''),[frecuencia,setFrecuencia]=useState(''),[descripcion,setDescripcion]=useState('')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  if(nombre.trim().length<3||nombre.trim().length>120||categoria.length>80||proveedor.length>160||frecuencia.length>80){setNotice('Revisa los datos del servicio.');return}
  setBusy(true);setNotice('')
  const {error}=await supabase.from('servicios').insert({condominio_id:condominioId,nombre:nombre.trim(),categoria,proveedor:proveedor.trim()||null,frecuencia:frecuencia.trim()||null,descripcion:descripcion.trim()||null})
  setBusy(false)
  if(error){setNotice('No se pudo registrar el servicio. Revisa los permisos y los campos.');return}
  setNombre('');setProveedor('');setFrecuencia('');setDescripcion('');setNotice('Servicio registrado correctamente.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><Wrench className="text-sky-700"/> Registrar servicio</h2><p className="mt-2 text-sm text-slate-500">Servicios y proveedores que atienden al condominio.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Servicio *<input required minLength={3} maxLength={120} value={nombre} onChange={e=>setNombre(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Ej. Mantenimiento de ascensores"/></label><label className="text-sm font-semibold">Categoría<select value={categoria} onChange={e=>setCategoria(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{['general','seguridad','limpieza','mantenimiento','jardineria','piscina','otros'].map(x=><option key={x} value={x}>{x}</option>)}</select></label><label className="text-sm font-semibold">Proveedor<input maxLength={160} value={proveedor} onChange={e=>setProveedor(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Empresa o responsable"/></label><label className="text-sm font-semibold">Frecuencia<input maxLength={80} value={frecuencia} onChange={e=>setFrecuencia(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Ej. Mensual"/></label></div><label className="mt-4 block text-sm font-semibold">Descripción<textarea maxLength={3000} rows={3} value={descripcion} onChange={e=>setDescripcion(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar servicio'}</button>{notice&&<p role="status" className="mt-3 text-sm">{notice}</p>}</form>
}