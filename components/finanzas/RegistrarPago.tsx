'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {CreditCard,LoaderCircle} from 'lucide-react'
type Recibo={id:string;codigo:string|null;total:number;estado:string}
const methods=['transferencia_bancaria','yape','plin','deposito_bancario','efectivo'] as const
export function RegistrarPago({condominioId,recibos}:{condominioId:string;recibos:Recibo[]}){
 const router=useRouter()
 const [recibo,setRecibo]=useState('')
 const [metodo,setMetodo]=useState<(typeof methods)[number]>('transferencia_bancaria')
 const [monto,setMonto]=useState('')
 const [fecha,setFecha]=useState(new Date().toISOString().slice(0,10))
 const [operacion,setOperacion]=useState('')
 const [busy,setBusy]=useState(false)
 const [message,setMessage]=useState('')
 const eligible=recibos.filter(x=>x.estado!=='anulado')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setMessage('')
  const amount=Number(monto)
  if(!eligible.some(x=>x.id===recibo)||!Number.isFinite(amount)||amount<=0||amount>1000000000||!/^\d{4}-\d{2}-\d{2}$/.test(fecha)||operacion.trim().length>100){setMessage('Verifica el recibo, importe, fecha y operación.');return}
  setBusy(true)
  const {data,error}=await supabase.from('pagos').insert({condominio_id:condominioId,recibo_id:recibo,monto:amount,metodo,fecha_pago:fecha,numero_operacion:operacion.trim()||null,estado:'pendiente_validar'}).select('id,condominio_id,recibo_id,estado').single()
  setBusy(false)
  if(error||!data||data.condominio_id!==condominioId||data.recibo_id!==recibo||data.estado!=='pendiente_validar'){setMessage(error?.code==='23505'?'Ya existe una operación registrada con esa referencia.':'No se pudo confirmar el pago pendiente. Verifica los permisos y consulta el historial antes de volver a intentar.');return}
  setMonto('');setOperacion('');setRecibo('');setMessage('Pago registrado como pendiente de validación.');router.refresh()
 }
 return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="mb-5 flex items-center gap-3"><CreditCard className="text-sky-700"/><div><h2 className="text-lg font-bold">Registrar pago reportado</h2><p className="text-sm text-slate-500">Los pagos nuevos siempre requieren validación administrativa.</p></div></div>
 {!eligible.length?<p className="text-sm text-slate-500">No existen recibos disponibles para registrar pagos.</p>:<form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
 <label className="text-sm font-semibold">Recibo<select required value={recibo} onChange={e=>setRecibo(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="">Seleccionar recibo</option>{eligible.map(r=><option key={r.id} value={r.id}>{r.codigo||r.id.slice(0,8)} — S/ {Number(r.total).toFixed(2)}</option>)}</select></label>
 <label className="text-sm font-semibold">Método<select value={metodo} onChange={e=>setMetodo(e.target.value as (typeof methods)[number])} className="mt-2 w-full rounded-xl border p-3">{methods.map(m=><option key={m} value={m}>{m.replaceAll('_',' ')}</option>)}</select></label>
 <label className="text-sm font-semibold">Monto (S/)<input required type="number" min="0.01" max="1000000000" step="0.01" value={monto} onChange={e=>setMonto(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold">Fecha de pago<input required type="date" value={fecha} onChange={e=>setFecha(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <label className="text-sm font-semibold sm:col-span-2">Número de operación (si aplica)<input maxLength={100} value={operacion} onChange={e=>setOperacion(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
 <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy?<LoaderCircle className="animate-spin" size={18}/>:<CreditCard size={18}/>} Registrar pago pendiente</button>{message&&<p role="status" className="text-sm text-slate-700">{message}</p>}</div>
 </form>}</section>
}