'use client'
import {useState} from 'react'
import Link from 'next/link'
import {Building2,Users,Wallet,ClipboardList,ChartColumn,ArrowRight,ShieldCheck} from 'lucide-react'
const sections=[
 {id:'dashboard',name:'Dashboard',Icon:ChartColumn},
 {id:'residentes',name:'Residentes',Icon:Users},
 {id:'finanzas',name:'Finanzas',Icon:Wallet},
 {id:'operaciones',name:'Operaciones',Icon:ClipboardList},
] as const
const cards=[
 {title:'Inmuebles registrados',value:'128',detail:'Unidades en la comunidad'},
 {title:'Recibos pendientes',value:'18',detail:'Pendientes de regularización'},
 {title:'Pagos validados del mes',value:'94',detail:'Operaciones conciliadas'},
 {title:'Incidencias abiertas',value:'6',detail:'Solicitudes en seguimiento'},
]
export default function PublicDemo(){
 const [section,setSection]=useState<(typeof sections)[number]['id']>('dashboard')
 return <main className="min-h-screen bg-[#f1f6fc] text-slate-900">
  <header className="border-b bg-white"><div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-6 py-4"><Link href="/" className="inline-flex items-center gap-2 font-extrabold text-[#173c65]"><Building2 size={24}/> Condomin-Pro</Link><div className="flex gap-3"><Link className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700" href="/">Volver al inicio</Link><Link className="rounded-xl bg-[#1f4b7a] px-4 py-2 text-sm font-bold text-white" href="/#contacto">Solicitar información</Link></div></div></header>
  <div className="mx-auto max-w-7xl space-y-7 px-6 py-9">
   <section className="rounded-[28px] bg-gradient-to-r from-[#102d50] to-[#126284] p-8 text-white md:p-10"><span className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Demostración abierta · Sin registro</span><h1 className="mt-3 text-3xl font-extrabold md:text-4xl">Explora el dashboard de Condomin-Pro</h1><p className="mt-3 max-w-2xl text-blue-100">Conoce cómo se visualizan los residentes, las finanzas y las operaciones de un condominio. No necesitas crear una cuenta.</p><div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white/15 px-4 py-2 text-sm font-bold"><ShieldCheck size={17}/> Datos ilustrativos · No corresponden a clientes reales</div></section>
   <div className="grid gap-6 lg:grid-cols-[230px_1fr]">
    <nav aria-label="Secciones de la demo" className="flex flex-wrap gap-2 self-start rounded-2xl border bg-white p-3 lg:flex-col">{sections.map(x=><button key={x.id} onClick={()=>setSection(x.id)} aria-pressed={section===x.id} className={'flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition '+(section===x.id?'bg-[#1f4b7a] text-white':'text-slate-700 hover:bg-slate-100')}><x.Icon size={18}/>{x.name}</button>)}</nav>
    <div className="space-y-5">
    {section==='dashboard'?<><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(c=><div key={c.title} className="rounded-2xl border bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{c.title}</p><p className="mt-3 text-4xl font-extrabold text-[#173c65]">{c.value}</p><p className="mt-2 text-xs text-slate-400">{c.detail}</p></div>)}</div><section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Actividad financiera ilustrativa</h2><p className="mt-1 text-sm text-slate-500">Ejemplo de recaudación mensual, expresada en soles</p><div className="mt-7 grid grid-cols-6 items-end gap-3" style={{height:180}}>{[48,65,55,78,72,93].map((v,i)=><div key={i} className="flex h-full flex-col justify-end gap-2"><div className="rounded-t-lg bg-sky-700" style={{height:v+'%'}}/><span className="text-center text-xs text-slate-500">{['May','Jun','Jul','Ago','Sep','Oct'][i]}</span></div>)}</div></section></>:null}
    {section==='residentes'?<section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Gestión de residentes y unidades</h2><p className="mt-2 text-sm text-slate-500">Vista de ejemplo del inventario residencial.</p><div className="mt-5 grid gap-3 sm:grid-cols-3">{[['Unidades','128'],['Ocupadas','113'],['Disponibles','15']].map(x=><div key={x[0]} className="rounded-xl bg-sky-50 p-5"><p className="text-sm text-slate-600">{x[0]}</p><strong className="text-3xl text-sky-900">{x[1]}</strong></div>)}</div><p className="mt-5 rounded-lg border border-dashed p-4 text-sm text-slate-500">La aplicación real permite gestionar fichas, residentes y propiedades. Esta vista pública es demostrativa y no guarda información.</p></section>:null}
    {section==='finanzas'?<section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Resumen financiero</h2><p className="mt-2 text-sm text-slate-500">Ejemplo de indicadores de recibos y pagos.</p><div className="mt-5 grid gap-3 sm:grid-cols-2">{[['Recibos emitidos','128'],['Pagos validados','94'],['Pendientes','18'],['Vencidos','7']].map(x=><div key={x[0]} className="rounded-xl bg-sky-50 p-5"><p className="text-sm text-slate-600">{x[0]}</p><strong className="text-3xl text-sky-900">{x[1]}</strong></div>)}</div><p className="mt-5 text-xs text-slate-500">Cifras ilustrativas; no muestran saldos ni transacciones reales.</p></section>:null}
    {section==='operaciones'?<section className="rounded-2xl border bg-white p-6"><h2 className="text-xl font-bold">Centro de operaciones</h2><p className="mt-2 text-sm text-slate-500">Organiza mantenimiento, incidencias y actividades.</p><div className="mt-5 space-y-3">{[['Revisión de bombas','Programada'],['Inspección de áreas comunes','En curso'],['Solicitud de mantenimiento','Pendiente']].map(x=><div key={x[0]} className="flex justify-between gap-4 rounded-xl border p-4 text-sm"><span className="font-semibold">{x[0]}</span><span className="text-sky-700">{x[1]}</span></div>)}</div><p className="mt-4 text-xs text-slate-500">Tareas demostrativas. No generan tickets ni cambios en la base de datos.</p></section>:null}
    </div>
   </div>
   <section className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#102d50] p-7 text-white"><div><h2 className="text-2xl font-bold">¿Quieres verlo aplicado a tu condominio?</h2><p className="mt-2 text-sm text-blue-100">Solicita una demostración personalizada y conoce los módulos disponibles.</p></div><Link href="/#contacto" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-5 py-3 font-extrabold text-[#102d50]">Contactar al equipo <ArrowRight size={18}/></Link></section>
  </div>
 </main>
}