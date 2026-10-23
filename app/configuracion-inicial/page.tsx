'use client'
import {useState, type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'

export default function PrimerCondominioPage(){
 const router=useRouter()
 const [nombre,setNombre]=useState('')
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  const trimmed=nombre.trim()
  if(trimmed.length<3||trimmed.length>120){setError('Ingresa un nombre real de 3 a 120 caracteres.');return}
  setBusy(true);setError('')
  const {data,error:rpcError}=await supabase.rpc('bootstrap_first_condominium',{p_nombre:trimmed})
  setBusy(false)
  if(rpcError||!data){setError('No se pudo registrar el condominio. Comprueba tu sesión y que aún no exista otro condominio.');return}
  router.replace('/dashboard?condominio='+encodeURIComponent(String(data)))
  router.refresh()
 }
 return <main className="mx-auto max-w-xl p-8">
 <h1 className="text-3xl font-bold">Registrar primer condominio</h1>
 <p className="mt-3 text-gray-600">Configuración inicial reservada para la única cuenta registrada. No crea datos ficticios.</p>
 <form onSubmit={submit} className="mt-8 space-y-4">
 <label className="block font-medium">Nombre del condominio<input value={nombre} onChange={e=>setNombre(e.target.value)} required minLength={3} maxLength={120} className="mt-2 w-full rounded-lg border p-3" placeholder="Nombre real del condominio"/></label>
 {error&&<p role="alert" className="text-red-700">{error}</p>}
 <button disabled={busy} className="rounded-lg bg-blue-800 px-5 py-3 text-white disabled:opacity-50">{busy?'Registrando…':'Crear condominio'}</button>
 </form></main>
}
