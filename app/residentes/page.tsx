'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import {
  Building2,
  CheckCircle2,
  Download,
  Eye,
  Home,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'

type RecordStatus = 'activo' | 'inactivo'

type ResidentType =
  | 'propietario'
  | 'inquilino'
  | 'familiar'
  | 'apoderado'
  | 'habitante'

type Condominio = {
  id: string
  nombre: string
}

type Inmueble = {
  id: string
  condominio_id: string
  codigo: string
  tipo: string
}

type Residente = {
  id: string
  condominio_id: string
  inmueble_id: string | null
  full_name: string
  document_number: string | null
  email: string | null
  phone: string | null
  tipo: ResidentType
  fecha_ingreso: string | null
  estado: RecordStatus
  observacion: string | null
  created_at: string
}

type ResidentForm = {
  condominio_id: string
  inmueble_id: string
  full_name: string
  document_number: string
  email: string
  phone: string
  tipo: ResidentType
  fecha_ingreso: string
  observacion: string
}

const residentTypeLabels: Record<ResidentType, string> = {
  propietario: 'Propietario',
  inquilino: 'Inquilino',
  familiar: 'Familiar',
  apoderado: 'Apoderado',
  habitante: 'Habitante',
}

export default function ResidentesPage() {
  const router = useRouter()

  const [condominios, setCondominios] = useState<Condominio[]>([])
  const [inmuebles, setInmuebles] = useState<Inmueble[]>([])
  const [residentes, setResidentes] = useState<Residente[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [condominioFilter, setCondominioFilter] = useState('todos')
  const [tipoFilter, setTipoFilter] = useState<ResidentType | 'todos'>('todos')
  const [estadoFilter, setEstadoFilter] = useState<RecordStatus | 'todos'>('todos')
  const [selectedResident, setSelectedResident] = useState<Residente | null>(null)
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

  const inmuebleNameById = useMemo(() => {
    const map = new Map<string, string>()
    inmuebles.forEach((item) => map.set(item.id, item.codigo))
    return map
  }, [inmuebles])

  const filteredResidents = useMemo(() => {
    const search = searchTerm.toLowerCase().trim()

    return residentes.filter((residente) => {
      const condominioName = condominioNameById.get(residente.condominio_id) || ''
      const inmuebleName = residente.inmueble_id
        ? inmuebleNameById.get(residente.inmueble_id) || ''
        : ''

      const matchesSearch =
        residente.full_name.toLowerCase().includes(search) ||
        (residente.document_number || '').toLowerCase().includes(search) ||
        (residente.email || '').toLowerCase().includes(search) ||
        (residente.phone || '').toLowerCase().includes(search) ||
        condominioName.toLowerCase().includes(search) ||
        inmuebleName.toLowerCase().includes(search)

      if (!matchesSearch) return false
      if (condominioFilter !== 'todos' && residente.condominio_id !== condominioFilter) return false
      if (tipoFilter !== 'todos' && residente.tipo !== tipoFilter) return false
      if (estadoFilter !== 'todos' && residente.estado !== estadoFilter) return false

      return true
    })
  }, [
    residentes,
    searchTerm,
    condominioFilter,
    tipoFilter,
    estadoFilter,
    condominioNameById,
    inmuebleNameById,
  ])

  const activos = residentes.filter((item) => item.estado === 'activo').length
  const propietarios = residentes.filter((item) => item.tipo === 'propietario').length
  const inquilinos = residentes.filter((item) => item.tipo === 'inquilino').length

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

    const { data: inmueblesData, error: inmueblesError } = await supabase
      .from('inmuebles')
      .select('id,condominio_id,codigo,tipo')
      .order('codigo', { ascending: true })

    if (inmueblesError) {
      setErrorMessage(inmueblesError.message)
      setLoading(false)
      return
    }

    const { data: residentesData, error: residentesError } = await supabase
      .from('residentes')
      .select(
        'id,condominio_id,inmueble_id,full_name,document_number,email,phone,tipo,fecha_ingreso,estado,observacion,created_at'
      )
      .order('created_at', { ascending: false })

    if (residentesError) {
      setErrorMessage(residentesError.message)
      setLoading(false)
      return
    }

    setCondominios((condominiosData || []) as Condominio[])
    setInmuebles((inmueblesData || []) as Inmueble[])
    setResidentes((residentesData || []) as Residente[])
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleCreateResident = async (form: ResidentForm) => {
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

    const { error } = await supabase.from('residentes').insert({
      condominio_id: form.condominio_id,
      inmueble_id: form.inmueble_id || null,
      full_name: form.full_name.trim(),
      document_number: form.document_number.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,
      tipo: form.tipo,
      fecha_ingreso: form.fecha_ingreso || null,
      estado: 'activo',
      observacion: form.observacion.trim() || null,
      created_by: user.id,
    })

    setSaving(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    setShowModal(false)
    setNotice('Residente registrado correctamente.')
    await loadData()
  }

  const handleDeleteResident = async (id: string) => {
    const confirmed = window.confirm('¿Seguro que deseas eliminar este residente?')
    if (!confirmed) return

    setErrorMessage('')
    setNotice('')

    const resident = residentes.find((item) => item.id === id)
    if (!resident) {
      setErrorMessage('No se encontró al residente seleccionado.')
      return
    }
    const { data, error } = await supabase.from('residentes').delete().eq('id', id).eq('condominio_id', resident.condominio_id).select('id')

    if (error) {
      setErrorMessage(error.message)
      return
    }
    if (!data?.length) {
      setErrorMessage('No se eliminó el registro. Comprueba tus permisos o actualiza la lista.')
      await loadData()
      return
    }

    setNotice('Residente eliminado correctamente.')
    await loadData()
  }

  const handleExportCsv = () => {
    if (filteredResidents.length === 0) {
      setNotice('No hay residentes para exportar.')
      return
    }

    const rows = [
      [
        'Nombre',
        'Documento',
        'Correo',
        'Teléfono',
        'Tipo',
        'Condominio',
        'Unidad',
        'Fecha ingreso',
        'Estado',
        'Observación',
      ],
      ...filteredResidents.map((residente) => [
        residente.full_name,
        residente.document_number || '',
        residente.email || '',
        residente.phone || '',
        residentTypeLabels[residente.tipo],
        condominioNameById.get(residente.condominio_id) || '',
        residente.inmueble_id ? inmuebleNameById.get(residente.inmueble_id) || '' : '',
        residente.fecha_ingreso || '',
        residente.estado,
        residente.observacion || '',
      ]),
    ]

    // Escape RFC 4180 quotes and prevent spreadsheet formula execution from user-entered text.
    const safeCell = (value: string) => {
      const normalized = String(value ?? '')
      const escaped = ['=', '+', '-', '@'].includes(normalized.trimStart().charAt(0)) ? "'" + normalized : normalized
      return '"' + escaped.replace(/"/g, '""') + '"'
    }
    const csv = '\uFEFF' + rows.map((row) => row.map(safeCell).join(',')).join('\r\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'residentes-unidades.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-gradient-to-r from-[#0b2446] via-[#124c71] to-[#087c9e] p-8 text-white shadow-xl">
        <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-sm font-semibold text-sky-100">
              <Users className="h-4 w-4" />
              Residentes asociados por lote o unidad
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Residentes & Unidades
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-sky-100">
              Registra propietarios, inquilinos, familiares, apoderados y
              habitantes asociados a un condominio y unidad inmobiliaria. Esta
              pantalla no contiene información demo.
            </p>
          </div>

          <Button
            className="bg-white font-bold text-[#0b2446] hover:bg-sky-50"
            onClick={() => setShowModal(true)}
            disabled={condominios.length === 0}
          >
            <Plus className="mr-2 h-4 w-4" />
            Agregar residente
          </Button>
        </div>
      </section>

      {errorMessage && (
        <div className="rounded-[22px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
          {errorMessage}
        </div>
      )}

      {notice && (
        <div className="rounded-[22px] border border-primary/20 bg-primary/10 px-5 py-4 text-sm font-medium text-primary">
          {notice}
        </div>
      )}

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={Users}
          title="Total residentes"
          value={residentes.length.toString()}
          description="Registros reales"
          tone="blue"
        />

        <SummaryCard
          icon={CheckCircle2}
          title="Activos"
          value={activos.toString()}
          description="Actualmente activos"
          tone="green"
        />

        <SummaryCard
          icon={Home}
          title="Propietarios"
          value={propietarios.toString()}
          description="Registrados como propietarios"
          tone="amber"
        />

        <SummaryCard
          icon={UserRound}
          title="Inquilinos"
          value={inquilinos.toString()}
          description="Registrados como inquilinos"
          tone="purple"
        />
      </section>

      <section className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)]">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div className="relative w-full xl:w-[520px]">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />

            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, documento, correo, teléfono, lote o condominio..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={condominioFilter}
              onChange={(event) => setCondominioFilter(event.target.value)}
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
                setTipoFilter(event.target.value as ResidentType | 'todos')
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="todos">Todos los tipos</option>
              <option value="propietario">Propietario</option>
              <option value="inquilino">Inquilino</option>
              <option value="familiar">Familiar</option>
              <option value="apoderado">Apoderado</option>
              <option value="habitante">Habitante</option>
            </select>

            <select
              value={estadoFilter}
              onChange={(event) =>
                setEstadoFilter(event.target.value as RecordStatus | 'todos')
              }
              className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>

            <Button variant="outline" onClick={handleExportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </section>

      {loading ? (
        <LoadingState />
      ) : filteredResidents.length === 0 ? (
        <EmptyState
          title="Sin residentes registrados"
          description={
            condominios.length === 0
              ? 'Primero registra un condominio para poder agregar residentes.'
              : 'Aquí aparecerán los residentes creados en Supabase.'
          }
          actionLabel="Agregar residente"
          disabled={condominios.length === 0}
          onAction={() => setShowModal(true)}
        />
      ) : (
        <section className="overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1150px] text-sm">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Residente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Unidad
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Condominio
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-foreground">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-foreground">
                    Tipo
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
                {filteredResidents.map((residente) => (
                  <tr key={residente.id} className="transition hover:bg-secondary/50">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-foreground">
                        {residente.full_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Doc: {residente.document_number || 'Sin documento'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-sm font-semibold text-primary">
                      {residente.inmueble_id
                        ? inmuebleNameById.get(residente.inmueble_id) || 'Sin unidad'
                        : 'Sin unidad'}
                    </td>

                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {condominioNameById.get(residente.condominio_id) || 'Sin condominio'}
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-sm text-muted-foreground">
                        {residente.email || 'Sin correo'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {residente.phone || 'Sin teléfono'}
                      </p>
                    </td>

                    <td className="px-6 py-4 text-center">
                      <TypePill type={residente.tipo} />
                    </td>

                    <td className="px-6 py-4 text-center">
                      <StatusPill status={residente.estado} />
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedResident(residente)}
                          className="rounded-lg p-2 transition hover:bg-secondary"
                          title="Ver detalle"
                        >
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </button>

                        <button
                          onClick={() => handleDeleteResident(residente.id)}
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
        <NewResidentModal
          saving={saving}
          condominios={condominios}
          inmuebles={inmuebles}
          onClose={() => setShowModal(false)}
          onSave={handleCreateResident}
        />
      )}

      {selectedResident && (
        <ResidentDetailModal
          residente={selectedResident}
          condominioName={condominioNameById.get(selectedResident.condominio_id) || 'Sin condominio'}
          inmuebleName={
            selectedResident.inmueble_id
              ? inmuebleNameById.get(selectedResident.inmueble_id) || 'Sin unidad'
              : 'Sin unidad'
          }
          onClose={() => setSelectedResident(null)}
        />
      )}
    </main>
  )
}

function NewResidentModal({
  saving,
  condominios,
  inmuebles,
  onClose,
  onSave,
}: {
  saving: boolean
  condominios: Condominio[]
  inmuebles: Inmueble[]
  onClose: () => void
  onSave: (form: ResidentForm) => void
}) {
  const [form, setForm] = useState<ResidentForm>({
    condominio_id: condominios[0]?.id || '',
    inmueble_id: '',
    full_name: '',
    document_number: '',
    email: '',
    phone: '',
    tipo: 'habitante',
    fecha_ingreso: new Date().toISOString().slice(0, 10),
    observacion: '',
  })

  const [error, setError] = useState('')

  const filteredInmuebles = inmuebles.filter(
    (item) => item.condominio_id === form.condominio_id
  )

  const updateForm = <K extends keyof ResidentForm>(
    field: K,
    value: ResidentForm[K]
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

    if (!form.full_name.trim()) {
      setError('Ingresa el nombre del residente.')
      return
    }

    onSave(form)
  }

  return (
    <ModalLayout
      title="Agregar residente"
      description="Asocia el residente a un condominio y unidad inmobiliaria."
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
            onChange={(value) => {
              updateForm('condominio_id', value)
              updateForm('inmueble_id', '')
            }}
            options={condominios.map((item) => ({
              label: item.nombre,
              value: item.id,
            }))}
          />

          <SelectField
            label="Unidad / Lote"
            value={form.inmueble_id}
            onChange={(value) => updateForm('inmueble_id', value)}
            options={[
              { label: 'Sin unidad asignada', value: '' },
              ...filteredInmuebles.map((item) => ({
                label: item.codigo,
                value: item.id,
              })),
            ]}
          />

          <InputField
            label="Nombre completo"
            value={form.full_name}
            onChange={(value) => updateForm('full_name', value)}
            placeholder="Nombre del residente"
          />

          <InputField
            label="DNI / CE / RUC"
            value={form.document_number}
            onChange={(value) => updateForm('document_number', value)}
            placeholder="Documento"
          />

          <InputField
            label="Correo"
            value={form.email}
            onChange={(value) => updateForm('email', value)}
            placeholder="correo@dominio.com"
            type="email"
          />

          <InputField
            label="Teléfono"
            value={form.phone}
            onChange={(value) => updateForm('phone', value)}
            placeholder="+51 999 999 999"
          />

          <SelectField
            label="Tipo de residente"
            value={form.tipo}
            onChange={(value) => updateForm('tipo', value as ResidentType)}
            options={[
              { label: 'Propietario', value: 'propietario' },
              { label: 'Inquilino', value: 'inquilino' },
              { label: 'Familiar', value: 'familiar' },
              { label: 'Apoderado', value: 'apoderado' },
              { label: 'Habitante', value: 'habitante' },
            ]}
          />

          <InputField
            label="Fecha de ingreso"
            value={form.fecha_ingreso}
            onChange={(value) => updateForm('fecha_ingreso', value)}
            placeholder="Fecha"
            type="date"
          />
        </div>

        <TextAreaField
          label="Observación"
          value={form.observacion}
          onChange={(value) => updateForm('observacion', value)}
          placeholder="Observación administrativa..."
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
                Guardar residente
              </>
            )}
          </Button>
        </div>
      </form>
    </ModalLayout>
  )
}

function ResidentDetailModal({
  residente,
  condominioName,
  inmuebleName,
  onClose,
}: {
  residente: Residente
  condominioName: string
  inmuebleName: string
  onClose: () => void
}) {
  return (
    <ModalLayout
      title={residente.full_name}
      description={residentTypeLabels[residente.tipo]}
      onClose={onClose}
    >
      <div className="space-y-4 text-sm">
        <DetailRow label="Condominio" value={condominioName} />
        <DetailRow label="Unidad / Lote" value={inmuebleName} />
        <DetailRow label="Documento" value={residente.document_number || 'Sin documento'} />
        <DetailRow label="Correo" value={residente.email || 'Sin correo'} />
        <DetailRow label="Teléfono" value={residente.phone || 'Sin teléfono'} />
        <DetailRow label="Tipo" value={residentTypeLabels[residente.tipo]} />
        <DetailRow label="Fecha ingreso" value={residente.fecha_ingreso || 'Sin fecha'} />
        <DetailRow label="Estado" value={residente.estado} />
        <DetailRow label="Observación" value={residente.observacion || 'Sin observación'} />
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
    <div className="rounded-[24px] border border-slate-200/80 bg-white p-6 shadow-[0_15px_36px_-30px_rgba(8,40,75,.4)]">
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
  disabled = false,
}: {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
  disabled?: boolean
}) {
  return (
    <section className="rounded-[22px] border border-border/60 bg-card p-10 text-center shadow-sm">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-primary">
        <Users className="h-8 w-8" />
      </div>

      <h2 className="text-xl font-bold text-foreground">{title}</h2>

      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
        {description}
      </p>

      <Button
        onClick={onAction}
        disabled={disabled}
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
    <div className="flex items-center justify-center rounded-[22px] border border-border/60 bg-card p-12">
      <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
      <span className="text-sm font-medium text-muted-foreground">
        Cargando residentes...
      </span>
    </div>
  )
}

function TypePill({ type }: { type: ResidentType }) {
  const styles: Record<ResidentType, string> = {
    propietario: 'bg-blue-500/10 text-blue-700',
    inquilino: 'bg-purple-500/10 text-purple-700',
    familiar: 'bg-green-500/10 text-green-700',
    apoderado: 'bg-amber-500/10 text-amber-700',
    habitante: 'bg-cyan-500/10 text-cyan-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[type]}`}
    >
      {residentTypeLabels[type]}
    </span>
  )
}

function StatusPill({ status }: { status: RecordStatus }) {
  const styles: Record<RecordStatus, string> = {
    activo: 'bg-green-500/10 text-green-700',
    inactivo: 'bg-red-500/10 text-red-700',
  }

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[status]}`}
    >
      {status === 'activo' ? 'Activo' : 'Inactivo'}
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
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-950/75 p-3 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="relative my-auto max-h-[calc(100dvh-1.5rem)] w-full max-w-4xl overflow-y-auto overscroll-contain rounded-[24px] border border-slate-200 bg-white text-slate-900 shadow-[0_35px_100px_-20px_rgba(0,0,0,.55)] sm:max-h-[90dvh]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 shadow-sm sm:px-6 sm:py-5">
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

        <div className="bg-white p-5 sm:p-6">{children}</div>
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
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
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
        rows={4}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
      />
    </div>
  )
}