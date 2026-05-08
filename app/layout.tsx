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
  title: 'Novere',
  description: "Une plateforme d\'apprentissage personalisable qui permet de gagner des cadeaux en apprenant.",

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

