'use client'
import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {Building2, LayoutDashboard, ListTodo, Users, PawPrint, Layers3, Landmark, House, CarFront, Bike, Archive, IdCard, ShieldCheck, Mail, Boxes, Wallet, Gamepad2, Wrench, MessagesSquare, CalendarDays, Vote, ChartColumn, BookOpen, LifeBuoy, Settings, Menu, X} from 'lucide-react'
import {useState,type ReactNode} from 'react'
import {SessionHeader} from '@/components/SessionHeader'
const nav=[
{section:'General',items:[['Dashboard','/dashboard',LayoutDashboard],['Tareas','/operaciones/tareas',ListTodo]]},
{section:'Edificio',items:[['Bloques inmobiliarios','/bloques-inmobiliarios',Building2],['Residentes','/residentes',Users],['Mascotas','/modulos/mascotas',PawPrint],['Etapas','/etapas',Layers3],['Torres','/modulos/torres',Landmark],['Inmuebles','/modulos/inmuebles',House],['Estacionamientos','/modulos/estacionamientos',CarFront],['Vehículos','/modulos/vehiculos',Bike],['Depósitos','/modulos/depositos',Archive],['Personal','/modulos/personal',IdCard],['Control de acceso','/modulos/control-acceso',ShieldCheck],['Mensajería','/modulos/mensajeria',Mail]]},
{section:'Operaciones',items:[['Servicios','/modulos/servicios',Boxes],['Finanzas','/finanzas',Wallet],['Áreas comunes','/modulos/areas-comunes',Gamepad2],['Mantenimientos','/operaciones/incidencias',Wrench],['Comunicación','/operaciones/comunicados',MessagesSquare],['Visor de eventos','/modulos/visor-de-eventos',CalendarDays],['Votaciones','/modulos/votaciones',Vote],['Reportes','/reportes',ChartColumn],['Guías y tutoriales','/modulos/guias-y-tutoriales',BookOpen],['Soporte','/modulos/soporte',LifeBuoy],['Configuración','/configuracion-inicial',Settings]]}
] as const
export function CondoShell({children}:{children:ReactNode}){
 const pathname=usePathname();const [open,setOpen]=useState(false)
 const inside=['/dashboard','/residentes','/etapas','/configuracion-inicial','/modulos','/finanzas','/bloques-inmobiliarios','/operaciones','/reportes'].some(p=>pathname===p||pathname.startsWith(p+'/'))
 if(!inside)return <>{children}</>
 return <div className="min-h-screen bg-[#f0f4f9] text-slate-800">
 <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-[0_4px_24px_-18px_rgba(8,40,75,.4)] backdrop-blur md:px-7">
 <div className="flex items-center gap-3"><button aria-label="Abrir menú" className="rounded-lg border p-2 md:hidden" onClick={()=>setOpen(!open)}>{open?<X size={19}/>:<Menu size={19}/>}</button><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-700 to-[#092d55] text-white shadow-lg"><Building2 size={21}/></div><div className="leading-tight"><strong className="block text-[15px] font-extrabold tracking-tight text-[#0a3154]">CondoAdmin Pro</strong><span className="block text-[10px] font-semibold uppercase tracking-widest text-slate-400">Plataforma residencial</span></div></div>
 <SessionHeader/>
 </header>
 <div className="flex"><aside className={`${open?'block':'hidden'} fixed inset-x-0 bottom-0 top-16 z-20 w-64 overflow-y-auto border-r border-slate-200 bg-white shadow-[10px_0_36px_-25px_rgba(8,40,75,.35)] md:sticky md:top-16 md:block md:h-[calc(100vh-4rem)] md:shrink-0`}>
 <div className="bg-gradient-to-r from-[#092c50] to-[#17618d] px-5 py-5 text-xs font-bold uppercase tracking-[.2em] text-white">Panel de gestión</div>
 <nav className="space-y-4 px-3 py-4" aria-label="Navegación principal">{nav.map(group=><section key={group.section}><p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">{group.section}</p>{group.items.map(([label,href,Icon])=><Link onClick={()=>setOpen(false)} key={href} href={href} className={`mb-0.5 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${(pathname===href||pathname.startsWith(href+'/'))?'bg-gradient-to-r from-[#0a4879] to-[#1176a3] font-semibold text-white shadow-md shadow-sky-900/15':'text-slate-600 hover:bg-sky-50 hover:text-sky-900'}`}><Icon size={17}/>{label}</Link>)}</section>)}</nav>
 </aside><div className="min-w-0 flex-1 p-4 md:p-7 xl:p-9">{children}</div></div></div>
}
