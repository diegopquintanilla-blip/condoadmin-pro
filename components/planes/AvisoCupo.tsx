const correoComercial='diego.pquintanilla@gmail.com'
const enlaceComercial='mailto:'+correoComercial+'?subject='+encodeURIComponent('Ampliar mi plan de CondominPro')

export function AvisoCupo({limite=10}:{limite?:number}){
 return <aside className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
  <p className="font-bold">Alcanzaste el límite de {limite} acciones de tu plan.</p>
  <p className="mt-1">Puedes seguir consultando tus datos. Para crear, editar o eliminar registros, contrata un plan con mayor capacidad.</p>
  <p className="mt-2">Para coordinar la contratación, escribe a <a href={enlaceComercial} className="font-semibold underline">{correoComercial}</a>.</p>
 </aside>
}
