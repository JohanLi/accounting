import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ReactNode } from 'react'

import Nav from './components/Nav'
import './globals.css'

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
          <div className="fixed inset-y-0 flex w-60">
            <Nav />
          </div>
          <main className="w-full pl-60">
            <div className="max-w-[64rem] p-8">{props.children}</div>
          </main>
        </div>
      </body>
    </html>
  )
}
