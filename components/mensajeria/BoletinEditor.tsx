'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Mail,FilePenLine} from 'lucide-react'
export function BoletinEditor({condominioId,recipients}:{condominioId:string;recipients:number}){
 const router=useRouter()
 const [titulo,setTitulo]=useState(''),[contenido,setContenido]=useState('')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[preview,setPreview]=useState(false)
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  if(titulo.trim().length<4||titulo.length>150||contenido.trim().length<10||contenido.length>10000){setNotice('Completa un asunto (4–150 caracteres) y el contenido (10–10000).');return}
  setBusy(true);setNotice('')
  const {error}=await supabase.from('comunicados').insert({condominio_id:condominioId,titulo:titulo.trim(),contenido:contenido.trim(),canal:'email',destinatario_tipo:'propietarios'})
  setBusy(false)
  if(error){setNotice('No se pudo guardar el borrador. Comprueba los permisos y los campos.');return}
  setTitulo('');setContenido('');setPreview(false);setNotice('Boletín guardado como borrador. No se enviaron correos.');router.refresh()
 }
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><Mail className="text-sky-700"/><div><h2 className="text-lg font-bold">Preparar boletín para propietarios</h2><p className="text-sm text-slate-500">Redacción y almacenamiento seguro, sin envíos automáticos.</p></div></div><p className="mt-4 rounded-xl bg-sky-50 p-4 text-sm text-sky-900">Propietarios con correo registrado: <strong>{recipients}</strong>. Los destinatarios se determinarán por condominio cuando se habilite el envío.</p><form onSubmit={save} className="mt-5 space-y-4"><label className="block text-sm font-semibold">Asunto<input required minLength={4} maxLength={150} value={titulo} onChange={e=>setTitulo(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3" placeholder="Ej. Comunicado de mantenimiento"/></label><label className="block text-sm font-semibold">Contenido del boletín<textarea required minLength={10} maxLength={10000} rows={8} value={contenido} onChange={e=>setContenido(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white p-3" placeholder="Redacta el informe que recibirán los propietarios…"/></label><div className="flex flex-wrap items-center gap-3"><button type="button" onClick={()=>setPreview(v=>!v)} className="rounded-xl border border-sky-700 px-5 py-3 font-bold text-sky-900">{preview?'Ocultar vista previa':'Vista previa'}</button><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50"><FilePenLine size={18}/>{busy?'Guardando…':'Guardar borrador'}</button></div>{preview?<section aria-label="Vista previa del comunicado" className="rounded-2xl border border-sky-200 bg-slate-50 p-5"><p className="text-xs font-bold uppercase tracking-wide text-sky-800">Vista previa · no enviado</p><h3 className="mt-3 break-words text-xl font-bold">{titulo.trim()||'Sin asunto'}</h3><p className="mt-4 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">{contenido.trim()||'Escribe el contenido para visualizarlo aquí.'}</p></section>:null}{notice&&<p role="status" className="text-sm text-slate-700">{notice}</p>}</form></section>
}