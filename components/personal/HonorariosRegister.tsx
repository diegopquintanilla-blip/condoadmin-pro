'use client'
import {useEffect,useState} from 'react'
import {supabase} from '@/lib/supabase/client'
type Honorario={id:string;proveedor:string;servicio:string;bruto:number;retencion:number;otros_descuentos:number;neto:number}
export function HonorariosRegister({condominioId}:{condominioId:string}){
 const [month,setMonth]=useState(new Date().toISOString().slice(0,7))
 const [rows,setRows]=useState<Honorario[]>([])
 const [codigo,setCodigo]=useState(''),[proveedor,setProveedor]=useState(''),[ruc,setRuc]=useState(''),[servicio,setServicio]=useState(''),[recibo,setRecibo]=useState('')
 const [qty,setQty]=useState('1'),[price,setPrice]=useState(''),[withholding,setWithholding]=useState(false),[deduction,setDeduction]=useState('0')
 const [saving,setSaving]=useState(false),[error,setError]=useState('')
 const validMonth=/^[0-9]{4}-(0[1-9]|1[0-2])$/.test(month)
 useEffect(()=>{if(!validMonth)return;let live=true;async function load(){const {data,error}=await supabase.from('hr_honorarios').select('id,proveedor,servicio,bruto,retencion,otros_descuentos,neto').eq('condominio_id',condominioId).eq('periodo',month+'-01').order('created_at',{ascending:false}).limit(200);if(live){setRows((data??[]) as Honorario[]);setError(error?'No se pudo cargar los honorarios.':'')}}void load();return()=>{live=false}},[condominioId,month,validMonth])
 const brut=Math.round(Number(qty)*Number(price)*100)/100
 const tax=withholding?Math.round(brut*.08*100)/100:0
 const net=Math.round((brut-tax-Number(deduction))*100)/100
 const valid=validMonth&&codigo.trim().length>0&&proveedor.trim().length>=2&&servicio.trim().length>=2&&(ruc===''||/^[0-9]{11}$/.test(ruc))&&Number(qty)>0&&Number(price)>=0&&price!==''&&Number(deduction)>=0&&Number.isFinite(net)&&net>=0
 async function save(){
  if(!valid)return
  setSaving(true);setError('')
  const {data,error:e}=await supabase.from('hr_honorarios').insert({condominio_id:condominioId,periodo:month+'-01',codigo:codigo.trim(),proveedor:proveedor.trim(),ruc:ruc||null,servicio:servicio.trim(),recibo:recibo||null,cantidad:Number(qty),tarifa:Number(price),retencion_porcentaje:withholding?8:0,otros_descuentos:Number(deduction)}).select('id,proveedor,servicio,bruto,retencion,otros_descuentos,neto').single()
  setSaving(false)
  if(e){setError('No se pudo guardar. Revisa duplicados, permisos o importes.');return}
  setRows(old=>[data as Honorario,...old]);setCodigo('');setProveedor('');setRuc('');setServicio('');setRecibo('');setPrice('');setDeduction('0')
 }
 const label=(name:string,value:string,set:(v:string)=>void,type='text')=><label className="text-xs font-semibold">{name}<input type={type} value={value} onChange={e=>set(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-300 p-2"/></label>
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-extrabold">Honorarios por servicios independientes</h2><p className="mt-2 text-sm text-slate-500">Registro independiente de la planilla laboral. Verificar el recibo, condición tributaria y si corresponde practicar retención.</p>
 <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><label className="text-xs font-semibold">Período<input type="month" value={month} onChange={e=>setMonth(e.target.value)} className="mt-1 w-full rounded-lg border p-2"/></label>{label('Código del proveedor',codigo,setCodigo)}{label('Prestador o razón social',proveedor,setProveedor)}{label('RUC (11 dígitos)',ruc,setRuc)}{label('Servicio prestado',servicio,setServicio)}{label('Número de recibo',recibo,setRecibo)}{label('Cantidad',qty,setQty,'number')}{label('Tarifa S/',price,setPrice,'number')}{label('Otros descuentos S/',deduction,setDeduction,'number')}</div>
 <label className="mt-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={withholding} onChange={e=>setWithholding(e.target.checked)}/> Aplicar retención del 8 % (verificada por administración)</label>
 <div className="mt-4 grid gap-2 sm:grid-cols-3">{[['Bruto',brut],['Retención',tax],['Neto estimado',net]].map(([name,value])=><div key={String(name)} className="rounded-xl bg-sky-50 p-3"><p className="text-xs text-slate-600">{name}</p><p className="font-bold">S/ {Number(value).toFixed(2)}</p></div>)}</div>
 <button type="button" onClick={()=>void save()} disabled={!valid||saving} className="mt-4 rounded-lg bg-sky-800 px-5 py-2 text-sm font-bold text-white disabled:opacity-50">{saving?'Guardando…':'Registrar honorario'}</button>
 {error?<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>:null}
 <div className="mt-5 space-y-2">{rows.map(r=><div key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3 text-sm"><span className="font-semibold">{r.proveedor} · {r.servicio}</span><span>Bruto S/ {Number(r.bruto).toFixed(2)} · Retención S/ {Number(r.retencion).toFixed(2)} · Neto S/ {Number(r.neto).toFixed(2)}</span></div>)}</div>
 <p className="mt-3 text-xs text-amber-800">La retención no se determina automáticamente: debe validarse el umbral, la condición del pagador, posibles suspensiones y el régimen vigente. No se ejecutan pagos.</p>
 </section>
}
