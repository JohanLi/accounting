import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import Download from '../../components/download.tsx'
import '../../components/tailwind.css'
import { waitFor } from '../../components/utils.ts'

export default defineContentScript({
  matches: ['https://eu.workforcelogiq.com/Invoice/List*'],
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
        root.render(<Download getDownloads={getDownloads} />)
        return root
      },
      onRemove: (root) => {
        root?.unmount()
      },
    })

    ui.mount()
  },
})

const selectorInvoiceLinks = 'a[data-invoiceid][data-vendorid]'

const INVOICE_DOWNLOAD_URL =
  'https://eu.workforcelogiq.com/InvoicePDF/DownloadVendorInvoicePDFByInvoiceID'

async function getDownloads() {
  await waitFor(selectorInvoiceLinks)

  return Array.from(
    document.querySelectorAll<HTMLAnchorElement>(selectorInvoiceLinks),
  ).map((anchor) => {
    const invoiceID = getRequiredAttribute(anchor, 'data-invoiceid')
    const vendorID = getRequiredAttribute(anchor, 'data-vendorid')
    const isManagmentFeeInvoice =
      anchor.dataset.ismanagmentfeeinvoice ?? 'false'
    const params = new URLSearchParams({
      invoiceID,
      vendorID,
      isManagmentFeeInvoice,
      TabId: getTabId(),
    })

    return {
      url: `${INVOICE_DOWNLOAD_URL}?${params}`,
    }
  })
}

function getRequiredAttribute(element: HTMLElement, attribute: string) {
  const value = element.getAttribute(attribute)

  if (!value) {
    throw new Error(`Missing ${attribute}`)
  }

  return value
}

function getTabId() {
  return new URLSearchParams(window.location.search).get('TabId') ?? '2'
}
