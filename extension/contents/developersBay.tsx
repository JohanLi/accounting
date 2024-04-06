import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'
import Download from '../download'
import { waitFor } from '../utils'

export const config: PlasmoCSConfig = {
  matches: ['https://box.developersbay.se/profile/invoices'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

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

export default function DevelopersBay() {
  return <Download getDownloads={getDownloads} />
}
