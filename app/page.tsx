import type {Metadata} from 'next'
import Link from 'next/link'
import {ArrowRight, Building2, CalendarCheck, ClipboardList, Mail, Play, ReceiptText, ShieldCheck, Users, WalletCards} from 'lucide-react'
import {CobranzaPreview} from '@/components/marketing/CobranzaPreview'
import {ProspectForm} from '@/components/marketing/ProspectForm'

const description='Administra edificios y condominios en Perú con CondominPro. Revisa recibos y pagos de mantenimiento, organiza unidades y prueba la demo sin registro.'

export const metadata:Metadata={
  description,
  alternates:{canonical:'/'},
}

const softwareStructuredData={
  '@context':'https://schema.org',
  '@type':'SoftwareApplication',
  name:'CondominPro',
  url:'https://condominpro.com',
  description,
  applicationCategory:'BusinessApplication',
  operatingSystem:'Web',
  inLanguage:'es-PE',
}

const pasos=[
  {Icon:ReceiptText,titulo:'Emite recibos por unidad',detalle:'Registra las cuotas de mantenimiento con su periodo e importe.'},
  {Icon:ShieldCheck,titulo:'Revisa los pagos reportados',detalle:'Consulta el importe y la referencia antes de validar cada operación.'},
  {Icon:WalletCards,titulo:'Consulta lo que queda por cobrar',detalle:'Revisa el saldo de cada recibo después de descontar los pagos validados.'},
]

const operacion=[
  {Icon:Users,titulo:'Residentes y unidades',detalle:'Consulta propietarios, residentes, estacionamientos y depósitos.'},
  {Icon:CalendarCheck,titulo:'Mantenimiento',detalle:'Organiza las actividades del condominio y da seguimiento a sus tareas.'},
  {Icon:Mail,titulo:'Comunicados',detalle:'Reúne los avisos de la administración en un solo lugar.'},
]

export default function HomePage(){
  return <main className="min-h-screen bg-[#f8f6fd] text-[#231a39]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(softwareStructuredData).replace(/</g,'\\u003c')}}/>
    <header className="sticky top-0 z-40 border-b border-[#e7e1f2] bg-[#f8f6fd]/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 whitespace-nowrap text-base font-extrabold tracking-tight sm:text-xl">
          <span className="grid size-8 place-items-center rounded-lg bg-[#2d2050] text-[#dcccff] sm:size-9"><Building2 size={19} aria-hidden="true"/></span>
          CondominPro
        </Link>
        <nav aria-label="Navegación principal" className="hidden items-center gap-7 text-sm font-semibold text-[#55466c] lg:flex">
          <a href="#beneficios" className="hover:text-[#5939c6]">Cobranzas</a>
          <a href="#modulos" className="hover:text-[#5939c6]">Operación</a>
          <Link href="/demo" className="hover:text-[#5939c6]">Demo</Link>
        </nav>
        <div className="flex items-center gap-2 text-xs font-semibold sm:gap-4 sm:text-sm">
          <Link href="/login" className="rounded-lg px-2 py-2 hover:bg-[#eee9f8]">Ingresar</Link>
          <a href="#contacto" className="rounded-lg bg-[#5636bd] px-3 py-2.5 text-white hover:bg-[#492ba5] sm:px-4">Solicitar demo</a>
        </div>
      </div>
    </header>

    <section className="bg-[radial-gradient(ellipse_at_92%_12%,#e7ddff,transparent_56%),radial-gradient(ellipse_at_15%_95%,#efe7fe,transparent_42%)]">
      <div className="mx-auto grid max-w-7xl items-center gap-9 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[.95fr_1.05fr] lg:gap-14 lg:py-20">
        <div>
          <p className="text-sm font-bold text-[#5636bd]">Software para edificios y condominios en Perú</p>
          <h1 className="mt-4 max-w-xl text-[clamp(2.4rem,5.1vw,4.5rem)] font-extrabold leading-[1.05] tracking-[-.055em]">
            Cierra la cobranza del mes <span className="text-[#5636bd]">con claridad</span>
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#55466c] sm:text-lg sm:leading-8">
            Emite recibos, valida pagos de mantenimiento y revisa qué queda por cobrar. Organiza residentes, unidades e incidencias desde el mismo panel.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5636bd] px-5 py-3.5 text-sm font-bold text-white shadow-md shadow-violet-900/20 hover:bg-[#492ba5]"><Play size={16} aria-hidden="true"/> Probar demo sin registro</Link>
            <a href="#contacto" className="inline-flex items-center gap-2 rounded-xl border border-[#c9bade] bg-white/70 px-5 py-3.5 text-sm font-bold hover:bg-white">Hablar con nosotros <ArrowRight size={16} aria-hidden="true"/></a>
          </div>
        </div>
        <CobranzaPreview/>
      </div>
    </section>

    <section id="beneficios" className="scroll-mt-20 border-y border-[#e7e1f2] bg-white">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-18">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Del recibo al saldo pendiente</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {pasos.map(({Icon,titulo,detalle})=><article key={titulo} className="rounded-2xl border border-[#e7e1f2] bg-[#faf8ff] p-5 sm:p-6">
            <Icon size={23} className="text-[#5636bd]" aria-hidden="true"/>
            <h3 className="mt-4 text-lg font-bold">{titulo}</h3>
            <p className="mt-2 text-sm leading-6 text-[#55466c]">{detalle}</p>
          </article>)}
        </div>
      </div>
    </section>

    <section id="modulos" className="mx-auto max-w-7xl scroll-mt-20 px-5 py-14 sm:px-8 sm:py-18">
      <div className="grid gap-8 lg:grid-cols-[.85fr_1.15fr] lg:items-start">
        <div>
          <h2 className="max-w-md text-3xl font-extrabold tracking-tight sm:text-4xl">Organiza el día a día del condominio</h2>
          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-[#5636bd]">
            <Link href="/gestion-edificios-residenciales" className="underline underline-offset-4">Edificios residenciales</Link>
            <Link href="/software-administracion-condominios" className="underline underline-offset-4">Administradoras y condominios</Link>
          </div>
        </div>
        <div className="divide-y divide-[#e7e1f2] rounded-2xl border border-[#e7e1f2] bg-white px-5">
          {operacion.map(({Icon,titulo,detalle})=><div key={titulo} className="flex items-start gap-3 py-4">
            <Icon size={20} className="mt-0.5 shrink-0 text-[#5636bd]" aria-hidden="true"/>
            <div><h3 className="font-bold">{titulo}</h3><p className="mt-1 text-sm leading-6 text-[#55466c]">{detalle}</p></div>
          </div>)}
        </div>
      </div>
    </section>

    <section id="contacto" className="scroll-mt-20 bg-[#2d2050] text-white">
      <div className="mx-auto grid max-w-7xl items-start gap-8 px-5 py-14 sm:px-8 sm:py-18 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <ClipboardList size={30} className="text-[#cebaff]" aria-hidden="true"/>
          <h2 className="mt-4 max-w-lg text-3xl font-extrabold tracking-tight sm:text-4xl">Veamos cómo administras hoy tu condominio</h2>
          <p className="mt-4 max-w-md leading-7 text-[#e4d9fa]">Cuéntanos cuántas unidades gestionas y cómo registras los pagos. En una demo guiada podemos recorrer el proceso que más tiempo te toma.</p>
        </div>
        <div className="min-w-0 rounded-2xl bg-white p-5 text-[#231a39] sm:p-7">
          <h3 className="text-xl font-bold">Solicitar una demo guiada</h3>
          <ProspectForm/>
        </div>
      </div>
    </section>

    <footer className="border-t border-[#e7e1f2] bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-4 px-5 py-6 text-sm text-[#55466c] sm:px-8">
        <p>© {new Date().getFullYear()} CondominPro</p>
        <div className="flex flex-wrap gap-4"><Link href="/demo" className="hover:underline">Demo pública</Link><Link href="/login" className="hover:underline">Acceso a clientes</Link></div>
      </div>
    </footer>
  </main>
}
