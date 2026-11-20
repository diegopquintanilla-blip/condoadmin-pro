import 'server-only'
import {createSupabaseServerClient} from '@/lib/supabase/server'

type Recibo={
 id:string;codigo:string|null;unidad:string|null;periodo:string|null
 fecha_emision:string;fecha_vencimiento:string|null;total:number
 saldo_inicial:number;aplicado:number;saldo:number;dias_vencido:number;excedente:number
}
type Pago={id:string;fecha_pago:string;numero_operacion:string|null;recibo:string|null;monto:number;estado:string}
export type Cierre={
 corte:string;saldo_inicial:number;emitido:number;recaudado:number;saldo_al_corte:number;vencido:number
 tramos:number[];recibos:Recibo[];pagos:Pago[]
}

export const tramos=['1–30 días','31–60 días','61–90 días','Más de 90 días']
export const indicadores=[
 ['saldo_inicial','Saldo anterior'],['emitido','Recibos emitidos'],['recaudado','Pagos validados'],
 ['saldo_al_corte','Saldo por cobrar'],['vencido','Deuda vencida'],
] as const

export async function cargarCierre(condominio:string|null,periodo:string|null){
 const mesActual=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Lima',year:'numeric',month:'2-digit'}).format(new Date())
 if(!condominio||!periodo||!/^[\da-f]{8}(?:-[\da-f]{4}){3}-[\da-f]{12}$/i.test(condominio)||
    !/^[1-9][0-9]{3}-(0[1-9]|1[0-2])$/.test(periodo)||periodo>mesActual)return {status:400} as const

 const db=await createSupabaseServerClient()
 const {data:{user},error:authError}=await db.auth.getUser()
 if(!user||authError)return {status:401} as const

 const {data:membership,error:accessError}=await db.from('condominio_usuarios').select('role')
  .eq('user_id',user.id).eq('condominio_id',condominio).eq('is_active',true).maybeSingle()
 if(accessError)return {status:500} as const
 if(!membership||!['super_admin','admin','junta'].includes(membership.role))return {status:403} as const

 const [cierre,edificio]=await Promise.all([
  db.rpc('finanzas_cierre_cobranza',{p_condominio:condominio,p_mes:periodo+'-01'}),
  db.from('condominios').select('nombre').eq('id',condominio).single(),
 ])
 if(cierre.error||edificio.error||!cierre.data||!edificio.data)return {status:500} as const
 return {status:200,data:cierre.data as Cierre,nombre:String(edificio.data.nombre),condominio,periodo} as const
}

export function generarCsv(data:Cierre,nombre:string,periodo:string){
 const filas=[
  ['Cierre de cobranza',nombre,periodo],['Fecha de corte',data.corte],
  ['Base del reporte','Pagos con estado validado al consultar, aplicados según fecha de pago.'],
  ['Alcance','Sin cotejo bancario. El reporte puede cambiar con validaciones posteriores.'],
  [],['Indicador','Importe (PEN)'],
  ...indicadores.map(([key,label])=>[label,data[key]]),
  ...tramos.map((label,i)=>[label,data.tramos[i]]),
  [],['ID recibo','Código','Unidad','Periodo','Emisión','Vencimiento','Total','Saldo anterior','Abonos al corte','Saldo al corte','Días vencido','Excedente'],
  ...data.recibos.map(r=>[r.id,r.codigo,r.unidad,r.periodo,r.fecha_emision,r.fecha_vencimiento,r.total,r.saldo_inicial,r.aplicado,r.saldo,r.dias_vencido,r.excedente]),
  [],['ID pago','Fecha de pago','Referencia','Recibo','Importe','Estado'],
  ...data.pagos.map(p=>[p.id,p.fecha_pago,p.numero_operacion,p.recibo,p.monto,p.estado]),
 ]
 return '\uFEFF'+filas.map(fila=>fila.map(valor=>{
  if(typeof valor==='number')return String(valor)
  const texto=String(valor??'')
  const seguro=/^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/.test(texto)?"'"+texto:texto
  return '"'+seguro.replaceAll('"','""')+'"'
 }).join(',')).join('\r\n')
}
