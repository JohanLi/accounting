import Head from 'next/head'
import { ReactNode } from 'react'
import Nav from './Nav'

type Props = {
  title: string
  children: ReactNode
}

export default function Layout(props: Props) {
  const title = `${props.title} – Accounting`

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" href="/icon.development.png" />
      </Head>
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
    </>
  )
}
