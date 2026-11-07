import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, CheckCircle2, ClipboardList, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: "Software para administrar condominios en Perú",
  description: "Conoce CondominPro: una plataforma para organizar inmuebles, residentes, recibos, incidencias y comunicación de condominios. Explora la demo sin registro.",
  alternates: { canonical: '/software-administracion-condominios' },
  openGraph: {
    title: "Software para administrar condominios en Perú",
    description: "Conoce CondominPro: una plataforma para organizar inmuebles, residentes, recibos, incidencias y comunicación de condominios. Explora la demo sin registro.",
    url: 'https://condominpro.com/software-administracion-condominios',
    type: 'website',
  },
}

const benefits = [["Información organizada","Consulta los datos de unidades inmobiliarias, residentes y propietarios en una misma plataforma."],["Seguimiento administrativo","Centraliza incidencias, mantenimiento y registros de pagos reportados."],["Comunicación","Organiza comunicados y documentación para facilitar la gestión diaria."]]
const questions = [["¿Puedo conocer la plataforma antes de contratar?","Sí. Nuestra demostración pública permite explorar un ejemplo del dashboard sin crear una cuenta."],["¿Es una solución para un solo condominio?","La plataforma está orientada a la administración por condominio y a la organización de sus registros."],["¿Cómo solicito una cotización?","Desde el formulario de contacto de la portada puedes enviar una solicitud para revisar tus necesidades."]]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <nav aria-label="Navegación principal" className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
          <Link href="/" className="inline-flex items-center gap-2 font-extrabold text-[#1f4b7a]"><Building2 aria-hidden="true" size={25}/> CondominPro</Link>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold"><Link href="/demo" className="text-[#1f4b7a] hover:underline">Ver demo</Link><Link href="/#contacto" className="rounded-xl bg-[#1f4b7a] px-4 py-2 text-white hover:bg-[#173a60]">Solicitar información</Link></div>
        </nav>
      </header>
      <section className="bg-[#0b2446] px-6 py-20 text-white">
        <div className="mx-auto max-w-6xl">
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-cyan-300">Para administradoras y juntas de propietarios</p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">Software para administración de condominios en Perú</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">Centraliza la información de inmuebles, residentes y operaciones para que tu equipo administre el condominio con procesos más claros.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/demo" className="inline-flex items-center gap-2 rounded-xl bg-cyan-300 px-6 py-3 font-bold text-[#092440] hover:bg-cyan-200">Probar demo sin registro <ArrowRight size={18}/></Link>
            <Link href="/#contacto" className="rounded-xl border border-white/40 px-6 py-3 font-bold text-white hover:bg-white/10">Solicitar una cotización</Link>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-3xl font-bold">¿Cómo ayuda CondominPro a tu administración?</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {benefits.map(([title, description], index) => (
            <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-[#1f4b7a]">{index === 0 ? <Users/> : index === 1 ? <ClipboardList/> : <CheckCircle2/>}</div>
              <h3 className="text-xl font-bold">{title}</h3>
              <p className="mt-3 leading-7 text-slate-600">{description}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <h2 className="text-3xl font-bold">Preguntas frecuentes</h2>
          <div className="mt-8 grid gap-4">
            {questions.map(([question, answer]) => (
              <article key={question} className="rounded-xl border border-slate-200 p-5">
                <h3 className="text-lg font-bold">{question}</h3>
                <p className="mt-2 leading-7 text-slate-600">{answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">Conoce la plataforma antes de decidir</h2>
        <p className="mx-auto mt-4 max-w-2xl text-slate-600">Explora el dashboard de demostración y consulta qué módulos se ajustan a tu comunidad.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/demo" className="rounded-xl bg-[#1f4b7a] px-6 py-3 font-bold text-white">Explorar demo</Link>
          <Link href="/#contacto" className="rounded-xl border border-slate-300 bg-white px-6 py-3 font-bold text-[#1f4b7a]">Contactar</Link>
        </div>
        <p className="mt-10 text-sm text-slate-500"><Link href="/" className="hover:underline">Inicio</Link> · <Link href="/software-administracion-condominios" className="hover:underline">Software para condominios</Link> · <Link href="/gestion-edificios-residenciales" className="hover:underline">Gestión de edificios</Link></p>
      </section>
    </main>
  )
}
