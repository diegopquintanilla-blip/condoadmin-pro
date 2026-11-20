import {NextRequest} from 'next/server'
import {cargarCierre,generarCsv} from '@/lib/finanzas/cierre'

export async function GET(request:NextRequest){
 const params=request.nextUrl.searchParams
 const result=await cargarCierre(params.get('condominio'),params.get('periodo'))
 const headers={'Cache-Control':'private, no-store'}
 if(result.status!==200)return new Response('No se pudo exportar el cierre.',{status:result.status,headers})
 return new Response(generarCsv(result.data,result.nombre,result.periodo),{
  headers:{...headers,'Content-Type':'text/csv; charset=utf-8',
   'Content-Disposition':`attachment; filename="cierre-cobranza-${result.periodo}.csv"`},
 })
}
