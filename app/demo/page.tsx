'use client'

import {useState} from 'react'
import Link from 'next/link'
import {Archive, ArrowRight, Bike, Boxes, Building2, CalendarDays, CarFront, ChartColumn, Gamepad2, House, IdCard, Landmark, Layers3, LayoutDashboard, ListTodo, Mail, Menu, MessagesSquare, PawPrint, ShieldCheck, Users, Vote, Wallet, Wrench, X} from 'lucide-react'

const grupos=[
 {titulo:'General',items:[['dashboard','Dashboard',LayoutDashboard],['tareas','Tareas',ListTodo]]},
 {titulo:'Edificio',items:[
  ['bloques','Bloques inmobiliarios',Building2],['residentes','Residentes',Users],['mascotas','Mascotas',PawPrint],
  ['etapas','Etapas',Layers3],['torres','Torres',Landmark],['inmuebles','Inmuebles',House],
  ['estacionamientos','Estacionamientos',CarFront],['vehiculos','Vehículos',Bike],['depositos','Depósitos',Archive],
  ['personal','Personal',IdCard],['acceso','Control de acceso',ShieldCheck],['mensajeria','Mensajería',Mail],
 ]},
 {titulo:'Operaciones',items:[
  ['servicios','Servicios',Boxes],['finanzas','Finanzas',Wallet],['areas','Áreas comunes',Gamepad2],
  ['mantenimiento','Mantenimiento',Wrench],['comunicacion','Comunicación',MessagesSquare],
  ['eventos','Eventos',CalendarDays],['votaciones','Votaciones',Vote],['reportes','Reportes',ChartColumn],
 ]},
] as const

type Seccion=(typeof grupos)[number]['items'][number][0]
type Ejemplo={columnas:readonly string[];filas:readonly (readonly string[])[]}

const ejemplos:Record<Exclude<Seccion,'dashboard'>,Ejemplo>={
 tareas:{columnas:['Actividad','Responsable','Estado'],filas:[['Revisar comprobantes del mes','Administración','Pendiente'],['Actualizar padrón de residentes','Recepción','En curso']]},
 bloques:{columnas:['Bloque','Torres','Unidades'],filas:[['Norte','A y B','64'],['Sur','C y D','64']]},
 residentes:{columnas:['Residente','Unidad','Vínculo'],filas:[['María P.','A-304','Propietaria'],['Carlos R.','B-502','Inquilino'],['Lucía M.','A-108','Propietaria']]},
 mascotas:{columnas:['Mascota','Unidad','Tipo'],filas:[['Luna','A-304','Perro'],['Milo','B-502','Gato']]},
 etapas:{columnas:['Etapa','Bloque','Estado'],filas:[['Primera etapa','Norte','Habilitada'],['Segunda etapa','Sur','Habilitada']]},
 torres:{columnas:['Torre','Bloque','Pisos'],filas:[['Torre A','Norte','8'],['Torre B','Norte','8'],['Torre C','Sur','8']]},
 inmuebles:{columnas:['Unidad','Torre','Estado'],filas:[['A-304','A','Ocupada'],['B-502','B','Ocupada'],['A-108','A','Ocupada']]},
 estacionamientos:{columnas:['Espacio','Unidad','Estado'],filas:[['E-012','A-304','Asignado'],['E-013','—','Disponible']]},
 vehiculos:{columnas:['Vehículo','Unidad','Estacionamiento'],filas:[['Auto gris','A-304','E-012'],['Camioneta blanca','B-502','E-025']]},
 depositos:{columnas:['Depósito','Unidad','Estado'],filas:[['D-004','A-304','Asignado'],['D-005','—','Disponible']]},
 personal:{columnas:['Puesto','Turno','Estado'],filas:[['Recepción','Mañana','Activo'],['Mantenimiento','Tarde','Activo']]},
 acceso:{columnas:['Ingreso','Destino','Estado'],filas:[['Visita autorizada','A-304','Registrado'],['Proveedor de ascensores','Torre B','Programado']]},
 mensajeria:{columnas:['Asunto','Destinatarios','Estado'],filas:[['Resumen mensual de gestión','Propietarios','Borrador'],['Aviso de mantenimiento','Torre B','Enviado']]},
 servicios:{columnas:['Servicio','Proveedor','Frecuencia'],filas:[['Limpieza de áreas comunes','Proveedor A','Diaria'],['Mantenimiento de ascensores','Proveedor B','Mensual']]},
 finanzas:{columnas:['Unidad','Saldo vencido','Seguimiento'],filas:[['A-304','S/ 640','Por contactar'],['B-502','S/ 320','Aviso registrado'],['A-108','S/ 180','Retomar hoy']]},
 areas:{columnas:['Espacio','Horario de uso','Estado'],filas:[['Sala de reuniones','09:00–21:00','Disponible'],['Zona de parrillas','11:00–20:00','En mantenimiento']]},
 mantenimiento:{columnas:['Actividad','Ubicación','Estado'],filas:[['Revisión de bombas','Cuarto técnico','Programada'],['Reparación de luminaria','Torre A','En curso']]},
 comunicacion:{columnas:['Comunicado','Alcance','Estado'],filas:[['Inspección de ascensores','Torre B','Publicado'],['Actualización de horarios','Todo el edificio','Borrador']]},
 eventos:{columnas:['Evento','Lugar','Estado'],filas:[['Asamblea ordinaria','Sala de reuniones','Programada'],['Jornada de limpieza','Patio central','Realizada']]},
 votaciones:{columnas:['Consulta','Participación','Estado'],filas:[['Horario de áreas comunes','32 votos','Abierta'],['Presupuesto de jardinería','45 votos','Cerrada']]},
 reportes:{columnas:['Indicador','Periodo','Resultado'],filas:[['Pagos validados','Octubre','94'],['Recibos pendientes','Octubre','18'],['Incidencias abiertas','Octubre','6']]},
}

const resumen=[
 ['Inmuebles registrados','128','Unidades en el edificio'],
 ['Recibos pendientes','18','Pendientes de regularización'],
 ['Pagos validados','94','Durante el mes'],
 ['Incidencias abiertas','6','Solicitudes activas'],
]
const recaudacion=[['May',4800],['Jun',6500],['Jul',5500],['Ago',7800],['Sep',7200],['Oct',9300]] as const
const soles=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN',maximumFractionDigits:0})

export default function PublicDemo(){
 const [seccion,setSeccion]=useState<Seccion>('dashboard')
 const [menu,setMenu]=useState(false)
 const [soloPendientes,setSoloPendientes]=useState(false)
 const titulo=grupos.flatMap(grupo=>[...grupo.items]).find(([id])=>id===seccion)?.[1]
 const ejemplo=seccion==='dashboard'?null:ejemplos[seccion]
 const filas=seccion==='finanzas'&&soloPendientes?ejemplo?.filas.filter(fila=>fila[2]!=='Aviso registrado'):ejemplo?.filas
 function navegar(id:Seccion){
  setSeccion(id)
  setMenu(false)
  document.getElementById('contenido-demo')?.focus()
 }

 return <div className="min-h-screen bg-[#f0f4f9] text-slate-800">
  <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-2 border-b border-slate-200 bg-white px-3 sm:px-6">
   <div className="flex min-w-0 items-center gap-2 sm:gap-3">
    <button type="button" aria-label={menu?'Cerrar módulos':'Abrir módulos'} aria-expanded={menu} aria-controls="modulos-demo" onClick={()=>setMenu(!menu)} className="rounded-lg border border-slate-200 p-2 md:hidden">{menu?<X size={18}/>:<Menu size={18}/>}</button>
    <Link href="/" className="flex items-center gap-2 whitespace-nowrap text-sm font-extrabold text-[#0a3154]"><span className="grid size-8 place-items-center rounded-lg bg-[#0a4879] text-white"><Building2 size={18} aria-hidden="true"/></span>Condomin-Pro</Link>
   </div>
   <Link href="/#contacto" className="rounded-xl bg-[#1f4b7a] px-3 py-2 text-xs font-bold text-white sm:px-4 sm:text-sm"><span className="sm:hidden">Solicitar demo</span><span className="hidden sm:inline">Solicitar demo guiada</span></Link>
  </header>
  <div className="flex">
   <aside id="modulos-demo" className={`${menu?'block':'hidden'} fixed bottom-0 left-0 top-16 z-20 w-60 overflow-y-auto border-r border-slate-200 bg-white md:sticky md:block md:h-[calc(100dvh-4rem)] md:shrink-0`}>
    <p className="bg-gradient-to-r from-[#092c50] to-[#17618d] px-5 py-5 text-xs font-bold uppercase tracking-widest text-white">Panel de gestión</p>
    <nav aria-label="Módulos de la demo" className="space-y-4 px-3 py-4">
     {grupos.map(grupo=><section key={grupo.titulo}>
      <p className="px-3 pb-2 text-xs font-bold uppercase tracking-wider text-slate-500">{grupo.titulo}</p>
      {grupo.items.map(([id,label,Icon])=><button key={id} type="button" aria-current={seccion===id?'page':undefined} onClick={()=>navegar(id)} className={`mb-0.5 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm ${seccion===id?'bg-gradient-to-r from-[#0a4879] to-[#1176a3] font-semibold text-white':'text-slate-700 hover:bg-sky-50'}`}><Icon size={17} aria-hidden="true"/>{label}</button>)}
     </section>)}
    </nav>
   </aside>
   {menu&&<button type="button" aria-label="Cerrar menú de módulos" onClick={()=>setMenu(false)} className="fixed inset-x-0 bottom-0 top-16 z-10 bg-slate-950/35 md:hidden"/>}
   <main id="contenido-demo" tabIndex={-1} className="min-w-0 flex-1 scroll-mt-20 p-4 outline-none md:p-7 xl:p-9">
    <div className="mx-auto max-w-7xl space-y-5">
     <header className="rounded-[24px] bg-gradient-to-r from-[#0b2446] via-[#123d70] to-[#087c9e] px-5 py-6 text-white shadow-sm sm:px-8 sm:py-8">
      <p className="text-xs font-bold uppercase tracking-widest text-cyan-200">Demo pública sin registro</p>
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{seccion==='dashboard'?'Dashboard ejecutivo':titulo}</h1>
      <p className="mt-2 text-sm text-blue-100">Residencial Los Olivos · Datos ficticios</p>
     </header>
     {seccion==='dashboard'&&<>
      <section aria-labelledby="recorrido-demo" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
       <h2 id="recorrido-demo" className="font-bold">Explora la gestión del edificio</h2>
       <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {([['inmuebles','Ver inmuebles',House],['finanzas','Revisar cobranzas',Wallet],['reportes','Consultar reportes',ChartColumn]] as const).map(([id,label,Icon])=><button key={id} type="button" onClick={()=>navegar(id)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 text-left text-sm font-semibold hover:bg-sky-50"><Icon size={17} className="shrink-0 text-sky-700" aria-hidden="true"/>{label}<ArrowRight size={15} className="ml-auto shrink-0 text-slate-500" aria-hidden="true"/></button>)}
       </div>
      </section>
      <dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">
       {resumen.map(([label,valor,detalle])=><div key={label} className="rounded-2xl border border-slate-200 bg-white p-3 sm:p-5"><dt className="text-sm text-slate-600">{label}</dt><dd className="mt-2 text-3xl font-extrabold text-[#173c65]">{valor}</dd><dd className="mt-1 text-xs text-slate-600">{detalle}</dd></div>)}
      </dl>
      <section aria-labelledby="recaudacion-demo" className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
       <h2 id="recaudacion-demo" className="text-lg font-bold">Recaudación mensual</h2>
       <ul className="mt-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {recaudacion.map(([mes,valor])=><li key={mes} className="text-center text-xs">
         <div className="flex h-24 items-end rounded-t-lg bg-slate-50 sm:h-36" aria-hidden="true"><div className="w-full rounded-t-lg bg-sky-700" style={{height:(valor/100)+'%'}}/></div>
         <p className="mt-2 font-bold">{soles.format(valor)}</p><p className="text-slate-600">{mes}</p>
        </li>)}
       </ul>
      </section>
     </>}
     {ejemplo&&<section aria-label={'Registros de '+titulo} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {seccion==='finanzas'&&<div className="flex flex-wrap items-center justify-between gap-3 p-4">
       <h2 className="font-bold">Cartera vencida</h2>
       <button type="button" aria-pressed={soloPendientes} onClick={()=>setSoloPendientes(!soloPendientes)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${soloPendientes?'border-sky-800 bg-sky-800 text-white':'border-sky-200 text-sky-900'}`}>Por contactar hoy</button>
      </div>}
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label={'Tabla de '+titulo}>
       <table className="w-full text-left text-sm"><thead className="bg-slate-50 text-slate-700"><tr>{ejemplo.columnas.map(columna=><th key={columna} scope="col" className="whitespace-nowrap px-4 py-3">{columna}</th>)}</tr></thead>
        <tbody className="divide-y divide-slate-100">{filas?.map(fila=><tr key={fila[0]}>{fila.map((valor,i)=>i===0?<th key={i} scope="row" className="px-4 py-4 font-semibold text-slate-900">{valor}</th>:<td key={i} className="px-4 py-4 text-slate-600">{valor}</td>)}</tr>)}</tbody>
       </table>
      </div>
     </section>}
    </div>
   </main>
  </div>
 </div>
}
