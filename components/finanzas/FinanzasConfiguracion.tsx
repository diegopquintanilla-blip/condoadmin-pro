'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Settings2,LoaderCircle,Save} from 'lucide-react'
type Settings={mantenimiento_base:number|null;mora_base:number|null;dia_corte:number|null;dia_vencimiento:number|null;permitir_pagos_adelantados:boolean;generar_recibos_auto:boolean}
export function FinanzasConfiguracion({condominioId,initial,canEdit}:{condominioId:string;initial:Settings|null;canEdit:boolean}){
 const router=useRouter()
 const [base,setBase]=useState(String(initial?.mantenimiento_base??0))
 const [mora,setMora]=useState(String(initial?.mora_base??0))
 const [corte,setCorte]=useState(String(initial?.dia_corte??1))
 const [vence,setVence]=useState(String(initial?.dia_vencimiento??15))
 const [adelantos,setAdelantos]=useState(initial?.permitir_pagos_adelantados??true)
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 if(!canEdit)return null
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setNotice('')
  const amount=Number(base),late=Number(mora),day=Number(corte),due=Number(vence)
  if(![amount,late,day,due].every(Number.isFinite)||amount<0||late<0||amount>1e9||late>1e9||![day,due].every(x=>Number.isInteger(x)&&x>=1&&x<=28)){setNotice('Verifica los importes y los días (1 a 28).');return}
  setBusy(true)
  const payload={condominio_id:condominioId,mantenimiento_base:amount,mora_base:late,dia_corte:day,dia_vencimiento:due,permitir_pagos_adelantados:adelantos,generar_recibos_auto:false}
  const {error}=await supabase.from('finanzas_config').upsert(payload,{onConflict:'condominio_id'})
  setBusy(false)
  if(error){setNotice('No fue posible guardar la configuración. Verifica los permisos administrativos.');return}
  setNotice('Configuración guardada. No se han generado recibos ni cobros.');router.refresh()
 }
 return <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="mb-5 flex items-center gap-3"><Settings2 className="text-sky-700"/><div><h2 className="text-lg font-bold">Administrar parámetros de cobranza</h2><p className="text-sm text-slate-500">Valores de referencia; guardar no emite recibos ni procesa pagos.</p></div></div>
  <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
   <label className="text-sm font-semibold">Mantenimiento base (S/)<input required type="number" min="0" max="1000000000" step="0.01" value={base} onChange={e=>setBase(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
   <label className="text-sm font-semibold">Mora base (S/)<input required type="number" min="0" max="1000000000" step="0.01" value={mora} onChange={e=>setMora(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
   <label className="text-sm font-semibold">Día de corte<input required type="number" min="1" max="28" value={corte} onChange={e=>setCorte(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
   <label className="text-sm font-semibold">Día de vencimiento<input required type="number" min="1" max="28" value={vence} onChange={e=>setVence(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
   <label className="flex items-center gap-2 text-sm font-medium sm:col-span-2"><input type="checkbox" checked={adelantos} onChange={e=>setAdelantos(e.target.checked)}/> Permitir pagos adelantados</label>
   <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?<LoaderCircle size={18} className="animate-spin"/>:<Save size={18}/>} Guardar configuración</button>{notice&&<p role="status" className="text-sm text-slate-700">{notice}</p>}</div>
  </form>
 </section>
}
