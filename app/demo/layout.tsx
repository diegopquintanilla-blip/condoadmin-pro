import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Demo gratuita del software para condominios',
  description:
    'Prueba la demo pública de CondominPro sin registro. Explora el panel de residentes, pagos e incidencias de una plataforma para administrar edificios y condominios.',
  alternates: { canonical: '/demo' },
}

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return children
}
