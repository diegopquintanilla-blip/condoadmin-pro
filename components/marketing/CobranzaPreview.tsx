import {ArrowDownRight, Bell, Building2, Check, Clock3, WalletCards} from 'lucide-react'

const filas=[
  {unidad:'Torre A · 304',periodo:'2 recibos vencidos',saldo:'S/ 640',estado:'Por contactar',color:'bg-amber-50 text-amber-900',Icon:Bell,contactar:true},
  {unidad:'Torre B · 502',periodo:'1 recibo vencido',saldo:'S/ 320',estado:'Aviso registrado',color:'bg-violet-50 text-violet-800',Icon:Check,contactar:false},
  {unidad:'Torre A · 108',periodo:'1 recibo con abono',saldo:'S/ 180',estado:'Retomar hoy',color:'bg-emerald-50 text-emerald-900',Icon:Clock3,contactar:true},
]

export function CobranzaPreview({soloPendientes=false}:{soloPendientes?:boolean}){
  const visibles=soloPendientes?filas.filter(fila=>fila.contactar):filas
  return <div className="overflow-hidden rounded-2xl border border-[#ded9ec] bg-white text-[#231a39] shadow-[0_25px_70px_-24px_rgba(41,24,78,.42)]">
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#ede9f5] px-4 py-3 sm:px-5">
      <span className="inline-flex items-center gap-2 text-sm font-bold"><Building2 size={16} className="text-[#5a3bc1]"/> Residencial Los Olivos</span>
      <span className="rounded-full bg-[#f0ebff] px-2.5 py-1 text-xs font-semibold text-[#49339a]">Datos de ejemplo</span>
    </div>
    <div className="bg-[#faf8ff] p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2">
        <div><p className="text-xs font-semibold text-[#625676]">Finanzas</p><p className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">Cartera vencida</p></div>
        <WalletCards size={24} className="text-[#694bd3]" aria-hidden="true"/>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
        <div className="rounded-xl border border-[#ede9f5] bg-white p-3">
          <p className="text-xs font-medium text-[#625676]">Saldo vencido</p>
          <p className="mt-1 text-lg font-bold tabular-nums sm:text-xl">S/ 1,140</p>
        </div>
        <div className="rounded-xl border border-[#e0d7ff] bg-[#f0ebff] p-3">
          <p className="text-xs font-medium text-[#49339a]">Por contactar hoy</p>
          <p className="mt-1 text-lg font-bold tabular-nums text-[#49339a] sm:text-xl">2 unidades</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-[#ede9f5] bg-white">
        <div className="flex items-center gap-2 border-b border-[#ede9f5] px-3 py-2.5 text-xs font-bold text-[#625676]"><ArrowDownRight size={14} aria-hidden="true"/> Seguimiento por unidad</div>
        <ul className="divide-y divide-[#ede9f5]">
          {visibles.map(fila=>{
            const {Icon}=fila
            return <li key={fila.unidad} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-2 gap-y-1 px-3 py-2.5 min-[400px]:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-x-3">
              <div><p className="text-xs font-bold sm:text-sm">{fila.unidad}</p><p className="text-[11px] text-[#625676] sm:text-xs">{fila.periodo}</p></div>
              <span className="text-right text-xs font-bold tabular-nums sm:text-sm">{fila.saldo}</span>
              <span className={'col-span-2 inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold min-[400px]:col-auto '+fila.color}><Icon size={12} aria-hidden="true"/>{fila.estado}</span>
            </li>
          })}
        </ul>
      </div>
    </div>
  </div>
}
