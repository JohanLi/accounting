import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'
import Download from '../download'

/*
  Automating this appears to be challenging. Many things inside the admin seem
  obfuscated, so it's hard to determine how download URLs are generated.
  Additionally, the buttons that reveal the URLs are inside an iframe which
  changes URL.

  Instead, some manual steps will need to be taken every time:
  - Click "View transactions and documents"
  - Go to the iframe URL (can be obtained through document.querySelector('[id^=embeddedBilling] iframe').src)
  - Change the date range filter to start from "11/30/2022" (didn't claim it as a business expense prior)
 */

export const config: PlasmoCSConfig = {
  matches: ['https://payments.google.com/payments/*'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

async function getDownloads() {
  const filenames = []

  document.querySelectorAll(".b3id-document-zippy-line-item").forEach((element) => {
    filenames.push(element.textContent.trim())
    element.dispatchEvent(new MouseEvent('mousedown'));
  })

  return [...document.querySelectorAll('.goog-menuitem-content [data-download-url]')].map((element: HTMLElement, i) => (
    {
      url: `https://payments.google.com${element.dataset.downloadUrl}`,
      filename: filenames[i],
    }
  ))
}

export default function Google() {
  return (
    <Download
      getDownloads={getDownloads}
      isPendingDocument
    />
  )
}
