'use client'
import {useEffect,useState} from 'react'
import {useRouter} from 'next/navigation'
import {LogOut,UserRound} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

export function SessionHeader(){
 const router=useRouter()
 const [email,setEmail]=useState<string|null>(null)
 const [role,setRole]=useState<string|null>(null)
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 useEffect(()=>{
  let mounted=true
  async function load(){
   const {data:{user}}=await supabase.auth.getUser()
   if(!mounted)return
   setEmail(user?.email??null)
   if(!user){setRole(null);return}
   const {data}=await supabase.from('condominio_usuarios').select('role').eq('user_id',user.id).eq('is_active',true).limit(1)
   if(mounted)setRole(data?.[0]?.role??null)
  }
  void load()
  const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{void load()})
  return()=>{mounted=false;subscription.unsubscribe()}
 },[])
 async function logout(){
  setBusy(true);setError('')
  const {error}=await supabase.auth.signOut()
  if(error){setError('No se pudo cerrar sesión. Inténtalo otra vez.');setBusy(false);return}
  setEmail(null);setRole(null)
  router.replace('/login')
  router.refresh()
 }
 const displayRole=role?String(role).replaceAll('_',' '):'Cuenta activa'
 return <div className="flex min-w-0 items-center gap-2 sm:gap-3">
  <div className="flex min-w-0 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 sm:px-3">
   <UserRound aria-hidden="true" className="h-5 w-5 shrink-0 text-sky-700"/>
   <div className="min-w-0 leading-tight"><p className="max-w-[110px] truncate text-xs font-bold text-slate-800 sm:max-w-[220px]" title={email??''}>{email??'Consultando cuenta…'}</p><p className="text-[10px] font-semibold capitalize text-slate-500">{displayRole}</p></div>
  </div>
  <button type="button" disabled={busy||!email} onClick={logout} className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-rose-200 px-3 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-50 disabled:opacity-50" aria-label="Cerrar sesión"><LogOut aria-hidden="true" className="h-4 w-4"/><span className="hidden sm:inline">{busy?'Saliendo…':'Cerrar sesión'}</span></button>
  {error?<span role="alert" className="max-w-36 text-xs text-red-700">{error}</span>:null}
 </div>
}
