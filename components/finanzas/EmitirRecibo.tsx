'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {ReceiptText,LoaderCircle} from 'lucide-react'
type Property={id:string;codigo:string}
export function EmitirRecibo({condominioId,properties,canEdit}:{condominioId:string;properties:Property[];canEdit:boolean}){
 const router=useRouter()
 const [inmueble,setInmueble]=useState(properties[0]?.id??'')
 const [periodo,setPeriodo]=useState(new Date().toISOString().slice(0,7))
 const [importe,setImporte]=useState('')
 const [vencimiento,setVencimiento]=useState('')
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 if(!canEdit)return null
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setNotice('')
  const amount=Number(importe)
  if(!properties.some(p=>p.id===inmueble)||!/^\d{4}-(0[1-9]|1[0-2])$/.test(periodo)||!Number.isFinite(amount)||amount<=0||amount>1e9||!/^\d{4}-\d{2}-\d{2}$/.test(vencimiento)){setNotice('Verifica inmueble, período, importe y fecha.');return}
  setBusy(true)
  const date=new Date().toISOString().slice(0,10)
  const {error}=await supabase.from('recibos').insert({condominio_id:condominioId,inmueble_id:inmueble,periodo,concepto:'Mantenimiento',codigo:'MANT-'+periodo+'-'+inmueble.slice(0,8),fecha_emision:date,fecha_vencimiento:vencimiento,subtotal:amount,mora:0,total:amount,monto:amount,estado:'pendiente'})
  setBusy(false)
  if(error){setNotice(error.code==='23505'?'Ya existe un recibo de mantenimiento para ese inmueble y período.':'No se pudo emitir el recibo. Comprueba permisos y datos.');return}
  setNotice('Recibo emitido correctamente.');router.refresh()
 }
 return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><ReceiptText className="text-sky-700"/><div><h2 className="text-xl font-bold">Emitir recibo de mantenimiento</h2><p className="text-sm text-slate-500">Emisión manual, sin cargos automáticos ni procesamiento bancario.</p></div></div>
 {properties.length===100?<p className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">Solo se muestran los primeros 100 inmuebles. Se ampliará la búsqueda en una siguiente fase.</p>:null}
 {!properties.length?<p className="text-sm text-slate-500">Registra un inmueble antes de emitir recibos.</p>:<form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
 <label className="text-sm font-semibold">Inmueble<select required value={inmueble} onChange={e=>setInmueble(e.target.value)} className="mt-2 w-full rounded-xl border p-3">{properties.map(p=><option key={p.id} value={p.id}>{p.codigo}</option>)}</select></label>
 <label className="text-sm font-semibold">Período<input required type="month" value={periodo} onChange={e=>setPeriodo(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold">Importe (S/)<input required type="number" min="0.01" max="1000000000" step="0.01" value={importe} onChange={e=>setImporte(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold">Fecha de vencimiento<input required type="date" value={vencimiento} onChange={e=>setVencimiento(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <div className="sm:col-span-2 flex flex-wrap items-center gap-3"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?<LoaderCircle size={18} className="animate-spin"/>:<ReceiptText size={18}/>} Emitir recibo</button>{notice&&<p role="status" className="text-sm text-slate-700">{notice}</p>}</div>
 </form>}</section>
}