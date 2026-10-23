'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import {
  Building2,
  CheckCircle2,
  Eye,
  Layers3,
  Loader2,
  Map,
  Plus,
  Search,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'

type EstadoRegistro = 'activo' | 'inactivo'
type TipoEtapa = 'etapa' | 'nucleo' | 'sector' | 'manzana' | 'zona'

type Condominio = {
  id: string
  nombre: string
}

type Etapa = {
  id: string
  condominio_id: string
  nombre: string
  codigo: string | null
  tipo: TipoEtapa
  descripcion: string | null
  total_lotes: number
  estado: EstadoRegistro
  created_at: string
}

type EtapaForm = {
  condominio_id: string
  nombre: string
  codigo: string
  tipo: TipoEtapa
  descripcion: string
  total_lotes: string
  estado: EstadoRegistro
}

const tipoLabels: Record<TipoEtapa, string> = {
  etapa: 'Etapa',
  nucleo: 'Núcleo',
  sector: 'Sector',
  manzana: 'Manzana',
  zona: 'Zona',
}

const estadoLabels: Record<EstadoRegistro, string> = {
  activo: 'Activo',
  inactivo: 'Inactivo',
}

export default function EtapasPage() {
  const router = useRouter()

  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [etapas, setEtapas] = useState<Etapa[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [condominioFilter, setCondominioFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState<TipoEtapa | 'todos'>('todos')
  const [estadoFilter, setEstadoFilter] = useState<EstadoRegistro | 'todos'>('todos')
  const [selectedEtapa, setSelectedEtapa] = useState<Etapa | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [notice, setNotice] = useState('')

  const condominioNameById = useMemo(() => {
    const map = new Map<string, string>()
    condominios.forEach((item) => map.set(item.id, item.nombre))
    return map
  }, [condominios])

  const filteredEtapas = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()

    return etapas.filter((etapa) => {
      const condominioName = condominioNameById.get(etapa.condominio_id) || ''

      const matchesSearch =
        etapa.nombre.toLowerCase().includes(search) ||
        (etapa.codigo || '').toLowerCase().includes(search) ||
        (etapa.descripcion || '').toLowerCase().includes(search) ||
        etapa.tipo.toLowerCase().includes(search) ||
        condominioName.toLowerCase().includes(search)

      if (!matchesSearch) return false
      if (condominioFilter !== 'todos' && etapa.condominio_id !== condominioFilter) return false
      if (tipoFilter !== 'todos' && etapa.tipo !== tipoFilter) return false
      if (estadoFilter !== 'todos' && etapa.estado !== estadoFilter) return false

      return true
    })
  }, [
    etapas,
    searchTerm,
    condominioFilter,
    tipoFilter,
    estadoFilter,
    condominioNameById,
  ])

  const activos = etapas.filter((item) => item.estado === 'activo').length
  const inactivos = etapas.filter((item) => item.estado === 'inactivo').length
  const totalLotes = etapas.reduce((total, item) => total + Number(item.total_lotes || 0), 0)

  const loadData = async () => {
    setLoading(true)
    setErrorMessage('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.replace('/login')
      return
    }

    const { data: condominiosData, error: condominiosError } = await supabase
      .from('condominios')
      .select('id,nombre')
      .order('created_at', { ascending: false })

    if (condominiosError) {
      setErrorMessage(condominiosError.message)
      setLoading(false)
      return
    }

    const { data: etapasData, error: etapasError } = await supabase
      .from('etapas')
      .select(
        'id,condominio_id,nombre,codigo,tipo,descripcion,total_lotes,estado,created_at'
      )
      .order('created_at', { ascending: false })

    if (etapasError) {
      setErrorMessage(etapasError.message)
      setLoading(false)
      return
    }

    setCondominios((condominiosData || []) as Condominio[])
    setEtapas((etapasData || []) as Etapa[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const openNewEtapaModal = () => {
    setErrorMessage('')
    setNotice('')

    if (condominios.length === 0) {
      setErrorMessage(
        'Primero debes registrar un condominio antes de crear etapas o núcleos.'
      )
      return
    }

    setShowModal(true)
  }

  const handleCreateEtapa = async (form: EtapaForm) => {
    setSaving(true)
    setErrorMessage('')
    setNotice('')

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSaving(false)
      router.replace('/login')
      return
    }

    const { error } = await supabase.from('etapas').insert({
      condominio_id: form.condominio_id,
      nombre: form.nombre.trim(),
      codigo: form.codigo.trim() || null,
      tipo: form.tipo,
      descripcion: form.descripcion.trim() || null,
      total_lotes: Number(form.total_lotes || 0),
      estado: form.estado,
      created_by: user.id,
    })

    setSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setShowModal(false)
    setNotice('Etapa o núcleo registrado correctamente.')
    await loadData()
  }

  const handleDeleteEtapa = async (id: string) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar esta etapa o núcleo?')
    if (!confirmed) return

    setErrorMessage('')
    setNotice('')

    const { error } = await supabase.from('etapas').delete().eq('id', id)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setNotice('Registro eliminado correctamente.')
    await loadData()
  }

  return (
    <main className="space-y-8">
      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <Map className="h-4 w-4" />
              Organización territorial del condominio
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Etapas / Núcleos
            </h1>

            <p className="mt-2 max-w-3xl text-muted-foreground">
              Registra etapas, núcleos, sectores, manzanas o zonas para organizar
              lotes, inmuebles y áreas del condominio. Esta pantalla no contiene
              información demo.
            </p>
          </div>

          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={openNewEtapaModal}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nueva etapa / núcleo
          </Button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {notice && (
        <div className="rounded-2xl border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-medium text-primary">
          {notice}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Layers3}
          title="Total registros"
          value={etapas.length.toString()}
          description="Etapas, núcleos o sectores"
          tone="blue"
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Activos"
          value={activos.toString()}
          description="Actualmente operativos"
          tone="green"
        />

        <SummaryCard
          icon={X}
          title="Inactivos"
          value={inactivos.toString()}
          description="Fuera de operación"
          tone="amber"
        />

        <SummaryCard
          icon={Building2}
          title="Lotes referenciales"
          value={totalLotes.toString()}
          description="Total declarado"
          tone="purple"
        />
      </section>

      <section className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="relative w-full xl:w-[520px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, código, tipo o condominio..."
              className="h-11 w-full rounded-xl border border-border bg-background pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={condominioFilter}
              onChange={(event) => setCondominioFilter(event.target.value)}
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="todos">Todos los condominios</option>
              {condominios.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nombre}
                </option>
              ))}
            </select>

            <select
              value={tipoFilter}
              onChange={(event) =>
                setTipoFilter(event.target.value as TipoEtapa | 'todos')
              }
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="todos">Todos los tipos</option>
              <option value="etapa">Etapa</option>
              <option value="nucleo">Núcleo</option>
              <option value="sector">Sector</option>
              <option value="manzana">Manzana</option>
              <option value="zona">Zona</option>
            </select>

            <select
              value={estadoFilter}
              onChange={(event) =>
                setEstadoFilter(event.target.value as EstadoRegistro | 'todos')
              }
              className="h-11 rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState />
      ) : filteredEtapas.length === 0 ? (
        <EmptyState
          title="Sin etapas o núcleos registrados"
          description={
            condominios.length === 0
              ? 'Primero registra un condominio para poder crear etapas o núcleos.'
              : 'Aquí aparecerán las etapas, núcleos o sectores creados en Supabase.'
          }
          actionLabel="Nueva etapa / núcleo"
          onAction={openNewEtapaModal}
        />
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="border-b border-border bg-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Condominio
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-foreground">
                    Lotes
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-foreground">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-foreground">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border">
                {filteredEtapas.map((etapa) => (
                  <tr key={etapa.id} className="transition hover:bg-secondary/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">
                        {etapa.nombre}
                      </p>
                      <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                        {etapa.descripcion || 'Sin descripción'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {etapa.codigo || 'Sin código'}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {condominioNameById.get(etapa.condominio_id) || 'Sin condominio'}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <TypePill tipo={etapa.tipo} />
                    </td>

                    <td className="px-6 py-4 text-right text-sm font-semibold text-foreground">
                      {etapa.total_lotes}
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusPill status={etapa.estado} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedEtapa(etapa)}
                          className="rounded-lg p-2 transition hover:bg-secondary"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button
                          onClick={() => handleDeleteEtapa(etapa.id)}
                          className="rounded-lg p-2 transition hover:bg-red-50"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {showModal && (
        <NewEtapaModal
          saving={saving}
          condominios={condominios}
          onClose={() => setShowModal(false)}
          onSave={handleCreateEtapa}
        />
      )}

      {selectedEtapa && (
        <EtapaDetailModal
          etapa={selectedEtapa}
          condominioName={
            condominioNameById.get(selectedEtapa.condominio_id) ||
            'Sin condominio'
          }
          onClose={() => setSelectedEtapa(null)}
        />
      )}
    </main>
  )
}

function NewEtapaModal({
  saving,
  condominios,
  onClose,
  onSave,
}: {
  saving: boolean
  condominios: Condominio[]
  onClose: () => void
  onSave: (form: EtapaForm) => void
}) {
  const [form, setForm] = useState<EtapaForm>({
    condominio_id: condominios[0]?.id || '',
    nombre: '',
    codigo: '',
    tipo: 'etapa',
    descripcion: '',
    total_lotes: '0',
    estado: 'activo',
  })

  const [error, setError] = useState('')

  const updateForm = <K extends keyof EtapaForm>(
    field: K,
    value: EtapaForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!form.condominio_id) {
      setError('Selecciona un condominio.')
      return
    }

    if (!form.nombre.trim()) {
      setError('Ingresa el nombre de la etapa o núcleo.')
      return
    }

    if (Number(form.total_lotes || 0) < 0) {
      setError('El total de lotes no puede ser negativo.')
      return
    }

    onSave(form)
  }

  return (
    <ModalLayout
      title="Nueva etapa / núcleo"
      description="Registra una etapa, núcleo, sector, manzana o zona del condominio."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            label="Condominio"
            value={form.condominio_id}
            onChange={(value) => updateForm('condominio_id', value)}
            options={condominios.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
          />

          <InputField
            label="Nombre"
            value={form.nombre}
            onChange={(value) => updateForm('nombre', value)}
            placeholder="Ejemplo: Núcleo 1, Etapa A, Sector Playa"
          />

          <InputField
            label="Código"
            value={form.codigo}
            onChange={(value) => updateForm('codigo', value)}
            placeholder="Ejemplo: NUC-01, ETA-A"
          />

          <SelectField
            label="Tipo"
            value={form.tipo}
            onChange={(value) => updateForm('tipo', value as TipoEtapa)}
            options={[
              { label: 'Etapa', value: 'etapa' },
              { label: 'Núcleo', value: 'nucleo' },
              { label: 'Sector', value: 'sector' },
              { label: 'Manzana', value: 'manzana' },
              { label: 'Zona', value: 'zona' },
            ]}
          />

          <InputField
            label="Total de lotes"
            value={form.total_lotes}
            onChange={(value) => updateForm('total_lotes', value)}
            placeholder="0"
            type="number"
          />

          <SelectField
            label="Estado"
            value={form.estado}
            onChange={(value) => updateForm('estado', value as EstadoRegistro)}
            options={[
              { label: 'Activo', value: 'activo' },
              { label: 'Inactivo', value: 'inactivo' },
            ]}
          />
        </div>

        <TextAreaField
          label="Descripción"
          value={form.descripcion}
          onChange={(value) => updateForm('descripcion', value)}
          placeholder="Describe la etapa, núcleo, sector o zona..."
        />

        <div className="flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Guardar
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}

function EtapaDetailModal({
  etapa,
  condominioName,
  onClose,
}: {
  etapa: Etapa
  condominioName: string
  onClose: () => void
}) {
  return (
    <ModalLayout
      title={etapa.nombre}
      description={condominioName}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <DetailRow label="Condominio" value={condominioName} />
        <DetailRow label="Código" value={etapa.codigo || 'Sin código'} />
        <DetailRow label="Tipo" value={tipoLabels[etapa.tipo]} />
        <DetailRow label="Total lotes" value={String(etapa.total_lotes)} />
        <DetailRow label="Estado" value={estadoLabels[etapa.estado]} />
        <DetailRow label="Fecha registro" value={formatDate(etapa.created_at)} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-background p-5">
        <p className="text-sm font-bold text-foreground">Descripción</p>
        <p className="mt-3 whitespace-pre-line text-sm leading-7 text-muted-foreground">
          {etapa.descripcion || 'Sin descripción'}
        </p>
      </div>

      <Button onClick={onClose} className="mt-6 w-full">
        Cerrar
      </Button>
    </ModalLayout>
  )
}

function SummaryCard({
  icon: Icon,
  title,
  value,
  description,
  tone,
}: {
  icon: LucideIcon
  title: string
  value: string
  description: string
  tone: 'green' | 'blue' | 'amber' | 'purple'
}) {
  const styles = {
    green: 'bg-green-500/10 text-green-700',
    blue: 'bg-blue-500/10 text-blue-700',
    amber: 'bg-amber-500/10 text-amber-700',
    purple: 'bg-purple-500/10 text-purple-700',
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
      <div
        className={`mb-5 flex h-12 w-12 items-center justify-center rounded-xl ${styles[tone]}`}
      >
        <Icon className="h-6 w-6" />
      </div>

      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  )
}

function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Map className="h-8 w-8" />
      </div>

      <h2 className="text-xl font-bold text-foreground">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Button
        onClick={onAction}
        className="mt-6 bg-primary hover:bg-primary/90"
      >
        <Plus className="mr-2 h-4 w-4" />
        {actionLabel}
      </Button>
    </section>
  )
}

function LoadingState() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-border/60 bg-card p-12">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
      <span className="text-sm font-medium text-muted-foreground">
        Cargando etapas y núcleos...
      </span>
    </div>
  )
}

function TypePill({ tipo }: { tipo: TipoEtapa }) {
  const styles: Record<TipoEtapa, string> = {
    etapa: 'bg-blue-500/10 text-blue-700',
    nucleo: 'bg-purple-500/10 text-purple-700',
    sector: 'bg-green-500/10 text-green-700',
    manzana: 'bg-amber-500/10 text-amber-700',
    zona: 'bg-cyan-500/10 text-cyan-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[tipo]}`}
    >
      {tipoLabels[tipo]}
    </span>
  )
}

function StatusPill({ status }: { status: EstadoRegistro }) {
  const styles: Record<EstadoRegistro, string> = {
    activo: 'bg-green-500/10 text-green-700',
    inactivo: 'bg-red-500/10 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {estadoLabels[status]}
    </span>
  )
}

function ModalLayout({
  title,
  description,
  onClose,
  children,
}: {
  title: string
  description: string
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-border bg-card shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card p-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-secondary"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6">{children}</div>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold text-foreground">{value}</span>
    </div>
  )
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        step={type === 'number' ? '1' : undefined}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ label: string; value: string }>
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-xl border border-border bg-background px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      >
        {options.map((option) => (
          <option key={`${option.value}-${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-foreground">
        {label}
      </label>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={5}
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  )
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}