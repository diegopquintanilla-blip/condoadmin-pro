'use client'
import {useMemo,useState} from 'react'
import {ShieldAlert,Calculator} from 'lucide-react'
const fmt=(n:number)=>new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'}).format(n)
const round=(n:number)=>Math.round((n+Number.EPSILON)*100)/100
function safe(input:string){const n=Number(input);return Number.isFinite(n)?Math.max(0,Math.min(n,10000000)):0}
export function StatutoryContributionsPreview(){
 const [base,setBase]=useState('1500')
 const [pension,setPension]=useState('onp')
 const [afpFund,setAfpFund]=useState('10')
 const [afpInsurance,setAfpInsurance]=useState('1.37')
 const [afpFee,setAfpFee]=useState('1.47')
 const [insuranceCap,setInsuranceCap]=useState('12732.70')
 const [essaludBase,setEssaludBase]=useState('')
 const figures=useMemo(()=>{
  const salary=safe(base)
  const onp=pension==='onp'?round(salary*.13):0
  const afp=pension==='afp'?round(salary*safe(afpFund)/100+Math.min(salary,safe(insuranceCap))*safe(afpInsurance)/100+salary*safe(afpFee)/100):0
  const employer=round(Math.max(salary,safe(essaludBase))*0.09)
  return {salary,onp,afp,employer,net:round(Math.max(0,salary-onp-afp)),cost:round(salary+employer)}
 },[base,pension,afpFund,afpInsurance,afpFee,insuranceCap,essaludBase])
 return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
  <div className="flex items-center gap-2"><Calculator className="text-sky-700"/><h2 className="text-xl font-extrabold">Preliquidación de aportes laborales</h2></div>
  <p className="mt-2 text-sm text-slate-600">Vista referencial para régimen laboral común de trabajadores dependientes. No se guardan ni pagan aportes.</p>
  <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
  <label className="text-sm font-semibold">Remuneración afecta a aportes (S/)<input type="number" min="0" step=".01" value={base} onChange={e=>setBase(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label>
  <label className="text-sm font-semibold">Sistema de pensiones<select value={pension} onChange={e=>setPension(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="onp">ONP / SNP</option><option value="afp">AFP / SPP (verificar afiliación y comisión)</option><option value="none">Sin descuento configurado (requiere justificación)</option></select></label>
  <label className="text-sm font-semibold">Base mínima asegurable EsSalud (S/)<input type="number" min="0" step=".01" value={essaludBase} onChange={e=>setEssaludBase(e.target.value)} placeholder="Configurar según RMV aplicable" className="mt-2 w-full rounded-xl border p-3"/></label>
  {pension==='afp'?<><label className="text-sm font-semibold">Aporte al fondo AFP (%)<input type="number" min="0" max="100" step=".01" value={afpFund} onChange={e=>setAfpFund(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Prima de seguro (%)<input type="number" min="0" max="100" step=".01" value={afpInsurance} onChange={e=>setAfpInsurance(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Comisión sobre flujo (%)<input type="number" min="0" max="100" step=".01" value={afpFee} onChange={e=>setAfpFee(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Tope asegurable del mes (S/)<input type="number" min="0" step=".01" value={insuranceCap} onChange={e=>setInsuranceCap(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label></>:null}
  </div>
  <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[['Aporte del trabajador',figures.onp+figures.afp],['EsSalud: costo empleador',figures.employer],['Neto parcial estimado',figures.net],['Costo laboral parcial',figures.cost]].map(([title,value])=><div key={String(title)} className="rounded-xl bg-slate-100 p-4"><p className="text-xs text-slate-600">{title}</p><p className="mt-2 text-xl font-extrabold">{fmt(Number(value))}</p></div>)}</div>
  <p className="mt-4 flex gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-950"><ShieldAlert className="mt-0.5 shrink-0"/> Preliquidación incompleta, no apta para pago: la base mínima EsSalud debe verificarse, las tasas AFP dependen de administradora y modalidad, y la retención de quinta categoría requiere proyección anual. Tampoco incluye CTS, gratificaciones, vacaciones, asignación familiar ni regímenes especiales. Los parámetros AFP mostrados son ejemplos editables y deben confirmarse para el mes aplicable.</p>
 </section>
}
