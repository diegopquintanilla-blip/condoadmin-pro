'use client'
import {useMemo,useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
type Vote={id:string;titulo:string;descripcion:string|null;fecha_cierre:string;estado:string}
type Choice='si'|'no'|'abstencion'
const choices:{name:string;v:Choice}[]=[{name:'Sí',v:'si'},{name:'No',v:'no'},{name:'Abstención',v:'abstencion'}]
const formatDate=(date:string)=>new Date(date).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'medium',timeStyle:'short'})
export function VotacionesGestion({condominio,votaciones,misVotos,puedeCrear}:{condominio:string;votaciones:Vote[];misVotos:{votacion_id:string;opcion:string}[];puedeCrear:boolean}){
 const router=useRouter()
 const [titulo,setTitulo]=useState(''),[descripcion,setDescripcion]=useState(''),[cierre,setCierre]=useState('')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState(''),[filter,setFilter]=useState<'todas'|'abiertas'|'cerradas'|'participadas'>('todas')
 const [search,setSearch]=useState(''),[pending,setPending]=useState<{id:string;titulo:string;opcion:Choice}|null>(null)
 const now=Date.now()
 const voted=new Set(misVotos.map(v=>v.votacion_id))
 const isOpen=(v:Vote)=>v.estado==='abierta'&&new Date(v.fecha_cierre).getTime()>now
 const counts={total:votaciones.length,open:votaciones.filter(isOpen).length,participated:votaciones.filter(v=>voted.has(v.id)).length}
 const shown=useMemo(()=>votaciones.filter(v=>{
  const match=v.titulo.toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))||(v.descripcion||'').toLocaleLowerCase('es').includes(search.trim().toLocaleLowerCase('es'))
  return match&&(filter==='todas'||(filter==='abiertas'&&isOpen(v))||(filter==='cerradas'&&!isOpen(v))||(filter==='participadas'&&voted.has(v.id)))
 }),[votaciones,search,filter,misVotos,now])
 async function create(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!puedeCrear||titulo.trim().length<5||!cierre)return
  setBusy(true);setNotice('')
  const fecha=new Date(cierre)
  if(!Number.isFinite(fecha.getTime())||fecha.getTime()<=Date.now()){setNotice('Selecciona una fecha y hora futuras.');setBusy(false);return}
  const {error}=await supabase.from('votaciones').insert({condominio_id:condominio,titulo:titulo.trim(),descripcion:descripcion.trim()||null,fecha_cierre:fecha.toISOString()})
  setBusy(false)
  if(error){setNotice('No se pudo crear la votación. Verifica tus permisos e inténtalo nuevamente.');return}
  setTitulo('');setDescripcion('');setCierre('');setNotice('Votación creada correctamente.');router.refresh()
 }
 async function confirmVote(){
  if(!pending||busy||voted.has(pending.id))return
  const {id,opcion}=pending;setBusy(true);setNotice('')
  const {error}=await supabase.from('votos').insert({condominio_id:condominio,votacion_id:id,opcion})
  setBusy(false);setPending(null)
  if(error){setNotice('No se pudo registrar el voto. Es posible que ya hayas participado o que la votación esté cerrada.');return}
  setNotice('Tu voto se registró correctamente.');router.refresh()
 }
 return <div className="space-y-6">
  <div className="grid gap-3 sm:grid-cols-3">
   {[{label:'Total de propuestas',value:counts.total},{label:'Abiertas',value:counts.open},{label:'Mis participaciones',value:counts.participated}].map(item=><div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{item.label}</p><p className="mt-2 text-3xl font-extrabold text-slate-900">{item.value}</p></div>)}
  </div>
  {puedeCrear?<form onSubmit={create} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-xl font-bold">Crear votación</h2><p className="mt-1 text-sm text-slate-500">Registra una consulta para los usuarios autorizados de este condominio.</p><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-sm font-semibold">Título<input required minLength={5} maxLength={180} value={titulo} onChange={e=>setTitulo(e.target.value)} placeholder="Ej. Aprobación de presupuesto" className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Cierre (fecha y hora)<input required type="datetime-local" value={cierre} onChange={e=>setCierre(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label></div><label className="mt-4 block text-sm font-semibold">Descripción<textarea maxLength={3000} value={descripcion} onChange={e=>setDescripcion(e.target.value)} placeholder="Explica el objetivo de la consulta" className="mt-2 w-full rounded-xl border p-3" rows={3}/></label><button disabled={busy} className="mt-4 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">Crear votación</button></form>:null}
  {notice?<p role="status" className="rounded-xl border border-sky-100 bg-sky-50 p-4 text-sm text-sky-950">{notice}</p>:null}
  <section className="space-y-4" aria-label="Propuestas registradas">
   <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><h2 className="text-xl font-bold">Propuestas registradas</h2><div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="buscar-votacion">Buscar propuestas</label><input id="buscar-votacion" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar votación" className="rounded-xl border bg-white px-3 py-2 text-sm"/><label className="sr-only" htmlFor="filtro-votacion">Filtrar propuestas</label><select id="filtro-votacion" value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="rounded-xl border bg-white px-3 py-2 text-sm"><option value="todas">Todas</option><option value="abiertas">Abiertas</option><option value="cerradas">Cerradas</option><option value="participadas">Mis votos</option></select></div></div>
   {shown.map(v=>{const existing=misVotos.find(x=>x.votacion_id===v.id);const open=isOpen(v);return <article key={v.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><h3 className="text-lg font-bold text-slate-950">{v.titulo}</h3><span className={'rounded-full px-3 py-1 text-xs font-bold '+(open?'bg-emerald-50 text-emerald-800':'bg-slate-100 text-slate-700')}>{open?'Abierta':'Cerrada'}</span></div><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{v.descripcion||'Sin descripción'}</p><p className="mt-3 text-xs text-slate-500">Cierre: {formatDate(v.fecha_cierre)} (hora de Perú)</p>{existing?<p className="mt-4 rounded-xl bg-sky-50 p-3 text-sm font-semibold text-sky-800">Participación registrada: {choices.find(c=>c.v===existing.opcion)?.name||existing.opcion}</p>:open?<div className="mt-4"><p className="mb-2 text-sm font-semibold">Selecciona tu voto</p><div className="flex flex-wrap gap-2">{choices.map(x=><button key={x.v} type="button" disabled={busy} onClick={()=>setPending({id:v.id,titulo:v.titulo,opcion:x.v})} className="rounded-xl border border-sky-300 bg-sky-50 px-5 py-2 font-semibold text-sky-900 hover:bg-sky-100 disabled:opacity-50">{x.name}</button>)}</div></div>:<p className="mt-4 text-sm text-slate-500">Esta consulta ya no recibe votos.</p>}</article>})}
   {!shown.length?<p className="rounded-xl bg-white p-6 text-sm text-slate-500">{votaciones.length?'No hay propuestas que coincidan con los filtros.':'No hay votaciones creadas.'}</p>:null}
  </section>
  {pending?<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4" role="presentation"><div role="dialog" aria-modal="true" aria-labelledby="confirmar-voto" className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl"><h2 id="confirmar-voto" className="text-xl font-bold">Confirmar voto</h2><p className="mt-3 text-sm text-slate-700">Propuesta: <strong>{pending.titulo}</strong></p><p className="mt-2 text-sm text-slate-700">Tu opción: <strong>{choices.find(c=>c.v===pending.opcion)?.name}</strong></p><p className="mt-3 text-xs text-amber-800">Revisa tu elección antes de registrarla. Esta pantalla no permite modificar votos ya emitidos.</p><div className="mt-5 flex justify-end gap-2"><button type="button" disabled={busy} onClick={()=>setPending(null)} className="rounded-xl border px-4 py-2 font-semibold">Cancelar</button><button type="button" disabled={busy} onClick={confirmVote} className="rounded-xl bg-sky-800 px-4 py-2 font-bold text-white disabled:opacity-50">{busy?'Registrando...':'Confirmar voto'}</button></div></div></div>:null}
  <p className="text-sm text-amber-900">Consulta digital inicial: un voto por usuario autenticado. No constituye por sí sola una elección formal ni aplica ponderación por unidad inmobiliaria, quórum o poderes de representación.</p>
 </div>
}