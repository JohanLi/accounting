import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import Download from '../components/download.tsx'
import '../components/tailwind.css'
import { waitFor } from '../components/utils.ts'

export default defineContentScript({
  matches: ['https://www.tre.se/mitt3/fakturor'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'download-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = document.createElement('div')
        container.append(app)

        const root = ReactDOM.createRoot(app)
        root.render(
          <Download
            getDownloads={getDownloads}
            requestInit={{ credentials: 'include' }}
          />,
        )
        return root
      },
      onRemove: (root) => {
        root?.unmount()
      },
    })

    ui.mount()
  },
})

/*
  TODO
    should be 4, but the 4th invoice and onwards has a different account number
    due to recently switching back to Tre
 */
const COUNT = 3

const selector = 'a[href^="/mitt3/fakturor/"]'

async function getDownloads() {
  await waitFor(selector)

  return Array.from(document.querySelectorAll(selector))
    .slice(0, COUNT)
    .map((element) => {
      const href = element.getAttribute('href')

      if (!href) {
        throw new Error('No href')
      }

      const match = href.match(/\/mitt3\/fakturor\/(\d+)\/(\d+)/)

      if (match) {
        const [, accountNumber, invoiceNumber] = match

        return {
          url: `https://www.tre.se/mitt3/document/invoice/${accountNumber}/${invoiceNumber}`,
          filename: `bookkeeping/tre/tre-${invoiceNumber}.pdf`,
        }
      }

      throw new Error('Account number and invoice number were not found')
    })
}
