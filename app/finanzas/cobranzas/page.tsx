import Link from 'next/link'
import {redirect} from 'next/navigation'
import {SeguimientoCobranza,type Contacto} from '@/components/finanzas/SeguimientoCobranza'
import {CopiarRecordatorio} from '@/components/finanzas/CopiarRecordatorio'
import {createSupabaseServerClient} from '@/lib/supabase/server'

const moneda=new Intl.NumberFormat('es-PE',{style:'currency',currency:'PEN'})
const fechaLima=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'})
const rolesCobranza=['super_admin','admin','junta']

type Recibo={id:string;inmueble_id:string|null;periodo:string|null;total:number;fecha_vencimiento:string}
type Unidad={id:string;codigo:string;saldo:number;vencimiento:string;recibos:{id:string;periodo:string|null;saldo:number}[]}

async function consultarDeuda(db:Awaited<ReturnType<typeof createSupabaseServerClient>>,condominio:string,hoy:string){
  const unidades=new Map<string,Unidad>()
  let sinUnidad=0

  for(let offset=0;;offset+=100){
    const {data:recibos,error}=await db.from('recibos')
      .select('id,inmueble_id,periodo,total,fecha_vencimiento')
      .eq('condominio_id',condominio).neq('estado','anulado')
      .lt('fecha_vencimiento',hoy).order('id').range(offset,offset+99)
    if(error)throw error
    if(!recibos.length)break

    const ids=recibos.map(r=>r.id)
    const inmuebles=[...new Set(recibos.flatMap(r=>r.inmueble_id?[r.inmueble_id]:[]))]
    const codigos=inmuebles.length?await db.from('inmuebles').select('id,codigo')
      .eq('condominio_id',condominio).in('id',inmuebles):{data:[],error:null}
    if(codigos.error)throw codigos.error
    const codigoPorId=new Map((codigos.data??[]).map(i=>[i.id,i.codigo]))
    const pagado=new Map<string,number>()

    for(let inicio=0;;inicio+=500){
      const {data:pagos,error}=await db.from('pagos').select('recibo_id,monto')
        .eq('condominio_id',condominio).eq('estado','validado').in('recibo_id',ids)
        .order('id').range(inicio,inicio+499)
      if(error)throw error
      for(const pago of pagos){
        pagado.set(pago.recibo_id,(pagado.get(pago.recibo_id)??0)+Math.round(Number(pago.monto)*100))
      }
      if(pagos.length<500)break
    }

    for(const recibo of recibos as Recibo[]){
      const saldo=Math.round(Number(recibo.total)*100)-(pagado.get(recibo.id)??0)
      if(saldo<=0)continue
      const codigo=recibo.inmueble_id&&codigoPorId.get(recibo.inmueble_id)
      if(!recibo.inmueble_id||!codigo){
        sinUnidad+=saldo
        continue
      }
      const unidad:Unidad=unidades.get(recibo.inmueble_id)??{
        id:recibo.inmueble_id,codigo,saldo:0,vencimiento:recibo.fecha_vencimiento,recibos:[]
      }
      unidad.saldo+=saldo
      if(recibo.fecha_vencimiento<unidad.vencimiento)unidad.vencimiento=recibo.fecha_vencimiento
      unidad.recibos.push({id:recibo.id,periodo:recibo.periodo,saldo})
      unidades.set(unidad.id,unidad)
    }
    if(recibos.length<100)break
  }

  return {unidades:[...unidades.values()].sort((a,b)=>b.saldo-a.saldo||a.codigo.localeCompare(b.codigo,'es')),sinUnidad}
}

async function consultarContactos(db:Awaited<ReturnType<typeof createSupabaseServerClient>>,condominio:string,unidades:Unidad[]){
  const contactos=new Map<string,Contacto>()
  for(let offset=0;offset<unidades.length;offset+=100){
    const ids=unidades.slice(offset,offset+100).map(u=>u.id)
    const {data,error}=await db.from('cobranza_ultimo_contacto')
      .select('inmueble_id,canal,proximo_contacto,nota,registrado_at')
      .eq('condominio_id',condominio).in('inmueble_id',ids)
    if(error)throw error
    for(const contacto of data as Contacto[])contactos.set(contacto.inmueble_id,contacto)
  }
  return contactos
}

export default async function CobranzasPage({searchParams}:{searchParams:Promise<{condominio?:string;q?:string;seguimiento?:string}>}){
  const db=await createSupabaseServerClient()
  const {data:{user}}=await db.auth.getUser()
  if(!user)redirect('/login')
  const {data:members,error}=await db.from('condominio_usuarios').select('condominio_id,role')
    .eq('user_id',user.id).eq('is_active',true)
  if(error)return <p role="alert">No se pudieron verificar los permisos de cobranza.</p>

  const ids=(members??[]).filter(m=>rolesCobranza.includes(m.role)).map(m=>String(m.condominio_id))
  const params=await searchParams
  const condominio=params.condominio??ids[0]
  if(!condominio||!ids.includes(condominio))redirect('/finanzas')
  const hoy=fechaLima.format(new Date())
  const datos=await consultarDeuda(db,condominio,hoy).catch(()=>null)
  const busqueda=typeof params.q==='string'?params.q.trim():''
  const contactos=datos?await consultarContactos(db,condominio,datos.unidades).catch(()=>null):null
  const filtro=params.seguimiento==='pendientes'&&contactos?'pendientes':'todos'
  function requiereContacto(u:Unidad){
    const contacto=contactos?.get(u.id)
    return !contacto || Boolean(contacto.proximo_contacto&&contacto.proximo_contacto<=hoy)
  }
  const pendientes=contactos?datos?.unidades.filter(requiereContacto).length:null
  const visibles=datos?.unidades.filter(u=>
    u.codigo.toLocaleLowerCase('es').includes(busqueda.toLocaleLowerCase('es')) &&
    (filtro==='todos'||requiereContacto(u))
  )??[]
  const total=datos?.unidades.reduce((s,u)=>s+u.saldo,datos.sinUnidad)

  return <main className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-[28px] bg-gradient-to-r from-[#0b2446] to-[#087c9e] p-8 text-white">
      <Link href={'/finanzas?condominio='+encodeURIComponent(condominio)} className="text-sm text-sky-100">← Finanzas</Link>
      <h1 className="mt-4 text-3xl font-bold">Cobranzas</h1>
      <p className="mt-2 text-sky-100">Revisa el saldo vencido por unidad y prepara recordatorios de pago.</p>
    </header>
    {!datos?<p role="alert" className="rounded-xl bg-red-50 p-5 text-red-800">No se pudo calcular la cartera vencida. Vuelve a cargar la página.</p>:<>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border bg-white p-5"><p>Saldo vencido del condominio</p><strong className="text-2xl">{moneda.format((total??0)/100)}</strong></div>
        <div className="rounded-2xl border bg-white p-5"><p>Unidades con deuda vencida</p><strong className="text-2xl">{datos.unidades.length}</strong></div>
        <div className="rounded-2xl border bg-white p-5"><p>Por contactar hoy</p><strong className="text-2xl">{pendientes??'—'}</strong><p className="text-sm text-slate-500">Sin contacto previo o con seguimiento programado para hoy o antes.</p></div>
      </div>
      {!contactos&&<p role="alert" className="rounded-xl bg-amber-50 p-4">No se pudo cargar el seguimiento. Los saldos vencidos siguen disponibles.</p>}
      {datos.sinUnidad>0&&<p className="rounded-xl bg-amber-50 p-4 text-amber-900">Hay {moneda.format(datos.sinUnidad/100)} en recibos vencidos sin unidad identificable. Revisa su asignación en Finanzas.</p>}
      <form key={JSON.stringify([condominio,busqueda,filtro])} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="condominio" value={condominio}/>
        <label className="grid gap-1 text-sm font-medium">Buscar unidad
          <input name="q" defaultValue={busqueda} className="rounded-lg border bg-white px-3 py-2" placeholder="Código de unidad"/>
        </label>
        {contactos&&<label className="grid gap-1 text-sm font-medium">Seguimiento
          <select name="seguimiento" defaultValue={filtro} className="rounded-lg border bg-white px-3 py-2">
            <option value="todos">Todas las unidades con deuda</option>
            <option value="pendientes">Por contactar hoy</option>
          </select>
        </label>}
        <button className="rounded-lg bg-sky-800 px-4 py-2 font-semibold text-white">Aplicar filtros</button>
        {(busqueda||filtro!=='todos')&&<Link className="px-3 py-2 text-sky-800 underline" href={'?condominio='+encodeURIComponent(condominio)}>Ver todas</Link>}
      </form>
      {visibles.length===0?<p className="rounded-xl border bg-white p-5">{busqueda||filtro==='pendientes'?'Ninguna unidad coincide con los filtros.':'No hay unidades con saldo vencido.'}</p>:
        <div className="overflow-x-auto rounded-2xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50"><tr>{['Unidad','Vencimiento más antiguo','Saldo vencido','Recibos','Recordatorio','Seguimiento'].map(t=><th key={t} scope="col" className="p-4">{t}</th>)}</tr></thead>
            <tbody>{visibles.map(u=><tr key={u.id} className="border-t align-top">
              <th scope="row" className="p-4 font-semibold">{u.codigo}</th>
              <td className="p-4">{u.vencimiento}</td>
              <td className="p-4 font-semibold">{moneda.format(u.saldo/100)}</td>
              <td className="p-4"><details><summary className="cursor-pointer text-sky-800">{u.recibos.length} con saldo</summary><ul className="mt-2 space-y-1">{u.recibos.map(r=><li key={r.id}>{r.periodo??'Sin periodo'} · {moneda.format(r.saldo/100)}</li>)}</ul></details></td>
              <td className="p-4"><CopiarRecordatorio mensaje={`Hola. Al ${hoy}, la unidad ${u.codigo} registra un saldo vencido de ${moneda.format(u.saldo/100)} en ${u.recibos.length} recibo(s). Si ya realizaste el pago, por favor comparte el comprobante con la administración para revisarlo. Gracias.`}/></td>
              <td className="p-4">{contactos?<SeguimientoCobranza key={condominio+u.id} condominio={condominio} inmueble={u.id} contacto={contactos.get(u.id)} hoy={hoy}/>: '—'}</td>
            </tr>)}</tbody>
          </table>
        </div>}
    </>}
  </main>
}
