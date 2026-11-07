import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Building2, CheckCircle2, ClipboardList, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: "Gestión de edificios residenciales | CondominPro Perú",
  description: "Organiza residentes, unidades, pagos de mantenimiento, incidencias y comunicados de edificios residenciales con CondominPro. Descubre la demo.",
  alternates: { canonical: '/gestion-edificios-residenciales' },
  openGraph: {
    title: "Gestión de edificios residenciales | CondominPro Perú",
    description: "Organiza residentes, unidades, pagos de mantenimiento, incidencias y comunicados de edificios residenciales con CondominPro. Descubre la demo.",
    url: 'https://condominpro.com/gestion-edificios-residenciales',
    type: 'website',
  },
}

const benefits = [["Residentes y unidades","Mantén la información de unidades inmobiliarias y residentes en registros estructurados."],["Mantenimiento y finanzas","Da seguimiento a recibos, pagos reportados e incidencias administrativas desde los módulos correspondientes."],["Comunicados y trazabilidad","Utiliza los registros y herramientas de comunicación para una gestión mejor documentada."]]
const questions = [["¿Necesito instalar un programa en cada computadora?","La plataforma se utiliza desde el navegador web con una cuenta autorizada."],["¿La demo contiene datos reales?","No. La demostración pública utiliza información ilustrativa y no requiere registro."],["¿Se puede solicitar una presentación?","Sí. Puedes enviar tu consulta desde el formulario de contacto de la página principal."]]

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
          <p className="mb-4 text-sm font-bold uppercase tracking-widest text-cyan-300">Diseñado para administradores y juntas directivas</p>
          <h1 className="max-w-4xl text-4xl font-extrabold leading-tight md:text-5xl">Gestión inteligente de edificios residenciales</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-100">Una herramienta web para mantener organizada la operación administrativa de edificios, condominios y comunidades residenciales.</p>
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
