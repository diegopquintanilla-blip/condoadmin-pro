import Link from 'next/link'
import {cookies} from 'next/headers'
import {Building2,CheckCircle2,Mail} from 'lucide-react'

export default async function ActivacionPage(){
 const confirmado=(await cookies()).get('condomin_activacion')?.value==='confirmada'
 const Icon=confirmado?CheckCircle2:Mail
 return <main className="grid min-h-screen place-items-center bg-[#f2f6fb] p-5">
  <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
   <p className="flex items-center gap-2 text-sm font-bold text-sky-900"><Building2 size={18} aria-hidden="true"/> Condomin-Pro</p>
   <Icon size={32} className={confirmado?'mt-6 text-emerald-700':'mt-6 text-sky-800'} aria-hidden="true"/>
   <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950">{confirmado?'Su cuenta ha sido activada con éxito':'No pudimos confirmar el enlace'}</h1>
   <p className="mt-3 leading-7 text-slate-600">{confirmado
    ?'Su correo electrónico ha sido verificado. Ya puede iniciar sesión con su cuenta para acceder a CondominPro.'
    :'Si ya verificó su correo, puede iniciar sesión. Si aún no lo ha verificado, vuelva a abrir el enlace más reciente en el navegador donde inició el registro.'}</p>
   <Link href="/login" className="mt-6 inline-block rounded-xl bg-[#0c4678] px-5 py-3 font-bold text-white hover:bg-sky-800">Iniciar sesión</Link>
  </section>
 </main>
}
