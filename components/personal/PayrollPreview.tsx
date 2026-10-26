'use client'
import {useMemo,useState} from 'react'
import {Calculator,FileText,Info} from 'lucide-react'
const soles=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
const amount=(v:string)=>Math.max(0,Math.min(1000000,Number(v)||0))
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100
export function PayrollPreview(){
 const [mode,setMode]=useState<'dependiente'|'honorarios'>('dependiente')
 const [salary,setSalary]=useState('1230')
 const [days,setDays]=useState('30')
 const [monthlyDays,setMonthlyDays]=useState('30')
 const [dayHours,setDayHours]=useState('8')
 const [extra25,setExtra25]=useState('0')
 const [extra35,setExtra35]=useState('0')
 const [bonus,setBonus]=useState('0')
 const [deductions,setDeductions]=useState('0')
 const [serviceValue,setServiceValue]=useState('1500')
 const [serviceUnits,setServiceUnits]=useState('1')
 const [withholding,setWithholding]=useState(false)
 const [suspended,setSuspended]=useState(false)
 const calculations=useMemo(()=>{
  const base=amount(salary),worked=Math.min(31,amount(days)),denominator=Math.max(1,Math.min(31,amount(monthlyDays)||30)),hours=Math.max(1,Math.min(24,amount(dayHours)||8))
  const earned=round(base*worked/denominator)
  const hourly=base/denominator/hours
  const overtime=round(hourly*1.25*amount(extra25)+hourly*1.35*amount(extra35))
  const additions=amount(bonus),less=amount(deductions)
  const gross=round(earned+overtime+additions),net=round(Math.max(0,gross-less))
  const independentGross=round(amount(serviceValue)*amount(serviceUnits))
  const tax=withholding&&!suspended&&independentGross>1500?round(independentGross*0.08):0
  return {earned,overtime,gross,less,net,independentGross,tax,independentNet:round(independentGross-tax)}
 },[salary,days,monthlyDays,dayHours,extra25,extra35,bonus,deductions,serviceValue,serviceUnits,withholding,suspended])

 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm" aria-label="Simulador de remuneración y honorarios">
 <div className="flex items-center gap-3"><span className="rounded-xl bg-sky-100 p-3 text-sky-800"><Calculator/></span><div><h2 className="text-xl font-extrabold">Simulador mensual de pagos</h2><p className="text-sm text-slate-500">Calcula importes preliminares sin modificar la base de datos ni efectuar pagos.</p></div></div>
 <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Tipo de vínculo">
 <button type="button" aria-pressed={mode==='dependiente'} onClick={()=>setMode('dependiente')} className={'rounded-xl px-4 py-2 text-sm font-bold '+(mode==='dependiente'?'bg-sky-800 text-white':'border bg-slate-50')}>Trabajador dependiente</button>
 <button type="button" aria-pressed={mode==='honorarios'} onClick={()=>setMode('honorarios')} className={'rounded-xl px-4 py-2 text-sm font-bold '+(mode==='honorarios'?'bg-sky-800 text-white':'border bg-slate-50')}>Recibo por honorarios</button></div>
 {mode==='dependiente'?<><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Field label="Sueldo básico mensual (S/)" value={salary} set={setSalary} step=".01"/><Field label="Días trabajados" value={days} set={setDays}/><Field label="Días de base del cálculo" value={monthlyDays} set={setMonthlyDays}/><Field label="Horas de jornada diaria" value={dayHours} set={setDayHours}/><Field label="Horas adicionales al 25%" value={extra25} set={setExtra25} step=".5"/><Field label="Horas adicionales al 35%" value={extra35} set={setExtra35} step=".5"/><Field label="Otros ingresos (S/)" value={bonus} set={setBonus} step=".01"/><Field label="Descuentos autorizados (S/)" value={deductions} set={setDeductions} step=".01"/></div>
 <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><Summary label="Básico proporcional" value={calculations.earned}/><Summary label="Horas adicionales" value={calculations.overtime}/><Summary label="Total bruto" value={calculations.gross}/><Summary label="Neto provisional" value={calculations.net} featured/></div>
 <p className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><Info size={18} className="mt-0.5 shrink-0"/> Estimación aritmética: no aplica aún AFP/ONP, quinta categoría, EsSalud, asignación familiar, CTS, gratificaciones, vacaciones, faltas, descanso semanal ni reglas especiales. Los recargos por horas adicionales son referenciales; deben verificarse el horario, la jornada y el régimen legal antes de emitir una boleta.</p></>:
 <><div className="mt-5 grid gap-4 sm:grid-cols-2"><Field label="Honorario por servicio (S/)" value={serviceValue} set={setServiceValue} step=".01"/><Field label="Servicios o unidades" value={serviceUnits} set={setServiceUnits}/></div>
 <div className="mt-4 space-y-3"><label className="flex gap-2 text-sm"><input type="checkbox" checked={withholding} onChange={e=>setWithholding(e.target.checked)}/> El pagador es agente de retención y corresponde evaluar retención</label><label className="flex gap-2 text-sm"><input type="checkbox" checked={suspended} onChange={e=>setSuspended(e.target.checked)}/> Cuenta con suspensión de retenciones vigente y verificable</label></div>
 <div className="mt-6 grid gap-3 sm:grid-cols-3"><Summary label="Honorarios brutos" value={calculations.independentGross}/><Summary label="Retención referencial 8%" value={calculations.tax}/><Summary label="Importe neto estimado" value={calculations.independentNet} featured/></div>
 <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">La retención de 8% se muestra solo si marcas que el pagador es agente de retención, el importe supera S/ 1,500 y no existe suspensión vigente. Verifica el comprobante, la condición tributaria y posibles supuestos especiales antes de pagar.</p></>}
 <p className="mt-4 flex items-center gap-2 text-xs text-slate-500"><FileText size={15}/> Vista preliminar sin guardar. No genera boletas oficiales, asientos contables ni transferencias.</p>
 </section>
}
function Field({label,value,set,step='1'}:{label:string;value:string;set:(v:string)=>void;step?:string}){return <label className="text-sm font-semibold text-slate-700">{label}<input type="number" min="0" max="1000000" step={step} value={value} onChange={e=>set(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3"/></label>}
function Summary({label,value,featured=false}:{label:string;value:number;featured?:boolean}){return <div className={'rounded-2xl p-4 '+(featured?'bg-sky-900 text-white':'bg-slate-100 text-slate-900')}><p className={'text-xs '+(featured?'text-sky-100':'text-slate-600')}>{label}</p><p className="mt-2 text-xl font-extrabold">{soles(value)}</p></div>}
