'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {UserRoundPlus} from 'lucide-react'
export function AsignarAcceso({condominioId,canGrantAdmin}:{condominioId:string;canGrantAdmin:boolean}){
 const router=useRouter()
 const [email,setEmail]=useState(''),[role,setRole]=useState('operador'),[busy,setBusy]=useState(false),[message,setMessage]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('')
  if(!email.trim()||email.length>254||!['admin','operador'].includes(role)||role==='admin'&&!canGrantAdmin){setMessage('Revisa el correo y el rol.');return}
  setBusy(true)
  const {error}=await supabase.rpc('asignar_usuario_condominio',{p_condominio:condominioId,p_email:email.trim(),p_rol:role})
  setBusy(false)
  if(error){setMessage(error.message.includes('register and confirm')?'El usuario debe registrarse y verificar su correo antes de asignarle acceso.':error.message.includes('Only owner')?'Solo el creador del condominio puede gestionar administradores.':'No se pudo asignar el acceso. Verifica que tengas permiso y el usuario exista.');return}
  setEmail('');setMessage('Acceso asignado correctamente.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><UserRoundPlus className="text-sky-700"/> Asignar usuario</h2><p className="mt-2 text-sm text-slate-600">Vincula una cuenta existente y con correo verificado. No se envían invitaciones ni se generan contraseñas.</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Correo de la cuenta<input type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} placeholder="usuario@empresa.com" className="mt-2 w-full rounded-xl border border-slate-300 p-3"/></label><label className="text-sm font-semibold">Rol<select value={role} onChange={e=>setRole(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 p-3"><option value="operador">Operador — acceso limitado</option>{canGrantAdmin?<option value="admin">Administrador — gestión ampliada</option>:null}</select></label></div><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Asignando…':'Asignar acceso'}</button>{message?<p role="status" className="mt-3 text-sm text-slate-700">{message}</p>:null}</form>
}