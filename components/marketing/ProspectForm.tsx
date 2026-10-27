'use client'
import {useState,type FormEvent} from 'react'
import {supabase} from '@/lib/supabase/client'
export function ProspectForm(){
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const [ok,setOk]=useState(false)
 const [form,setForm]=useState({nombre:'',correo:'',telefono:'',condominio:'',mensaje:'',website:''})
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;setMessage('')
  if(form.website){setMessage('Gracias por contactarnos.');setOk(true);return}
  if(form.nombre.trim().length<2||form.nombre.length>120||form.correo.length>200||!/^\S+@\S+\.\S+$/.test(form.correo.trim())||form.telefono.trim().length<6||form.telefono.length>40||form.condominio.length>160||form.mensaje.length>1500){setMessage('Revisa los datos del formulario.');return}
  setBusy(true)
  const {error}=await supabase.from('prospectos_comerciales').insert({nombre:form.nombre.trim(),correo:form.correo.trim().toLowerCase(),telefono:form.telefono.trim(),condominio:form.condominio.trim()||null,mensaje:form.mensaje.trim()||null})
  setBusy(false)
  if(error){setMessage('No pudimos registrar tu solicitud. Inténtalo nuevamente.');return}
  setOk(true);setMessage('¡Recibimos tu solicitud! Nos pondremos en contacto contigo.')
 }
 return <form onSubmit={submit} className="mt-5 space-y-3">
  <div className="grid gap-3 sm:grid-cols-2">
  <label className="text-sm font-semibold">Nombre completo *<input required maxLength={120} value={form.nombre} onChange={e=>setForm(f=>({...f,nombre:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="Tu nombre"/></label>
  <label className="text-sm font-semibold">Teléfono / WhatsApp *<input required maxLength={40} value={form.telefono} onChange={e=>setForm(f=>({...f,telefono:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="+51 999 999 999"/></label>
  </div>
  <label className="block text-sm font-semibold">Correo electrónico *<input type="email" required maxLength={200} value={form.correo} onChange={e=>setForm(f=>({...f,correo:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="correo@empresa.com"/></label>
  <label className="block text-sm font-semibold">Condominio / administradora<input maxLength={160} value={form.condominio} onChange={e=>setForm(f=>({...f,condominio:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="Nombre del condominio"/></label>
  <label className="block text-sm font-semibold">¿Qué necesitas?<textarea rows={3} maxLength={1500} value={form.mensaje} onChange={e=>setForm(f=>({...f,mensaje:e.target.value}))} className="mt-1 w-full rounded-xl border p-3" placeholder="Cuéntanos cuántas unidades administras o qué módulos te interesan."/></label>
  <input aria-hidden="true" tabIndex={-1} autoComplete="off" className="absolute left-[-9999px]" value={form.website} onChange={e=>setForm(f=>({...f,website:e.target.value}))}/>
  <p className="text-xs text-slate-500">Al enviar, autorizas que te contactemos respecto de Condomin-Pro. Solo usaremos tus datos para atender tu solicitud.</p>
  <button type="submit" disabled={busy||ok} className="w-full rounded-xl bg-[#1f4b7a] px-5 py-3 font-bold text-white disabled:opacity-60">{busy?'Enviando…':ok?'Solicitud recibida':'Enviar solicitud'}</button>
  {message?<p role="status" className={ok?'text-sm text-emerald-700':'text-sm text-red-700'}>{message}</p>:null}
 </form>
}