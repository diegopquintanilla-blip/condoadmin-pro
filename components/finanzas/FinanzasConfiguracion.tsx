'use client'

import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {LoaderCircle,Pencil,Settings2} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

type Settings={
 mantenimiento_base:number|null
 mora_base:number|null
 dia_corte:number|null
 dia_vencimiento:number|null
 permitir_pagos_adelantados:boolean
}

const campos='mantenimiento_base,mora_base,dia_corte,dia_vencimiento,permitir_pagos_adelantados'
const moneda=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'})
const importe=(n:number|null)=>n===null?'Sin definir':moneda.format(n)
const inputStyle='mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2'

export function FinanzasConfiguracion({condominioId,initial,canEdit}:{condominioId:string;initial:Settings|null;canEdit:boolean}){
 const router=useRouter()
 const [vigente,setVigente]=useState(initial)
 const [editing,setEditing]=useState(false)
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 const [error,setError]=useState('')

 async function submit(event:FormEvent<HTMLFormElement>){
  event.preventDefault()
  if(busy||!canEdit)return
  setError('')
  setNotice('')
  const form=new FormData(event.currentTarget)
  const base=Number(form.get('mantenimiento'))
  const mora=Number(form.get('mora'))
  const corte=Number(form.get('corte'))
  const vence=Number(form.get('vencimiento'))
  if(![base,mora].every(n=>Number.isFinite(n)&&n>=0&&n<=1e9)||
     ![corte,vence].every(n=>Number.isInteger(n)&&n>=1&&n<=28)){
   setError('Verifica los importes y elige días del 1 al 28.')
   return
  }

  setBusy(true)
  try{
   const {data,error}=await supabase.from('finanzas_config').upsert({
    condominio_id:condominioId,
    mantenimiento_base:base,
    mora_base:mora,
    dia_corte:corte,
    dia_vencimiento:vence,
    permitir_pagos_adelantados:form.get('adelantos')==='on',
   },{onConflict:'condominio_id'}).select(campos).single()
   if(error||!data){
    setError(error?.message==='LIMITE_ACCIONES_ALCANZADO'?'Alcanzaste el cupo de acciones de tu plan.':'No se pudo guardar la configuración. Verifica tus permisos e inténtalo de nuevo.')
    return
   }
   setVigente(data)
   setEditing(false)
   setNotice('Configuración guardada.')
   router.refresh()
  }catch{
   setError('No se pudo confirmar el guardado. Actualiza la página antes de volver a intentar.')
  }finally{setBusy(false)}
 }

 return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="config-cobranza">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div className="flex items-start gap-3"><Settings2 className="mt-1 shrink-0 text-sky-700" aria-hidden="true"/><div>
    <h2 id="config-cobranza" className="text-lg font-bold">Configuración de cobranza</h2>
    <p className="mt-1 text-sm text-slate-600">Cuota, mora y calendario de referencia para la gestión manual.</p>
   </div></div>
   {canEdit&&!editing&&<button type="button" onClick={()=>{setNotice('');setEditing(true)}} className="inline-flex items-center gap-2 rounded-lg border border-sky-200 px-3 py-2 text-sm font-semibold text-sky-900 hover:bg-sky-50"><Pencil size={16} aria-hidden="true"/>{vigente?'Editar configuración':'Configurar cobranza'}</button>}
  </div>
  {editing&&canEdit?<form onSubmit={submit} className="mt-5">
   <fieldset disabled={busy} className="grid gap-4 sm:grid-cols-2">
    <label className="text-sm font-semibold">Cuota de mantenimiento (S/)<input name="mantenimiento" required type="number" min="0" max="1000000000" step="0.01" defaultValue={vigente?.mantenimiento_base??0} className={inputStyle}/></label>
    <label className="text-sm font-semibold">Mora de referencia (S/)<input name="mora" required type="number" min="0" max="1000000000" step="0.01" defaultValue={vigente?.mora_base??0} className={inputStyle}/></label>
    <label className="text-sm font-semibold">Día de corte<input name="corte" required type="number" min="1" max="28" defaultValue={vigente?.dia_corte??1} className={inputStyle}/></label>
    <label className="text-sm font-semibold">Día de vencimiento<input name="vencimiento" required type="number" min="1" max="28" defaultValue={vigente?.dia_vencimiento??15} className={inputStyle}/></label>
    <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input name="adelantos" type="checkbox" defaultChecked={vigente?.permitir_pagos_adelantados??true}/> Permitir pagos adelantados</label>
    <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
     <button className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-4 py-2 text-sm font-bold text-white">{busy&&<LoaderCircle size={16} className="animate-spin" aria-hidden="true"/>}{busy?'Guardando…':'Guardar cambios'}</button>
     <button type="button" onClick={()=>{setError('');setEditing(false)}} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold">Cancelar</button>
    </div>
   </fieldset>
   {error&&<p role="alert" className="mt-3 text-sm text-red-800">{error}</p>}
  </form>:vigente?<dl className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-5">
   {[
    ['Cuota de mantenimiento',importe(vigente.mantenimiento_base)],
    ['Mora de referencia',importe(vigente.mora_base)],
    ['Día de corte',vigente.dia_corte??'Sin definir'],
    ['Día de vencimiento',vigente.dia_vencimiento??'Sin definir'],
    ['Pagos adelantados',vigente.permitir_pagos_adelantados?'Permitidos':'Deshabilitados'],
   ].map(([nombre,valor])=><div key={nombre} className="min-w-0 rounded-xl bg-slate-50 p-3"><dt className="text-xs text-slate-600">{nombre}</dt><dd className="mt-1 text-sm font-bold text-slate-900">{valor}</dd></div>)}
  </dl>:<p className="mt-4 text-sm text-slate-600">Este condominio aún no tiene una configuración guardada.</p>}
  {notice&&<p role="status" className="mt-3 text-sm font-semibold text-emerald-800">{notice}</p>}
 </section>
}
