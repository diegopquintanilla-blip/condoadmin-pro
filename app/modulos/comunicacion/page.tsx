import {redirect} from 'next/navigation'
export default async function ComunicacionPage({searchParams}:{searchParams:Promise<{condominio?:string}>}){
 const {condominio}=await searchParams
 const params=new URLSearchParams()
 if(condominio)params.set('condominio',condominio)
 redirect('/modulos/mensajeria'+(params.size?'?'+params.toString():''))
}
