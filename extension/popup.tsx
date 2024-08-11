import '~contents/style.css'

export default function Popup() {
  return (
    <div className="w-64 space-y-4 p-4">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">
          Documents
        </h2>
        <ul className="list-inside list-disc text-base">
          <Link href="https://apps.seb.se/ccs/ibf/kgb/4000/4700/kgbc4702.aspx?arena=true&language=sv">
            Seb
          </Link>
          <Link href="https://www.tre.se/mitt3/fakturor">Tre</Link>
          <Link href="https://box.developersbay.se/profile/invoices">
            Developers Bay
          </Link>
          {/*
            Order receipts from Namecheap are a frustrating experience. While they get sent to both your Namecheap
            inbox and your email, neither of these places show you your added company details. Instead, it's this
            third place where you can download receipts with custom info.

            Since it's a yearly thing, it's not worth the effort to automate this. I'm using Namecheap because
            Google and Cloudflare don't support the .li TLD.
          */}
          <Link href="https://ap.www.namecheap.com/profile/billing/orders">
            Namecheap (manual)
          </Link>
        </ul>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">
          Transactions
        </h2>
        <ul className="list-inside list-disc text-base">
          <Link href="https://apps.seb.se/ccs/accounts/accounts-and-balances/">
            Bank account
          </Link>
          <Link href="https://sso.skatteverket.se/sk/ska/hamtaBokfTrans.do">
            Tax account
          </Link>
        </ul>
      </div>
    </div>
  )
}

function Link({ href, children }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        className="font-semibold text-indigo-600 hover:text-indigo-500"
      >
        {children}
      </a>
    </li>
  )
}
