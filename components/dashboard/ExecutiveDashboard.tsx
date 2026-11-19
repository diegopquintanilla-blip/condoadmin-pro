import Link from 'next/link'
import {Building2,Receipt,Clock3,Wallet,CheckCircle2,AlertTriangle,Users,Layers3,ClipboardList,ChartColumn,ArrowUpRight} from 'lucide-react'
type Props={overview?:Record<string,unknown>;history?:Record<string,unknown>[];configured?:boolean;condominio?:string}
const stats=[
{key:'inmuebles_total',label:'Inmuebles',Icon:Building2,tone:'bg-blue-50 text-blue-700'},
{key:'recibos_pendientes',label:'Recibos pendientes',Icon:Receipt,tone:'bg-amber-50 text-amber-700'},
{key:'recibos_vencidos',label:'Recibos vencidos',Icon:Clock3,tone:'bg-rose-50 text-rose-700'},
{key:'monto_recibos_pendientes',label:'Monto pendiente',Icon:Wallet,tone:'bg-violet-50 text-violet-700'},
{key:'pagos_validados_mes',label:'Pagos validados del mes',Icon:CheckCircle2,tone:'bg-emerald-50 text-emerald-700'},
{key:'incidencias_abiertas',label:'Incidencias abiertas',Icon:AlertTriangle,tone:'bg-orange-50 text-orange-700'}
] as const
const shortcuts=[{name:'Bloques inmobiliarios',href:'/bloques-inmobiliarios',Icon:Building2},{name:'Residentes',href:'/residentes',Icon:Users},{name:'Etapas',href:'/etapas',Icon:Layers3},{name:'Tareas',href:'/operaciones/tareas',Icon:ClipboardList},{name:'Finanzas',href:'/finanzas',Icon:Wallet},{name:'Reportes',href:'/reportes',Icon:ChartColumn}]
function val(value:unknown,configured:boolean){if(!configured)return '—';if(value===null||value===undefined)return '—';return typeof value==='number'?value.toLocaleString('es-PE'):String(value)}
export function ExecutiveDashboard({overview={},history=[],configured=true,condominio}:Props){
 const meses=configured?history.slice(-6).map((fila)=>({
  mes:String(fila.mes??''),
  monto:Number(fila.recaudacion_validada)||0,
 })):[]
 const hayRecaudacion=meses.some(m=>m.monto>0)
 const maximo=Math.max(1,...meses.map(m=>m.monto))
 const soles=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'})
 const finanzas=condominio?'/finanzas?condominio='+encodeURIComponent(condominio):'/finanzas'
 return <div className="space-y-7">
 <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="seguimiento-financiero">
  <div className="flex flex-wrap items-start justify-between gap-3">
   <div><h2 id="seguimiento-financiero" className="text-xl font-extrabold tracking-tight text-slate-950 sm:text-2xl">Seguimiento de recaudación</h2><p className="mt-1 text-sm text-slate-600">Pagos validados por mes · Últimos 6 meses</p></div>
   {condominio&&<Link href={finanzas} className="inline-flex items-center gap-2 rounded-xl border border-sky-200 px-4 py-2 text-sm font-bold text-sky-900 hover:bg-sky-50">Ver finanzas <ArrowUpRight size={16} aria-hidden="true"/></Link>}
  </div>
  {hayRecaudacion?<ul className="mt-6 space-y-3">
   {meses.map(({mes,monto},i)=><li key={mes+'-'+i} className="grid grid-cols-[minmax(4rem,6rem)_1fr_auto] items-center gap-3 text-sm">
    <span className="text-slate-700">{mes.slice(0,7)}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100" aria-hidden="true"><div className="h-full rounded-full bg-gradient-to-r from-[#0a4879] to-[#1581a8]" style={{width:Math.max(0,monto)/maximo*100+'%'}}/></div><strong className="text-slate-900 tabular-nums">{soles.format(monto)}</strong>
   </li>)}
  </ul>:<div className="mt-5 rounded-xl border border-dashed border-sky-200 bg-sky-50 p-4 text-sm text-slate-700">
   {configured?'Aún no hay pagos validados en este periodo. La gráfica se actualizará cuando se valide el primer pago.':'Los indicadores estarán disponibles cuando se pueda consultar el condominio.'}
  </div>}
 </section>
 <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{stats.map(({key,label,Icon,tone})=><section key={key} className="group relative overflow-hidden rounded-[22px] border border-slate-200/75 bg-white p-6 shadow-[0_12px_36px_-27px_rgba(8,40,75,.32)] transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-slate-500">{label}</p><strong className="mt-4 block text-4xl font-extrabold tracking-tight text-slate-950">{val(overview[key],configured)}</strong></div><span className={`rounded-xl p-3 ${tone}`}><Icon size={23}/></span></div><p className="mt-5 border-t border-slate-100 pt-3 text-xs font-medium text-slate-400">Información del condominio autorizado</p></section>)}</div>
 <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_16px_40px_-30px_rgba(15,23,42,.28)]"><div className="mb-5 flex items-center justify-between"><div><h2 className="text-lg font-bold">Accesos rápidos</h2><p className="text-sm text-slate-500">Gestión y operación del condominio</p></div></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{shortcuts.map(({name,href,Icon})=><Link key={href} href={href} className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-50 hover:shadow-md"><span className="flex items-center gap-3 text-sm font-semibold"><Icon size={19} className="text-sky-700"/>{name}</span><ArrowUpRight size={16} className="text-slate-400 group-hover:text-sky-700"/></Link>)}</div></section>
 <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-bold">Histórico financiero</h2><p className="mb-5 text-sm text-slate-500">Recaudación y recibos por mes</p>{!configured||history.length===0?<div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">Aún no hay información financiera disponible.</div>:<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-600"><tr><th className="p-3">Mes</th><th className="p-3">Recaudación validada</th><th className="p-3">Recibos emitidos</th></tr></thead><tbody>{history.map((h,i)=><tr key={i} className="border-t"><td className="p-3">{val(h.mes,true)}</td><td className="p-3">{val(h.recaudacion_validada,true)}</td><td className="p-3">{val(h.recibos_emitidos,true)}</td></tr>)}</tbody></table></div>}</section>
 </div>
}
