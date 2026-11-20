import Link from 'next/link'
import {redirect} from 'next/navigation'
import {ArrowLeft,Download} from 'lucide-react'
import {cargarCierre,indicadores,tramos} from '@/lib/finanzas/cierre'

const soles=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'})

export default async function CierrePage({searchParams}:{
 searchParams:Promise<{condominio?:string;periodo?:string}>
}){
 const {condominio,periodo}=await searchParams
 const result=await cargarCierre(
  typeof condominio==='string'?condominio:null,
  typeof periodo==='string'?periodo:null,
 )
 if(result.status===401)redirect('/login')
 const volver='/finanzas?'+new URLSearchParams({condominio:condominio??'',periodo:periodo??''})
 if(result.status!==200)return <main className="mx-auto max-w-4xl rounded-2xl border border-slate-200 bg-white p-6">
  <h1 className="text-xl font-bold">Cierre de cobranza</h1>
  <p role="alert" className="mt-3 text-slate-700">{result.status===403?'Tu cuenta no tiene permiso para consultar el cierre de este condominio.':result.status===400?'Selecciona un condominio y un periodo vigente o anterior desde Finanzas.':'No pudimos cargar el cierre. Inténtalo de nuevo desde Finanzas.'}</p>
  <Link href={volver} className="mt-4 inline-block font-semibold text-sky-800 underline">Volver a Finanzas</Link>
 </main>
 const {data,nombre}=result
 const enlace='/finanzas/cierre/exportar?'+new URLSearchParams({condominio:result.condominio,periodo:result.periodo})
 return <main className="mx-auto max-w-7xl space-y-6">
  <header className="rounded-3xl bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-6 text-white sm:p-8">
   <Link href={volver} className="inline-flex items-center gap-2 text-sm text-sky-100"><ArrowLeft size={16} aria-hidden="true"/> Finanzas</Link>
   <h1 className="mt-4 text-3xl font-extrabold">Cierre mensual de cobranza</h1>
   <p className="mt-2 text-sm text-sky-100">{nombre} · {result.periodo} · Corte {data.corte}</p>
  </header>
  <section className="space-y-4" aria-labelledby="resumen-cierre">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <h2 id="resumen-cierre" className="text-xl font-bold">Resumen para la junta</h2>
    <a href={enlace} className="inline-flex items-center gap-2 rounded-xl bg-sky-800 px-4 py-2 font-semibold text-white"><Download size={17} aria-hidden="true"/> Descargar CSV</a>
   </div>
   <dl className="grid grid-cols-2 gap-3 lg:grid-cols-5">{indicadores.map(([key,label])=><div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-1 text-xl font-bold tabular-nums">{soles.format(data[key])}</dd></div>)}</dl>
   <p className="rounded-xl bg-slate-100 p-3 text-sm text-slate-700">El reporte cruza recibos y pagos registrados según su fecha. Usa el estado de validación actual y puede variar con correcciones posteriores. El cotejo contra el extracto bancario se realiza por separado.</p>
  </section>
  <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
   <h2 className="text-lg font-bold">Antigüedad de la deuda vencida</h2>
   <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">{tramos.map((label,i)=><div key={label} className="rounded-xl bg-slate-50 p-3"><dt className="text-sm text-slate-600">{label}</dt><dd className="font-bold">{soles.format(data.tramos[i])}</dd></div>)}</dl>
  </section>
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
   <h2 className="p-5 text-lg font-bold">Recibos incluidos · {data.recibos.length}</h2>
   {data.recibos.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm">
    <thead className="bg-slate-50"><tr>{['Recibo','Unidad','Periodo','Vencimiento','Saldo anterior','Abonos al corte','Saldo al corte'].map(label=><th key={label} scope="col" className="p-3">{label}</th>)}</tr></thead>
    <tbody>{data.recibos.slice(0,25).map(r=><tr key={r.id} className="border-t border-slate-100"><th scope="row" className="p-3 font-semibold">{r.codigo??'—'}</th><td className="p-3">{r.unidad??'—'}</td><td className="p-3">{r.periodo??'—'}</td><td className="p-3">{r.fecha_vencimiento??'—'}</td><td className="p-3">{soles.format(r.saldo_inicial)}</td><td className="p-3">{soles.format(r.aplicado)}</td><td className="p-3 font-semibold">{soles.format(r.saldo)}</td></tr>)}</tbody>
   </table></div>:<p className="px-5 pb-5 text-sm text-slate-600">No hay recibos incluidos en este corte.</p>}
   {data.recibos.length>25&&<p className="p-5 text-sm text-slate-600">Vista previa de 25 recibos. El CSV incluye el detalle completo.</p>}
  </section>
 </main>
}
