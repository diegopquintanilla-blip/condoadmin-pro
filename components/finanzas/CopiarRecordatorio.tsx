'use client'

import {useState} from 'react'

export function CopiarRecordatorio({mensaje}:{mensaje:string}) {
  const [abierto,setAbierto]=useState(false)
  const [estado,setEstado]=useState('')

  async function copiar() {
    try {
      await navigator.clipboard.writeText(mensaje)
      setEstado('Copiado')
    } catch {
      setEstado('Selecciona el mensaje para copiarlo manualmente.')
    }
  }

  return <div className="space-y-2">
    <button type="button" aria-expanded={abierto} className="rounded-lg border border-sky-200 px-3 py-2 font-semibold text-sky-800" onClick={()=>setAbierto(!abierto)}>
      {abierto?'Ocultar recordatorio':'Preparar recordatorio'}
    </button>
    {abierto&&<div className="space-y-2">
      <textarea aria-label="Texto del recordatorio" className="w-full min-w-56 rounded-lg border p-2" readOnly rows={4} value={mensaje}/>
      <button type="button" className="rounded-lg bg-sky-800 px-3 py-2 text-white" onClick={copiar}>Copiar mensaje</button>
      <p role="status">{estado}</p>
    </div>}
  </div>
}
