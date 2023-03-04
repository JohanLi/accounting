import Head from 'next/head'
import Import from '../components/Import'

export default function Home() {
  return (
    <>
      <Head>
        <title>Accounting</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
            <Import />
          </div>
        </main>
      </div>
    </>
  )
}
