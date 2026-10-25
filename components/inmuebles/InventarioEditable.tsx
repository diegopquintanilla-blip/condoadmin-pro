'use client'
import {useMemo,useState} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {Search, Pencil, Trash2, X} from 'lucide-react'
type Item={id:string;condominio_id:string;codigo:string;tipo:string;etapa:string|null;torre:string|null;bloque:string|null;estado:string}
type Member={condominio_id:string;role:string}
const options=['lote','casa','departamento','local','estacionamiento','deposito']
export function InventarioEditable({items,memberships}:{items:Item[];memberships:Member[]}){
 const router=useRouter()
 const [search,setSearch]=useState('')
 const [edit,setEdit]=useState<Item|null>(null)
 const [target,setTarget]=useState<Item|null>(null)
 const [busy,setBusy]=useState(false)
 const [notice,setNotice]=useState('')
 const writable=new Set(memberships.filter(x=>['admin','super_admin','junta'].includes(x.role)).map(x=>x.condominio_id))
 const deletable=new Set(memberships.filter(x=>['admin','super_admin'].includes(x.role)).map(x=>x.condominio_id))
 const visible=useMemo(()=>items.filter(x=>[x.codigo,x.tipo,x.etapa,x.torre,x.bloque].some(y=>(y??'').toLowerCase().includes(search.toLowerCase().trim()))),[items,search])
 async function save(){
  if(!edit||!writable.has(edit.condominio_id)||!edit.codigo.trim()||edit.codigo.length>70)return
  setBusy(true);setNotice('')
  const {data,error}=await supabase.from('inmuebles').update({codigo:edit.codigo.trim(),tipo:edit.tipo,etapa:edit.etapa?.trim()||null,torre:edit.torre?.trim()||null,bloque:edit.bloque?.trim()||null}).eq('id',edit.id).eq('condominio_id',edit.condominio_id).select('id').single()
  setBusy(false)
  if(error||!data){setNotice('No se pudo guardar. Comprueba permisos o código duplicado.');return}
  setEdit(null);setNotice('Cambios guardados correctamente.');router.refresh()
 }
 async function remove(){
  if(!target||!deletable.has(target.condominio_id))return
  setBusy(true);setNotice('')
  const {data,error}=await supabase.from('inmuebles').delete().eq('id',target.id).eq('condominio_id',target.condominio_id).select('id').single()
  setBusy(false)
  if(error||!data){setNotice('No se pudo eliminar. Puede tener registros relacionados o faltan permisos.');return}
  setTarget(null);setNotice('Inmueble eliminado.');router.refresh()
 }
 return <section className="overflow-hidden rounded-2xl border bg-white shadow-sm"><div className="flex flex-wrap items-center justify-between gap-4 p-6"><div><h2 className="text-xl font-bold">Inventario de inmuebles</h2><p className="text-sm text-slate-500">{visible.length} de {items.length} registros mostrados</p></div><label className="flex items-center gap-2 rounded-xl border px-3 py-2"><Search size={17}/><input aria-label="Buscar inmuebles" placeholder="Buscar código, bloque, etapa…" value={search} onChange={e=>setSearch(e.target.value)} className="max-w-60 outline-none"/></label></div>{notice&&<p role="status" className="mx-6 mb-3 rounded-lg bg-sky-50 p-3 text-sm text-sky-900">{notice}</p>}<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50"><tr>{['Código','Tipo','Etapa','Torre','Bloque','Estado','Acciones'].map(t=><th key={t} className="p-4">{t}</th>)}</tr></thead><tbody>{visible.map(x=><tr key={x.id} className="border-t"><td className="p-4 font-semibold">{x.codigo}</td><td className="p-4">{x.tipo}</td><td className="p-4">{x.etapa||'—'}</td><td className="p-4">{x.torre||'—'}</td><td className="p-4">{x.bloque||'—'}</td><td className="p-4">{x.estado}</td><td className="p-4"><div className="flex gap-2">{writable.has(x.condominio_id)&&<button aria-label={'Editar '+x.codigo} onClick={()=>setEdit({...x})} className="rounded-lg border p-2 text-sky-800"><Pencil size={16}/></button>}{deletable.has(x.condominio_id)&&<button aria-label={'Eliminar '+x.codigo} onClick={()=>setTarget(x)} className="rounded-lg border p-2 text-red-700"><Trash2 size={16}/></button>}</div></td></tr>)}</tbody></table></div>{!visible.length&&<p className="p-6 text-sm text-slate-500">No hay inmuebles coincidentes.</p>}
 {edit&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section role="dialog" aria-modal="true" aria-label="Editar inmueble" className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-xl"><div className="flex justify-between"><h3 className="text-xl font-bold">Editar inmueble</h3><button aria-label="Cerrar" onClick={()=>setEdit(null)}><X/></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{(['codigo','tipo','etapa','torre','bloque'] as const).map(k=><label key={k} className="text-sm font-semibold capitalize">{k}{k==='tipo'?<select className="mt-1 w-full rounded-lg border p-3" value={edit.tipo} onChange={e=>setEdit({...edit,tipo:e.target.value})}>{options.map(o=><option key={o}>{o}</option>)}</select>:<input maxLength={k==='codigo'?70:100} className="mt-1 w-full rounded-lg border p-3" value={edit[k]??''} onChange={e=>setEdit({...edit,[k]:e.target.value})}/>}</label>)}</div><div className="mt-6 flex gap-3"><button disabled={busy||!edit.codigo.trim()} onClick={save} className="rounded-lg bg-sky-800 px-5 py-3 text-white disabled:opacity-50">Guardar cambios</button><button onClick={()=>setEdit(null)} className="rounded-lg border px-5 py-3">Cancelar</button></div></section></div>}
 {target&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"><section role="alertdialog" aria-modal="true" aria-label="Confirmar eliminación" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"><h3 className="text-lg font-bold">¿Eliminar {target.codigo}?</h3><p className="mt-3 text-sm text-slate-600">Esta acción elimina el inmueble. Si tiene registros relacionados, la base de datos puede impedir la operación.</p><div className="mt-6 flex gap-3"><button disabled={busy} onClick={remove} className="rounded-lg bg-red-700 px-5 py-3 text-white disabled:opacity-50">Confirmar eliminación</button><button onClick={()=>setTarget(null)} className="rounded-lg border px-5 py-3">Cancelar</button></div></section></div>}
 </section>
}
