import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from './components/Nav'
import { ReactNode } from 'react'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Accounting',
    default: 'Accounting',
  },
}

export default function RootLayout(props: { children: ReactNode }) {
  return (
    <html lang="en">
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/png" href="/icon.development.png" />
      <body className={inter.className}>
        <div className="flex">
          <div className="fixed inset-y-0 z-50 flex w-60">
            <Nav />
          </div>
          <main className="pl-60">
            <div className="p-8">{props.children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
