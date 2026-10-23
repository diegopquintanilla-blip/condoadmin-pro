import Link from 'next/link'
import {notFound} from 'next/navigation'
import {moduleNames} from '@/components/CondoShell'
export default async function ModuloPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params
 const found=moduleNames.find(x=>x.slug===slug)
 if(!found)notFound()
 return <main className="mx-auto max-w-5xl"><div className="rounded-xl border border-slate-200 bg-white p-7 shadow-sm"><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Módulo de CondoAdmin Pro</p><h1 className="mt-2 text-2xl font-bold">{found.name}</h1><p className="mt-4 text-slate-600">Este módulo está incorporado a la navegación. Sus operaciones y datos estarán disponibles tras implementar y validar sus permisos y funcionalidades. No se muestran registros simulados.</p><Link href="/dashboard" className="mt-6 inline-block rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white">Volver al dashboard</Link></div></main>
}
