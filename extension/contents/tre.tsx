/*
  Their invoices aren't static but generated based on the latest "template".
  Some time after the summer of 2023, a major change to that template occurred.

  Before, the invoices themselves were extremely invasive: you got a detailed
  log of all the numbers you called, when you called, and how long each
  call lasted along with whom you messaged. You could also see a daily
  breakdown of data usage. It makes even less sense when you consider the
  fact that my phone plan is unlimited – none of that information is relevant
  for billing purposes.

  It's all gone now, thankfully.
 */

import cssText from 'data-text:./style.css'
import type { PlasmoCSConfig } from 'plasmo'

import Download from '../download'
import { waitFor } from '../utils'

export const config: PlasmoCSConfig = {
  matches: ['https://www.tre.se/mitt3/fakturor'],
}

export const getStyle = () => {
  const style = document.createElement('style')
  style.textContent = cssText
  return style
}

// unfortunately, you can't ever be sure they don't treat this as a password somewhere
const accountNumber = process.env.PLASMO_PUBLIC_TRE_ACCOUNT_NUMBER

if (!accountNumber) {
  throw new Error('Missing PLASMO_PUBLIC_TRE_ACCOUNT_NUMBER')
}

const selector = 'a[href^="/mitt3/fakturor/"]'

async function getDownloads() {
  await waitFor(selector)

  return [...document.querySelectorAll(selector)].map((element) => {
    const match = element.getAttribute('href').match(/\/mitt3\/fakturor\/(\d+)/)

    if (match) {
      const invoiceNumber = match[1]

      return {
        url: `https://www.tre.se/t/api/invoices/my3/api/v1/accounts/${accountNumber}/invoices/${invoiceNumber}/document?errorCallback=/mitt3/fakturor`,
        filename: `bookkeeping/tre/tre-${invoiceNumber}.pdf`,
      }
    }

    console.log(element)
    throw new Error('One of the invoice links does not seem to have an ID')
  })
}

export default function Tre() {
  return (
    <Download
      getDownloads={getDownloads}
      requestInit={{ credentials: 'include' }}
    />
  )
}
