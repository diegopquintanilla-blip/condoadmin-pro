'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Building2,ArrowRight,ShieldCheck} from 'lucide-react'
export default function LoginPage(){
 const router=useRouter()
 const [email,setEmail]=useState('')
 const [password,setPassword]=useState('')
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setLoading(true);setError('')
  const {error}=await supabase.auth.signInWithPassword({email,password})
  setLoading(false)
  if(error){setError('No se pudo iniciar sesión. Verifica tus credenciales.');return}
  router.replace('/dashboard');router.refresh()
 }
 return <main className="flex min-h-screen bg-[#f2f6fb]">
  <section className="relative hidden min-h-screen flex-1 overflow-hidden bg-[#092d55] lg:flex">
   <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"linear-gradient(90deg, rgba(5,29,56,.78), rgba(5,29,56,.17)), url('https://unsplash.com/photos/TJsf1pMigZM/download?force=true&w=1800')"}} aria-hidden="true"/>
   <div className="relative z-10 flex w-full flex-col justify-between p-14 text-white">
    <span className="flex items-center gap-3 text-lg font-bold"><Building2 size={26}/> Condomin-Pro</span>
    <div className="max-w-xl"><p className="mb-5 text-sm font-semibold uppercase tracking-[.25em] text-cyan-200">Administración inteligente</p><h1 className="text-5xl font-black leading-tight">Tu condominio, mejor administrado.</h1><p className="mt-6 max-w-lg text-lg text-blue-100">Un solo lugar para gestionar residentes, inmuebles, incidencias y finanzas con claridad y seguridad.</p></div>
    <p className="text-sm text-blue-100">Gestión moderna de comunidades residenciales</p>
   </div>
  </section>
  <section className="flex min-h-screen w-full items-center justify-center px-6 py-14 lg:w-[490px] xl:w-[540px]">
   <div className="w-full max-w-sm">
    <div className="mb-12 flex items-center gap-3 lg:hidden"><span className="rounded-2xl bg-sky-900 p-3 text-white"><Building2/></span><strong className="text-xl text-slate-900">Condomin-Pro</strong></div>
    <div className="mb-9"><p className="mb-3 text-xs font-bold uppercase tracking-[.19em] text-sky-700">Acceso seguro</p><h2 className="text-3xl font-extrabold tracking-tight text-slate-950">Bienvenido de nuevo</h2><p className="mt-3 text-sm text-slate-500">Inicia sesión para acceder a tu panel de administración.</p></div>
    <form onSubmit={submit} className="space-y-5">
     <label className="block text-sm font-semibold text-slate-700">Correo electrónico<input type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100" placeholder="correo@empresa.com"/></label>
     <label className="block text-sm font-semibold text-slate-700">Contraseña<input type="password" autoComplete="current-password" required value={password} onChange={e=>setPassword(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 outline-none transition focus:border-sky-600 focus:ring-2 focus:ring-sky-100" placeholder="••••••••"/></label>
     {error&&<p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
     <button disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-xl bg-[#0c4678] px-5 py-3.5 font-bold text-white shadow-lg shadow-sky-900/15 transition hover:bg-sky-800 disabled:opacity-60">{loading?'Ingresando…':'Ingresar al panel'}<ArrowRight size={18}/></button>
    </form>
    <div className="mt-10 flex items-center gap-2 border-t border-slate-200 pt-6 text-xs text-slate-500"><ShieldCheck size={16} className="text-sky-700"/> Plataforma de gestión privada</div>
   </div>
  </section>
 </main>
}