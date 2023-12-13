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
        <div className="py-10">
          <header>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900">
                Accounting
              </h1>
            </div>
          </header>
          <main>
            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
              <Nav />
              {props.children}
            </div>
          </main>
        </div>
      </body>
    </html>
  )
}
