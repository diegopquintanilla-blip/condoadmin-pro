import {ProspectForm} from '@/components/marketing/ProspectForm'
import Link from 'next/link'
import {
  ArrowRight,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  FileText,
  LockKeyhole,
  Mail,
  MessageSquareWarning,
  Phone,
  ShieldCheck,
  Users,
  WalletCards,
} from 'lucide-react'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f8fb] text-[#152033]">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f4b7a] text-white shadow-sm">
              <Building2 className="h-7 w-7" />
            </div>

            <div>
              <p className="text-lg font-bold leading-tight text-slate-900">
                Condomin-Pro
              </p>
              <p className="text-sm text-slate-500">
                Gestión inteligente de condominios
              </p>
            </div>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 lg:flex">
            <a href="#beneficios" className="transition hover:text-[#1f4b7a]">
              Beneficios
            </a>
            <a href="#modulos" className="transition hover:text-[#1f4b7a]">
              Módulos
            </a>
            <Link href="/demo" className="transition hover:text-[#1f4b7a]">Demo 7 días</Link>
            <a href="#contacto" className="transition hover:text-[#1f4b7a]">
              Contacto
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:inline-flex"
            >
              Iniciar sesión
            </Link>

            <Link
              href="/login"
              className="rounded-xl bg-[#1f4b7a] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#173a60]"
            >
              Acceder
            </Link>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden bg-[#071a32] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_75%_5%,rgba(24,156,191,.28),transparent_52%),radial-gradient(ellipse_at_2%_75%,rgba(28,87,162,.25),transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.7)_1px,transparent_1px)] [background-size:52px_52px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-20 lg:grid-cols-[1.02fr_1fr] lg:gap-14 lg:py-24">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-cyan-300/25 bg-cyan-200/10 px-4 py-2 text-xs font-bold uppercase tracking-[.13em] text-cyan-200">
              <ShieldCheck className="h-4 w-4" /> Tecnología para comunidades mejor gestionadas
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold leading-[1.13] tracking-tight sm:text-5xl lg:text-[3.65rem]">
              Toda la gestión de tu condominio. <span className="text-cyan-300">En un solo lugar.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Centraliza inmuebles, residentes, recibos, incidencias y comunicados. Una experiencia más ordenada para administradoras, juntas directivas y comunidades residenciales.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3.5 text-sm font-extrabold text-[#071a32] shadow-lg shadow-cyan-950/20 transition hover:bg-cyan-300">
                Prueba gratis por 7 días <ArrowRight className="h-4 w-4"/>
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white transition hover:bg-white/20">
                Acceso a clientes
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/15 pt-6 text-sm text-slate-300">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300"/> Gestión por condominio</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300"/> Accesos por roles</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-cyan-300"/> Información centralizada</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 rounded-[2.5rem] bg-cyan-300/10 blur-3xl" aria-hidden="true"/>
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[#102943] shadow-2xl shadow-black/40">
              <div className="relative h-44 sm:h-56">
                <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"linear-gradient(180deg,rgba(5,21,43,.05),rgba(5,21,43,.75)),url('https://unsplash.com/photos/TJsf1pMigZM/download?force=true&w=1800')"}} role="img" aria-label="Edificio residencial moderno"/>
                <div className="absolute bottom-5 left-6 right-6"><p className="text-xs font-bold uppercase tracking-[.2em] text-cyan-200">Condomin-Pro</p><p className="mt-1 text-2xl font-extrabold">Tu operación, más clara.</p></div>
              </div>
              <div className="border-t border-white/10 bg-[#0c233e] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Vista de funcionalidades</p><p className="mt-1 text-lg font-bold">Control administrativo integral</p></div><Building2 className="h-8 w-8 text-cyan-300"/></div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><WalletCards className="h-6 w-6 text-cyan-300"/><p className="mt-3 text-sm font-bold">Finanzas</p><p className="mt-1 text-xs text-slate-300">Recibos y pagos reportados</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><Users className="h-6 w-6 text-cyan-300"/><p className="mt-3 text-sm font-bold">Residentes</p><p className="mt-1 text-xs text-slate-300">Unidades y propietarios</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><ClipboardList className="h-6 w-6 text-cyan-300"/><p className="mt-3 text-sm font-bold">Operación</p><p className="mt-1 text-xs text-slate-300">Mantenimiento y gestión</p></div>
                  <div className="rounded-xl border border-white/10 bg-white/[.06] p-4"><Mail className="h-6 w-6 text-cyan-300"/><p className="mt-3 text-sm font-bold">Comunicación</p><p className="mt-1 text-xs text-slate-300">Boletines y comunicados</p></div>
                </div>
                <p className="mt-4 text-[11px] text-slate-400">Vista ilustrativa de los módulos · sin datos simulados de clientes</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="beneficios" className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-wide text-[#1f4b7a]">
              Beneficios
            </p>

            <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
              Una plataforma pensada para administradoras, juntas directivas y
              propietarios
            </h2>

            <p className="mt-4 text-lg leading-8 text-slate-600">
              Reduce procesos manuales, mejora la comunicación y permite tener
              una visión clara de la operación del condominio.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            <BenefitCard
              icon={WalletCards}
              title="Control financiero"
              description="Gestiona recibos, pagos reportados y su validación administrativa."
            />

            <BenefitCard
              icon={Users}
              title="Gestión de residentes"
              description="Administra propietarios, inquilinos, familiares autorizados y lotes."
            />

            <BenefitCard
              icon={LockKeyhole}
              title="Control de acceso"
              description="Control de visitantes y autorizaciones, previsto para próximas fases."
            />

            <BenefitCard
              icon={MessageSquareWarning}
              title="Incidencias y reclamos"
              description="Centraliza solicitudes, reclamos, mantenimiento y comunicación formal."
            />
          </div>
        </div>
      </section>

      <section id="modulos" className="mx-auto max-w-7xl px-6 py-20">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-wide text-[#1f4b7a]">
            Módulos
          </p>

          <h2 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-950">
            Estructura modular para crecer por etapas
          </h2>

          <p className="mt-4 text-lg leading-8 text-slate-600">
            Activa los módulos según el tipo de condominio, asociación,
            residencial o conjunto habitacional que administres.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <ModuleCard
            icon={Building2}
            title="Condominios, lotes e inmuebles"
            description="Registro de condominios, unidades inmobiliarias, casas, lotes, estacionamientos y depósitos."
          />

          <ModuleCard
            icon={WalletCards}
            title="Finanzas y cobranzas"
            description="Recibos de mantenimiento, pagos reportados y conciliación de información."
          />

          <ModuleCard
            icon={CalendarCheck}
            title="Reservas de áreas comunes"
            description="Reservas de espacios compartidos, previstas para futuras fases."
          />

          <ModuleCard
            icon={LockKeyhole}
            title="Control de acceso"
            description="Visitantes, proveedores, delivery, seguridad, autorización por lote y registro de ingreso."
          />

          <ModuleCard
            icon={ClipboardList}
            title="Mantenimiento"
            description="Proveedores, equipos, cronogramas, cotizaciones y mantenimiento preventivo."
          />

          <ModuleCard
            icon={FileText}
            title="Documentos y comunicación"
            description="Comunicados, documentos, cartas, reportes, incidencias y atención administrativa."
          />
        </div>
      </section>

      <section id="contacto" className="mx-auto max-w-7xl px-6 py-20">
        <div className="rounded-[2rem] bg-[#1f4b7a] p-8 text-white shadow-2xl shadow-slate-300/40 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-center">
            <div>
              <h2 className="text-4xl font-extrabold tracking-tight">
                Lleva la administración de tu condominio a una plataforma
                moderna
              </h2>

              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/80">
                Condomin-Pro está preparado para adaptarse a condominios de
                playa, edificios residenciales, asociaciones de propietarios y
                administradoras.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-6 text-slate-900">
              <h3 className="text-xl font-bold">Solicita información</h3>

              <p className="mt-2 text-sm leading-6 text-slate-600">
                Podemos configurar los módulos según la operación real de tu
                condominio.
              </p>

              <ProspectForm/>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} Condomin-Pro.</p>
          <p>Plataforma de gestión y administración de condominios.</p>
        </div>
      </footer>
    </main>
  )
}

function VisualTag({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4b7a]/10 text-[#1f4b7a]">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-sm font-bold text-slate-800">{label}</span>
    </div>
  )
}

function BenefitCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-[#f8fbfd] p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f4b7a]/10 text-[#1f4b7a]">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function ModuleCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType
  title: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:border-[#1f4b7a]/30 hover:shadow-md">
      <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#1f4b7a]/10 text-[#1f4b7a]">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
}: {
  icon: React.ElementType
  label: string
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1f4b7a]/10 text-[#1f4b7a]">
        <Icon className="h-5 w-5" />
      </div>

      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </div>
  )
}