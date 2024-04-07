import '~contents/style.css'

export default function Popup() {
  return (
    <div className="p-4 space-y-4 w-64">
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">
          Documents
        </h2>
        <ul className="list-disc list-inside text-base">
          <Link href="https://apps.seb.se/ccs/ibf/kgb/4000/4700/kgbc4702.aspx?arena=true&language=sv">
            Seb
          </Link>
          <Link href="https://www.tre.se/mitt3/fakturor">Tre</Link>
          <Link href="https://box.developersbay.se/profile/invoices">
            Developers Bay
          </Link>
          <Link href="https://admin.google.com/ac/billing/accounts">
            Google Workspace
          </Link>
        </ul>
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold leading-6 text-gray-900">
          Transactions
        </h2>
        <ul className="list-disc list-inside text-base">
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
