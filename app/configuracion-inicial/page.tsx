'use client'
import {useEffect,useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import Link from 'next/link'
import {Building2,CheckCircle2,Loader2,ShieldCheck} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

export default function PrimerCondominioPage(){
 const router=useRouter()
 const [nombre,setNombre]=useState('')
 const [busy,setBusy]=useState(false)
 const [checking,setChecking]=useState(true)
 const [error,setError]=useState('')
 useEffect(()=>{
  let active=true
  async function check(){
   const {data:{user},error:userError}=await supabase.auth.getUser()
   if(!active)return
   if(userError||!user){router.replace('/login');return}
   const {data:membership,error:memberError}=await supabase.from('condominio_usuarios').select('condominio_id').eq('user_id',user.id).eq('is_active',true).limit(1)
   if(!active)return
   if(memberError){setError('No se pudo verificar tu acceso. Actualiza la página e inténtalo nuevamente.')}
   else if(membership?.length){router.replace('/dashboard?condominio='+encodeURIComponent(membership[0].condominio_id));return}
   setChecking(false)
  }
  void check()
  return ()=>{active=false}
 },[router])
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const trimmed=nombre.trim()
  if(trimmed.length<3||trimmed.length>120){setError('El nombre debe tener entre 3 y 120 caracteres.');return}
  setBusy(true);setError('')
  const {data:result,error:rpcError}=await supabase.rpc('bootstrap_first_condominium',{p_nombre:trimmed})
  if(rpcError||!result){setError('No se pudo completar el registro. Esta configuración solo está disponible para la cuenta inicial mientras no exista otro condominio. Si ya fue configurado, solicita acceso al administrador.');setBusy(false);return}
  router.replace('/dashboard?condominio='+encodeURIComponent(String(result)))
  router.refresh()
 }
 return <main className="mx-auto max-w-3xl">
  <div className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white shadow-lg md:p-10">
   <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15"><Building2 size={27}/></div>
   <p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Condomin-Pro · Activación P0</p>
   <h1 className="mt-3 text-3xl font-extrabold">Configura tu primer condominio</h1>
   <p className="mt-3 max-w-xl text-sm leading-6 text-sky-100">Ingresa el nombre real de la propiedad. El sistema registrará el condominio y te asignará su administración en una única operación segura.</p>
  </div>
  <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-9">
   <div className="flex items-center gap-3"><ShieldCheck className="text-sky-700"/><h2 className="text-lg font-bold">Registro inicial protegido</h2></div>
   <p className="mt-2 text-sm text-slate-500">Este paso solo puede realizarlo la cuenta inicial si aún no se creó ningún condominio. No se añadirán residentes, inmuebles ni datos de prueba.</p>
   {checking?<p className="mt-6 flex items-center gap-2 text-sm text-slate-600"><Loader2 className="animate-spin" size={18}/> Verificando tu sesión y permisos…</p>:
   <form onSubmit={submit} className="mt-7 space-y-5">
    <label className="block text-sm font-semibold text-slate-800">Nombre del condominio
     <input value={nombre} onChange={e=>setNombre(e.target.value)} required minLength={3} maxLength={120} autoComplete="organization" className="mt-2 w-full rounded-xl border border-slate-300 bg-slate-50 p-4 outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-100" placeholder="Ingresa el nombre oficial"/>
    </label>
    {error&&<p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <button disabled={busy||Boolean(error&&error.startsWith('No se pudo verificar'))} className="inline-flex items-center gap-2 rounded-xl bg-[#105f9c] px-6 py-3 font-bold text-white shadow-lg transition hover:bg-[#0b497b] disabled:opacity-50">{busy?<Loader2 size={17} className="animate-spin"/>:<CheckCircle2 size={17}/>} {busy?'Registrando…':'Crear mi condominio'}</button>
   </form>}
   <div className="mt-6 border-t pt-5"><Link className="text-sm font-semibold text-sky-700 underline" href="/dashboard">Regresar al dashboard</Link></div>
  </section>
 </main>
}
