import type { Metadata } from 'next'
import { Fredoka, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { ChildProvider } from '@/lib/ChildContext'

const fredoka = Fredoka({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-fredoka',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'NOVERE — Apprends. Rêve. Donne.',
  description: "Le compagnon d'apprentissage des enfants de Montréal",
  icons: {
    icon: '/novere_logo.png',
    apple: '/novere_logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className={`${fredoka.variable} ${jakarta.variable}`}>
      <body className="min-h-full flex flex-col antialiased">
        <ChildProvider>
          {children}
        </ChildProvider>
      </body>
    </html>
  )
}

