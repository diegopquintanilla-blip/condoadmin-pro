'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {ShieldCheck,LoaderCircle} from 'lucide-react'
type Payment={id:string;monto:number;metodo:string;fecha_pago:string|null;numero_operacion:string|null;estado:string}
export function ValidarPagos({condominioId,pagos}:{condominioId:string;pagos:Payment[]}){
 const router=useRouter()
 const [busy,setBusy]=useState<string|null>(null)
 const [notice,setNotice]=useState('')
 const [target,setTarget]=useState<{p:Payment;estado:'validado'|'rechazado'}|null>(null)
 const pending=pagos.filter(p=>p.estado==='pendiente_validar')
 async function confirm(){
  if(!target||busy)return
  const {p,estado}=target
  setBusy(p.id);setNotice('')
  const {data,error}=await supabase.from('pagos').update({estado}).eq('id',p.id).eq('condominio_id',condominioId).eq('estado','pendiente_validar').select('id').maybeSingle()
  setBusy(null);setTarget(null)
  if(error||!data){setNotice('No se aplicó el cambio. Comprueba permisos o si otro administrador ya procesó el pago.');return}
  setNotice(estado==='validado'?'Pago validado.':'Pago rechazado.')
  router.refresh()
 }
 return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3"><ShieldCheck className="text-sky-700"/><div><h2 className="text-lg font-bold">Validación administrativa de pagos</h2><p className="text-sm text-slate-500">Solo pagos pendientes; los cambios son definitivos y requieren confirmación.</p></div></div>
 {notice&&<p role="status" className="mb-4 rounded-lg bg-sky-50 p-3 text-sm">{notice}</p>}
 {!pending.length?<p className="text-sm text-slate-500">No hay pagos pendientes dentro de los registros consultados.</p>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Fecha','Método','Operación','Monto','Acciones'].map(x=><th className="p-3" key={x}>{x}</th>)}</tr></thead><tbody>{pending.map(p=><tr key={p.id} className="border-t"><td className="p-3">{p.fecha_pago??'—'}</td><td className="p-3">{p.metodo}</td><td className="p-3">{p.numero_operacion??'—'}</td><td className="p-3">S/ {Number(p.monto).toFixed(2)}</td><td className="flex gap-2 p-3"><button onClick={()=>setTarget({p,estado:'validado'})} className="rounded-lg bg-emerald-700 px-3 py-2 text-white">Validar</button><button onClick={()=>setTarget({p,estado:'rechazado'})} className="rounded-lg border border-red-300 px-3 py-2 text-red-700">Rechazar</button></td></tr>)}</tbody></table></div>}
 {target&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section role="alertdialog" aria-modal="true" aria-label="Confirmar decisión sobre pago" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-xl font-bold">Confirmar {target.estado==='validado'?'validación':'rechazo'}</h3><p className="mt-3 text-sm text-slate-600">Pago de S/ {Number(target.p.monto).toFixed(2)}. Esta acción no debe realizarse sin verificar su comprobante o evidencia.</p><div className="mt-6 flex flex-wrap gap-3"><button disabled={!!busy} onClick={confirm} className="inline-flex items-center gap-2 rounded-lg bg-sky-800 px-4 py-3 text-white disabled:opacity-50">{busy?<LoaderCircle className="animate-spin" size={16}/>:null}Confirmar decisión</button><button disabled={!!busy} onClick={()=>setTarget(null)} className="rounded-lg border px-4 py-3">Cancelar</button></div></section></div>}
 </section>
}