'use client'
import {useState,type FormEvent} from 'react'
import {useRouter} from 'next/navigation'
import {supabase} from '@/lib/supabase/client'
import {PawPrint} from 'lucide-react'
type Unit={id:string;codigo:string}
export function CrearMascota({condominioId,inmuebles}:{condominioId:string;inmuebles:Unit[]}){
 const router=useRouter()
 const [nombre,setNombre]=useState(''),[especie,setEspecie]=useState('perro'),[raza,setRaza]=useState(''),[color,setColor]=useState(''),[inmueble,setInmueble]=useState('')
 const [busy,setBusy]=useState(false),[notice,setNotice]=useState('')
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault()
  if(!nombre.trim()||nombre.trim().length>100||[especie,raza,color].some(s=>s.length>100)||Boolean(inmueble&&!inmuebles.some(x=>x.id===inmueble))){setNotice('Revisa los datos y la unidad seleccionada.');return}
  setBusy(true);setNotice('')
  const {error}=await supabase.from('mascotas').insert({condominio_id:condominioId,nombre:nombre.trim(),especie:especie.trim(),raza:raza.trim()||null,color:color.trim()||null,inmueble_id:inmueble||null})
  setBusy(false)
  if(error){setNotice('No fue posible registrar la mascota. Comprueba tus permisos y los datos.');return}
  setNombre('');setRaza('');setColor('');setInmueble('');setNotice('Mascota registrada.');router.refresh()
 }
 return <form onSubmit={save} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-bold"><PawPrint className="text-sky-700"/> Registrar mascota</h2><p className="mt-2 text-sm text-slate-500">Registro real con asociación opcional a un inmueble.</p><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-semibold">Nombre *<input required maxLength={100} value={nombre} onChange={e=>setNombre(e.target.value)} className="mt-2 w-full rounded-xl border p-3" placeholder="Nombre de la mascota"/></label><label className="text-sm font-semibold">Especie<select value={especie} onChange={e=>setEspecie(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="perro">Perro</option><option value="gato">Gato</option><option value="ave">Ave</option><option value="otro">Otro</option></select></label><label className="text-sm font-semibold">Raza<input maxLength={100} value={raza} onChange={e=>setRaza(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Color<input maxLength={100} value={color} onChange={e=>setColor(e.target.value)} className="mt-2 w-full rounded-xl border p-3"/></label><label className="text-sm font-semibold">Inmueble<select value={inmueble} onChange={e=>setInmueble(e.target.value)} className="mt-2 w-full rounded-xl border p-3"><option value="">Sin asignar</option>{inmuebles.map(x=><option key={x.id} value={x.id}>{x.codigo}</option>)}</select></label></div><button disabled={busy} className="mt-5 rounded-xl bg-sky-800 px-5 py-3 font-bold text-white disabled:opacity-50">{busy?'Guardando…':'Guardar mascota'}</button>{notice&&<p role="status" className="mt-3 text-sm">{notice}</p>}</form>
}