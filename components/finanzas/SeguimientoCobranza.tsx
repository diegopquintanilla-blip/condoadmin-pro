'use client'

import {useRef,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'

const canales={whatsapp:'WhatsApp',correo:'Correo',llamada:'Llamada',presencial:'Presencial'}
const fechaContacto=new Intl.DateTimeFormat('es-PE',{timeZone:'America/Lima',dateStyle:'short'})

export type Contacto={
  inmueble_id:string
  canal:keyof typeof canales
  proximo_contacto:string|null
  nota:string|null
  registrado_at:string
}

export function SeguimientoCobranza({condominio,inmueble,contacto,hoy}:{
  condominio:string
  inmueble:string
  contacto?:Contacto
  hoy:string
}){
  const router=useRouter()
  const operacion=useRef<string|null>(null)
  const enviando=useRef(false)
  const [abierto,setAbierto]=useState(false)
  const [guardando,setGuardando]=useState(false)
  const [mensaje,setMensaje]=useState('')

  async function registrar(event:React.FormEvent<HTMLFormElement>){
    event.preventDefault()
    if(enviando.current)return
    enviando.current=true
    setGuardando(true)
    setMensaje('')
    const datos=new FormData(event.currentTarget)
    try {
      operacion.current??=crypto.randomUUID()
      const {error}=await supabase.from('cobranza_contactos').insert({
        id:operacion.current,condominio_id:condominio,inmueble_id:inmueble,
        canal:datos.get('canal'),proximo_contacto:datos.get('fecha')||null,
        nota:String(datos.get('nota')??'').trim()||null,
      })
      if(error&&error.code!=='23505'){
        setMensaje('No se pudo registrar el contacto. Intenta nuevamente.')
        return
      }
      operacion.current=null
      setAbierto(false)
      setMensaje('Contacto registrado.')
      router.refresh()
    } catch {
      setMensaje('No se pudo confirmar el registro. Intenta nuevamente.')
    } finally {
      enviando.current=false
      setGuardando(false)
    }
  }

  return <div className="min-w-52 space-y-2">
    {contacto?<div className="space-y-1">
      <p>{canales[contacto.canal]} · {fechaContacto.format(new Date(contacto.registrado_at))}</p>
      {contacto.proximo_contacto&&<p className={contacto.proximo_contacto<=hoy?'font-semibold text-amber-800':'text-slate-600'}>Próximo contacto {contacto.proximo_contacto}</p>}
      {contacto.nota&&<p className="break-words text-slate-600">{contacto.nota}</p>}
    </div>:<p className="text-slate-500">Sin contacto registrado</p>}
    {!abierto&&<button type="button" className="font-semibold text-sky-800 underline" onClick={()=>{setMensaje('');setAbierto(true)}}>Registrar contacto</button>}
    {abierto&&<form onSubmit={registrar}>
      <fieldset disabled={guardando} className="grid gap-2">
        <label className="grid gap-1">Canal
          <select name="canal" required defaultValue="" className="rounded-lg border p-2">
            <option value="" disabled>Seleccionar canal</option>
            {Object.entries(canales).map(([id,label])=><option key={id} value={id}>{label}</option>)}
          </select>
        </label>
        <label className="grid gap-1">Próximo contacto (opcional)
          <input type="date" name="fecha" min={hoy} className="rounded-lg border p-2"/>
        </label>
        <label className="grid gap-1">Nota (opcional)
          <textarea name="nota" maxLength={300} rows={2} className="rounded-lg border p-2"/>
        </label>
        <div className="flex flex-wrap gap-2">
          <button className="rounded-lg bg-sky-800 px-3 py-2 text-white">{guardando?'Guardando…':'Guardar contacto'}</button>
          <button type="button" className="px-2" onClick={()=>{operacion.current=null;setMensaje('');setAbierto(false)}}>Cancelar</button>
        </div>
      </fieldset>
    </form>}
    <p role="status">{mensaje}</p>
  </div>
}
