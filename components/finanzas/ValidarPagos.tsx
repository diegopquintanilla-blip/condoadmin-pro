'use client'

import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {ShieldCheck} from 'lucide-react'
import {supabase} from '@/lib/supabase/client'

type Pago={
 id:string;monto:number;metodo:string;fecha_pago:string|null;numero_operacion:string|null
 unidad:string|null;recibo:string|null;periodo:string|null;saldo:number|null
 comprobante:string|null;referencia_repetida:boolean;observacion:string|null
}

const formato=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'})

function enlaceComprobante(valor:string|null){
 if(!valor)return null
 try{
  const url=new URL(valor)
  return url.protocol==='https:'&&!url.username&&!url.password?url.href:null
 }catch{return null}
}

export function ValidarPagos({condominioId,pagos,total}:{condominioId:string;pagos:Pago[];total?:number}){
 const router=useRouter()
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 const [target,setTarget]=useState<Pago|null>(null)
 const [motivo,setMotivo]=useState('')
 const [rechazando,setRechazando]=useState(false)

 async function resolver(estado:'validado'|'rechazado'){
  if(!target||busy||(estado==='rechazado'&&!motivo.trim()))return
  setBusy(true)
  setNotice('')
  try{
   const cambios=estado==='rechazado'
    ?{estado,observacion:[target.observacion,'Motivo de rechazo: '+motivo.trim()].filter(Boolean).join('\n')}
    :{estado}
   const {data,error}=await supabase.from('pagos').update(cambios)
    .eq('id',target.id).eq('condominio_id',condominioId).eq('estado','pendiente_validar').select('id').maybeSingle()
   if(error||!data){
    setNotice(error?.message==='LIMITE_ACCIONES_ALCANZADO'?'Alcanzaste el cupo de acciones de tu plan.':'No se aplicó la decisión. Revisa tus permisos y el estado actual del pago.')
    if(!error){dialogo?.close();setTarget(null);router.refresh()}
    return
   }
   dialogo?.close()
   setTarget(null)
   setNotice(estado==='validado'?(target.recibo?'Pago validado. El saldo del recibo ya incluye este abono.':'Pago validado.'):'Pago rechazado. El saldo del recibo no cambió.')
   router.refresh()
  }catch{
   setNotice('No pudimos confirmar la decisión. Actualiza la bandeja antes de intentar de nuevo.')
  }finally{setBusy(false)}
 }

 function revisar(pago:Pago,dialogo:HTMLDialogElement|null){
  setTarget(pago)
  setMotivo('')
  setRechazando(false)
  setNotice('')
  dialogo?.showModal()
 }

 const [dialogo,setDialogo]=useState<HTMLDialogElement|null>(null)
 const comprobante=target&&enlaceComprobante(target.comprobante)
 const saldo=target&&target.saldo!==null?Number(target.saldo):null
 const siguiente=target&&saldo!==null?(Math.round(saldo*100)-Math.round(Number(target.monto)*100))/100:null

 return <section id="validar-pagos" className="scroll-mt-24 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
  <div className="mb-4 flex items-start gap-3"><ShieldCheck className="mt-1 shrink-0 text-sky-700" aria-hidden="true"/><div><h2 className="text-lg font-bold">Bandeja de validación</h2><p className="text-sm text-slate-600">{total??pagos.length} pendientes · Primero los más antiguos{total!==undefined&&total>pagos.length?' · Primeros '+pagos.length:''}</p></div></div>
  {notice&&!target&&<p role="status" className="mb-4 rounded-lg bg-sky-50 p-3 text-sm">{notice}</p>}
  {!pagos.length?<p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No hay pagos pendientes de validación.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm">
   <thead className="bg-slate-50"><tr>{['Unidad y recibo','Fecha','Referencia','Importe','Acción'].map(x=><th scope="col" className="p-3" key={x}>{x}</th>)}</tr></thead>
   <tbody>{pagos.map(p=><tr key={p.id} className="border-t border-slate-100">
    <td className="p-3"><strong>{p.unidad??'Unidad no indicada'}</strong><p className="text-xs text-slate-600">{p.recibo??'Sin recibo vinculado'}</p></td>
    <td className="p-3">{p.fecha_pago??'—'}</td><td className="p-3">{p.numero_operacion??'—'}{p.referencia_repetida&&<p className="text-xs font-semibold text-amber-800">Referencia repetida</p>}</td>
    <td className="whitespace-nowrap p-3 font-semibold">{formato.format(p.monto)}</td>
    <td className="p-3"><button type="button" onClick={()=>revisar(p,dialogo)} className="rounded-lg border border-sky-200 px-3 py-2 font-semibold text-sky-900">Revisar</button></td>
   </tr>)}</tbody>
  </table></div>}
  <dialog ref={setDialogo} onCancel={event=>{if(busy)event.preventDefault()}} onClose={()=>setTarget(null)} className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl backdrop:bg-slate-950/60" aria-labelledby="pago-revision">
   {target&&<>
    <h3 id="pago-revision" className="text-xl font-bold">Revisar pago</h3>
    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
     {[
      ['Unidad',target.unidad??'—'],['Recibo',target.recibo??'Sin recibo vinculado'],
      ['Periodo',target.periodo??'—'],['Fecha',target.fecha_pago??'—'],
      ['Método',target.metodo],['Referencia',target.numero_operacion??'—'],
      ['Importe',formato.format(target.monto)],['Saldo actual',saldo===null?'—':formato.format(saldo)]
     ].map(([label,value])=><div key={label}><dt className="text-slate-600">{label}</dt><dd className="font-semibold">{value}</dd></div>)}
    </dl>
    {siguiente!==null&&<p className="mt-4 rounded-xl bg-sky-50 p-3 text-sm">{siguiente<0?'Excedente estimado si se valida':'Saldo estimado si se valida'} <strong>{formato.format(Math.abs(siguiente))}</strong></p>}
    {target.referencia_repetida&&<p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-900">La referencia coincide con otro pago. Verifica si corresponde al mismo movimiento.</p>}
    {target.observacion&&<p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{target.observacion}</p>}
    <p className="mt-3 text-sm">{comprobante?<a href={comprobante} target="_blank" rel="noopener noreferrer" className="font-semibold text-sky-800 underline">Abrir comprobante</a>:'Sin enlace de comprobante disponible.'}</p>
    {rechazando&&<label className="mt-4 grid gap-1 text-sm font-semibold">Motivo del rechazo<textarea value={motivo} onChange={e=>setMotivo(e.target.value)} maxLength={400} rows={2} className="rounded-lg border border-slate-300 p-2"/></label>}
    {notice&&<p role="alert" className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{notice}</p>}
    <div className="mt-5 flex flex-wrap gap-2">
     <button type="button" disabled={busy||(rechazando&&!motivo.trim())} onClick={()=>void resolver(rechazando?'rechazado':'validado')} className="rounded-lg bg-sky-800 px-4 py-2 font-semibold text-white disabled:opacity-50">{busy?'Guardando…':rechazando?'Confirmar rechazo':'Validar pago'}</button>
     {!rechazando&&<button type="button" disabled={busy} onClick={()=>setRechazando(true)} className="rounded-lg border border-rose-200 px-4 py-2 font-semibold text-rose-800">Rechazar</button>}
     <button type="button" disabled={busy} onClick={()=>dialogo?.close()} className="rounded-lg border border-slate-300 px-4 py-2">Cerrar</button>
    </div>
   </>}
  </dialog>
 </section>
}
