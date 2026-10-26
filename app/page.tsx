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
                CondoAdmin Pro
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
              Ingresar
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto grid max-w-7xl items-center gap-14 px-6 py-20 lg:grid-cols-[1.08fr_1fr] lg:py-28">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#1f4b7a]/20 bg-[#1f4b7a]/10 px-4 py-2 text-sm font-semibold text-[#1f4b7a]">
            <ShieldCheck className="h-4 w-4" />
            Plataforma SaaS para administración de condominios
          </div>

          <h1 className="max-w-3xl text-5xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-6xl">
            Administra tu condominio con orden, control y confianza.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Centraliza residentes, inmuebles, pagos, incidencias y comunicación administrativa en una plataforma moderna. Amplía tu gestión con módulos adicionales según tus necesidades.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl bg-[#1f4b7a] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#173a60]"
            >
              Ver plataforma
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <a
              href="#contacto"
              className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Solicitar demo
            </a>
          </div>
        </div>

        <div className="relative min-h-[480px] overflow-hidden rounded-[2rem] border border-white/50 bg-[#0b2446] shadow-2xl shadow-slate-400/30 lg:min-h-[560px]">
          <div className="absolute inset-0 bg-cover bg-center" style={{backgroundImage:"linear-gradient(180deg,rgba(11,36,70,.08) 15%,rgba(11,36,70,.72) 100%),url('https://unsplash.com/photos/TJsf1pMigZM/download?force=true&w=1800')"}} role="img" aria-label="Fachada moderna de un edificio residencial elegante"/>
          <div className="relative flex h-full min-h-[480px] flex-col justify-end gap-4 p-6 text-white lg:min-h-[560px] lg:p-8">
            <div className="self-start rounded-full border border-white/30 bg-[#0b2446]/70 px-4 py-2 text-xs font-bold tracking-wide backdrop-blur-md">
              Gestión moderna de condominios
            </div>
            <h2 className="max-w-sm text-3xl font-extrabold leading-tight">Un espacio mejor administrado comienza aquí.</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/25 bg-[#0b2446]/75 p-4 backdrop-blur-md"><WalletCards className="mb-2 h-6 w-6 text-sky-200"/><strong className="block text-sm">Pagos y cobranzas</strong><span className="mt-1 block text-xs text-sky-100">Recibos y validación de pagos</span></div>
              <div className="rounded-2xl border border-white/25 bg-[#0b2446]/75 p-4 backdrop-blur-md"><Users className="mb-2 h-6 w-6 text-sky-200"/><strong className="block text-sm">Gestión de residentes</strong><span className="mt-1 block text-xs text-sky-100">Información de la comunidad</span></div>
              <div className="rounded-2xl border border-white/25 bg-[#0b2446]/75 p-4 backdrop-blur-md sm:col-span-2"><ClipboardList className="mb-2 h-6 w-6 text-sky-200"/><strong className="block text-sm">Operación centralizada</strong><span className="mt-1 block text-xs text-sky-100">Incidencias, tareas y comunicados</span></div>
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
                CondoAdmin Pro está preparado para adaptarse a condominios de
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

              <div className="mt-6 space-y-3">
                <ContactRow icon={Mail} label="Correo administrativo" />
                <ContactRow icon={Phone} label="Contacto comercial" />
                <ContactRow icon={Building2} label="Demo para condominios" />
              </div>

              <Link
                href="/login"
                className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1f4b7a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#173a60]"
              >
                Ingresar a la plataforma
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-6 py-8 text-sm text-slate-500 md:flex-row">
          <p>© {new Date().getFullYear()} CondoAdmin Pro.</p>
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