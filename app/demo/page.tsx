'use client'
import {useState,type FormEvent} from 'react'
import Link from 'next/link'
import {supabase} from '@/lib/supabase/client'
export default function DemoSignup(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[ok,setOk]=useState(false)
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return
  setMessage('')
  if(!/^\S+@\S+\.\S+$/.test(email.trim())||password.length<10){setMessage('Ingresa un correo válido y contraseña de al menos 10 caracteres.');return}
  setBusy(true)
  const {data,error}=await supabase.auth.signUp({email:email.trim().toLowerCase(),password,options:{data:{registration_type:'condominpro_demo'},emailRedirectTo:window.location.origin+'/demo/panel'}})
  setBusy(false)
  if(error){setMessage('No se pudo procesar el registro. Si ya usaste este correo, la demo no podrá activarse de nuevo.');return}
  if(data.user?.identities?.length===0){setMessage('Este correo ya tiene una cuenta. No se envió una nueva confirmación. Si ya tienes acceso, inicia sesión; para consultas sobre la demo, contáctanos.');return}
  if(!data.user){setMessage('No pudimos confirmar que se haya creado la cuenta. Revisa tu correo o contacta con soporte.');return}
  setOk(true);setMessage(data.session?'Cuenta creada. Ya puedes acceder a tu demo desde Ingresar.':'Registro recibido. Revisa tu correo para confirmar la cuenta y entrar a tu demo.')
 }
 return <main className="min-h-screen bg-[#f1f6fc] px-6 py-14"><div className="mx-auto max-w-3xl"><Link href="/" className="text-sm font-semibold text-sky-800">← Volver a Condomin-Pro</Link><section className="mt-6 rounded-3xl bg-[#102d50] p-9 text-white"><p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Condomin-Pro · Acceso de evaluación</p><h1 className="mt-4 text-4xl font-extrabold">Prueba la demo durante 7 días</h1><p className="mt-4 text-sky-100">Un registro por correo electrónico. La prueba comienza al registrarte, no se renueva automáticamente y no requiere tarjeta de crédito.</p></section><section className="mt-5 rounded-3xl border bg-white p-8 shadow-sm"><h2 className="text-xl font-bold">Crear acceso de demostración</h2><p className="mt-2 text-sm text-slate-600">La demo muestra un recorrido funcional independiente; no permite consultar información de condominios de otros clientes.</p><form onSubmit={submit} className="mt-6 space-y-4"><label className="block text-sm font-semibold">Correo electrónico<input required type="email" autoComplete="email" maxLength={200} value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="block text-sm font-semibold">Contraseña<input required type="password" autoComplete="new-password" minLength={10} value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><button disabled={busy||ok} className="w-full rounded-xl bg-sky-800 p-3 font-bold text-white disabled:opacity-50">{busy?'Registrando…':'Comenzar demo de 7 días'}</button>{message?<p role="status" className="rounded-xl bg-sky-50 p-3 text-sm text-sky-800">{message}</p>:null}</form><p className="mt-4 text-xs text-slate-500">Al solicitar el acceso aceptas recibir el correo necesario para confirmar la cuenta. No se generan cobros ni renovaciones.</p><Link href="/login" className="mt-5 inline-block text-sm font-semibold text-sky-800 underline">Ya tengo cuenta · Ingresar</Link></section></div></main>
}