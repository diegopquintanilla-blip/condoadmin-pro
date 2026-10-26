'use client'
import Link from 'next/link'
import {useCallback,useEffect,useState} from 'react'
import {usePathname} from 'next/navigation'
import {Bell,MessageCircle} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

export function SupportFloatingIndicator(){
 const pathname=usePathname()
 const [count,setCount]=useState<number|null>(null)
 const [agent,setAgent]=useState(false)
 const [expanded,setExpanded]=useState(false)
 const refresh=useCallback(async()=>{
  const {data:{user}}=await supabase.auth.getUser()
  if(!user){setCount(null);setAgent(false);return}
  const [notices,role]=await Promise.all([
   supabase.from('support_notifications').select('id',{head:true,count:'exact'}).eq('recipient_id',user.id).is('read_at',null),
   supabase.from('support_agents').select('user_id').eq('user_id',user.id).eq('is_active',true).maybeSingle()
  ])
  setAgent(Boolean(role.data))
  setCount(notices.error?null:(notices.count??0))
 },[])
 useEffect(()=>{
  void refresh()
  const {data:{subscription}}=supabase.auth.onAuthStateChange(()=>{void refresh()})
  const onFocus=()=>{void refresh()}
  window.addEventListener('focus',onFocus)
  const interval=window.setInterval(()=>void refresh(),60000)
  return()=>{subscription.unsubscribe();window.removeEventListener('focus',onFocus);window.clearInterval(interval)}
 },[refresh])
 if(pathname.startsWith('/login'))return null
 return <div className="fixed bottom-5 right-4 z-40 sm:bottom-7 sm:right-7">
  {expanded?<div className="mb-3 w-[min(320px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl" role="region" aria-label="Actividad de soporte">
    <p className="text-sm font-extrabold text-slate-900">Centro de soporte</p>
    <p className="mt-1 text-sm text-slate-600">{count===null?'No se pudo consultar el contador.':count===0?'No tienes avisos sin leer.':count===1?'Tienes 1 notificación pendiente.':`Tienes ${count} notificaciones pendientes.`}</p>
    <div className="mt-4 flex flex-wrap gap-2"><Link href="/soporte/notificaciones" onClick={()=>setExpanded(false)} className="rounded-lg bg-sky-800 px-3 py-2 text-xs font-bold text-white">Ver avisos</Link><Link href={agent?'/soporte/admin':'/modulos/soporte'} onClick={()=>setExpanded(false)} className="rounded-lg border px-3 py-2 text-xs font-bold text-slate-700">{agent?'Bandeja de soporte':'Mis tickets'}</Link></div>
  </div>:null}
  <button type="button" onClick={()=>{if(!expanded)void refresh();setExpanded(x=>!x)}} aria-expanded={expanded} aria-label={count===null?'Abrir centro de soporte':`Abrir centro de soporte, ${count} notificaciones sin leer`} className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-white px-3 py-2.5 text-left shadow-xl shadow-slate-900/15 transition hover:border-sky-300 hover:shadow-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600">
   <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-800"><MessageCircle className="h-5 w-5"/>{count!==null&&count>0?<span className="absolute -right-2 -top-2 flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-bold text-white">{count>99?'99+':count}</span>:null}</span>
   <span className="hidden sm:block"><span className="block text-sm font-extrabold text-slate-900">Soporte</span><span className="block text-xs text-slate-500">{count===null?'Consultar actividad':count===0?'Sin pendientes':`${count} pendiente${count===1?'':'s'}`}</span></span>
   <Bell className="hidden h-4 w-4 text-sky-700 sm:block"/>
  </button>
 </div>
}
