import ReactDOM from 'react-dom/client'
import { createShadowRootUi } from 'wxt/utils/content-script-ui/shadow-root'
import { defineContentScript } from 'wxt/utils/define-content-script'

import Download from '../components/download.tsx'
import '../components/tailwind.css'
import { waitFor } from '../components/utils.ts'

export default defineContentScript({
  matches: ['https://box.developersbay.se/profile/invoices'],
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

/*
 After 2024, they changed the format of the invoices. This applies retroactively as well – downloading older invoices
 will generate new files as a consequence.
 */
const COUNT = 4

const selectorGeneratePDF = '[data-testid="FileDownloadIcon"]'
const selectorDownloadBlobs = 'a[download][href]'

async function getDownloads() {
  await waitFor(selectorGeneratePDF)

  const downloadSVGs = document.querySelectorAll(selectorGeneratePDF)

  // prevent file download
  window.addEventListener('click', (event) => {
    /*
      Two clicks actually trigger for each download, one on the button and one on the span.
      Not much value in making the following logic smarter.
     */

    event.preventDefault()
    event.stopPropagation()
  })

  Array.from(downloadSVGs)
    .slice(0, COUNT)
    .forEach((svg) => {
      const button = svg.parentNode

      if (!(button instanceof HTMLButtonElement)) {
        throw new Error('Expected button')
      }

      button.click()
    })

  await waitFor(selectorDownloadBlobs, COUNT)

  return Array.from(
    document.querySelectorAll<HTMLAnchorElement>(selectorDownloadBlobs),
  ).map((a) => ({
    url: a.href,
    filename: `${a.getAttribute('download')}.pdf`,
  }))
}
