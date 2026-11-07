import type { Metadata } from 'next'
import './globals.css'
import { CondoShell } from '@/components/CondoShell'

export const metadata: Metadata = {
  metadataBase: new URL('https://condominpro.com'),
  title: {
    default: 'CondominPro | Software de administración de condominios en Perú',
    template: '%s | CondominPro',
  },
  description:
    'Software para administración de edificios y condominios en Perú. Gestiona residentes, inmuebles, pagos de mantenimiento, incidencias y comunicados desde una sola plataforma.',
  applicationName: 'CondominPro',
  keywords: [
    'software de administración de condominios',
    'administración de edificios Perú',
    'gestión de condominios',
    'software para juntas de propietarios',
    'control de pagos de mantenimiento',
  ],
  openGraph: {
    title: 'CondominPro | Gestión inteligente de edificios y condominios',
    description:
      'Centraliza residentes, inmuebles, pagos e incidencias con una plataforma web de administración de condominios en Perú.',
    url: 'https://condominpro.com',
    siteName: 'CondominPro',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'CondominPro | Administración de condominios',
    description: 'Gestión inteligente de edificios y condominios en Perú.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="es-PE"><body><CondoShell>{children}</CondoShell></body></html>
}
