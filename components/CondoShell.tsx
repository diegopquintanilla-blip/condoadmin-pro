'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Building2, LayoutDashboard, ListTodo, Users, PawPrint, Layers3, Landmark, House, CarFront, Bike, Archive, IdCard, ShieldCheck, Mail, Boxes, Wallet, Gamepad2, Wrench, MessagesSquare, CalendarDays, Vote, ChartColumn, BookOpen, Settings, Menu, X} from 'lucide-react'
import {useState,type ReactNode} from 'react'
const nav=[
{section:'General',items:[['Dashboard','/dashboard',LayoutDashboard],['Tareas','/modulos/tareas',ListTodo]]},
{section:'Edificio',items:[['Bloques inmobiliarios','/modulos/bloques-inmobiliarios',Building2],['Residentes','/residentes',Users],['Mascotas','/modulos/mascotas',PawPrint],['Etapas','/etapas',Layers3],['Torres','/modulos/torres',Landmark],['Inmuebles','/modulos/inmuebles',House],['Estacionamientos','/modulos/estacionamientos',CarFront],['Vehículos','/modulos/vehiculos',Bike],['Depósitos','/modulos/depositos',Archive],['Personal','/modulos/personal',IdCard],['Control de acceso','/modulos/control-acceso',ShieldCheck],['Mensajería','/modulos/mensajeria',Mail]]},
{section:'Operaciones',items:[['Servicios','/modulos/servicios',Boxes],['Finanzas','/modulos/finanzas',Wallet],['Áreas comunes','/modulos/areas-comunes',Gamepad2],['Mantenimientos','/modulos/mantenimientos',Wrench],['Comunicación','/modulos/comunicacion',MessagesSquare],['Visor de eventos','/modulos/visor-de-eventos',CalendarDays],['Votaciones','/modulos/votaciones',Vote],['Reportes','/modulos/reportes',ChartColumn],['Guías y tutoriales','/modulos/guias-y-tutoriales',BookOpen],['Configuración','/configuracion-inicial',Settings]]}
] as const
export function CondoShell({children}:{children:ReactNode}){
 const pathname=usePathname();const [open,setOpen]=useState(false)
 const inside=['/dashboard','/residentes','/etapas','/configuracion-inicial','/modulos'].some(p=>pathname===p||pathname.startsWith(p+'/'))
 if(!inside)return <>{children}</>
 return <div className="min-h-screen bg-slate-50 text-slate-800">
 <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm md:px-6">
 <div className="flex items-center gap-3"><button aria-label="Abrir menú" className="rounded-lg border p-2 md:hidden" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button><div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-900 text-white"><Building2 size={21}/></div><strong>CondoAdmin Pro</strong></div>
 <span className="hidden rounded-lg border px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 sm:block">Administración de condominios</span>
 </header>
 <div className="flex"><aside className={`${open?'block':'hidden'} fixed inset-x-0 bottom-0 top-16 z-20 w-64 overflow-y-auto border-r border-slate-200 bg-white md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:shrink-0`}>
 <div className="bg-sky-900 px-5 py-5 text-sm font-semibold uppercase tracking-widest text-white">Panel de gestión</div>
 <nav className="space-y-4 px-3 py-4" aria-label="Navegación principal">{nav.map(group=><section key={group.section}><p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{group.section}</p>{group.items.map(([label,href,Icon])=><Link onClick={()=>setOpen(false)} key={href} href={href} className={`mb-0.5 flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${pathname===href?'bg-sky-600 font-semibold text-white':'text-slate-600 hover:bg-sky-50 hover:text-sky-900'}`}><Icon size={17}/>{label}</Link>)}</section>)}</nav>
 </aside><div className="min-w-0 flex-1 p-4 md:p-7">{children}</div></div></div>
}
