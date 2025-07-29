import Decimal from 'decimal.js'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { TextContent } from 'pdfjs-dist/types/src/display/api'

import { JournalEntryUpdate } from './actions/updateJournalEntry'
import { Transaction } from './getJournalEntries'
import { krToOre } from './utils'

// https://github.com/vercel/next.js/issues/58313#issuecomment-1807184812
// @ts-expect-error pdf.js hack
await import('pdfjs-dist/build/pdf.worker.mjs')

export async function getPDFStrings(buffer: Buffer) {
  const pdf = await getDocument({
    data: Uint8Array.from(buffer),
    // https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
    useSystemFonts: true,
  }).promise
  const { numPages } = pdf

  const pageTextContent: Promise<TextContent>[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    pageTextContent.push(page.getTextContent())
  }

  return (await Promise.all(pageTextContent))
    .map((text) =>
      text.items
        .map((item) => {
          // @ts-expect-error pdf.js hack
          return item.str
        })
        .flat(),
    )
    .flat()
}

type Characterization =
  | 'INCOME'
  | 'BANKING_COSTS'
  | 'MOBILE_PROVIDER'
  | 'ANNUAL_REPORT'
type VatRate = '0.25' | '0.12' | '0.06' | '0'

const characterizations: {
  [key in Characterization]: {
    debit: number
    credit: number
    vatRate: VatRate
  }
} = {
  INCOME: {
    debit: 1510,
    credit: 3011,
    vatRate: '0.25',
  },
  BANKING_COSTS: {
    debit: 6570,
    credit: 1930,
    vatRate: '0',
  },
  MOBILE_PROVIDER: {
    debit: 6212,
    credit: 1930,
    vatRate: '0.25',
  },
  ANNUAL_REPORT: {
    debit: 6550,
    credit: 1930,
    vatRate: '0.25',
  },
}

type RecognizedDocument = {
  identifiedBy: string
  characterization: Characterization
  description: string
}

const recognizedDocuments: RecognizedDocument[] = [
  {
    identifiedBy: 'Developers Bay AB',
    characterization: 'INCOME',
    description: 'Inkomst kundfordran',
  },
  {
    identifiedBy: 'Skandinaviska Enskilda Banken AB',
    characterization: 'BANKING_COSTS',
    description: 'SEB månadsavgift',
  },
  {
    identifiedBy: 'Hi3G Access AB',
    characterization: 'MOBILE_PROVIDER',
    description: 'Tre företagsabonnemang',
  },
  {
    identifiedBy: 'Årsredovisning Online',
    characterization: 'ANNUAL_REPORT',
    description: 'Årsredovisning Online',
  },
]

export async function getRecognizedDocument(
  strings: string[],
): Promise<Pick<
  JournalEntryUpdate,
  'date' | 'description' | 'transactions'
> | null> {
  let source = recognizedDocuments.find((source) =>
    strings.includes(source.identifiedBy),
  )

  if (!source) {
    source = recognizedDocuments.find((source) =>
      strings.find((string) => string.includes(source.identifiedBy)),
    )
  }

  if (!source) {
    return null
  }

  const { debit, credit, vatRate } = characterizations[source.characterization]

  const monetaryValues = getMonetaryValues(strings)

  if (!monetaryValues.length) {
    throw Error('Did not find any monetary values')
  }

  const dates = getDates(strings)

  if (!dates.length) {
    throw Error('Did not find any dates')
  }

  const total = monetaryValues[0]
  let vat = 0

  if (vatRate !== '0') {
    const expectedVat = Math.round(total - total / (1 + parseFloat(vatRate)))

    const foundExpectedVat = monetaryValues.find(
      (value) => value === expectedVat,
    )

    if (foundExpectedVat === undefined) {
      // this can occur if the total has been rounded to the nearest krona
      if (!strings.includes(`Moms ${Decimal.mul(vatRate, 100)}%`)) {
        throw Error('Did not find the expected VAT rate')
      }
    }

    vat = expectedVat
  }

  let date: Date
  let transactions: Transaction[]

  if (source.characterization === 'INCOME') {
    date = getEarliestAndLatestDate(dates).earliest
    transactions = [
      {
        accountId: debit,
        amount: total,
      },
      {
        accountId: credit,
        amount: -(total - vat),
      },
      {
        accountId: 2610, // assumes 25% vat
        amount: -vat,
      },
    ]
  } else {
    date = getEarliestAndLatestDate(dates).latest
    transactions = [
      {
        accountId: debit,
        amount: total - vat,
      },
      {
        accountId: credit,
        amount: -total,
      },
    ]

    if (vatRate !== '0') {
      transactions.push({
        accountId: 2640,
        amount: vat,
      })
    }
  }

  return {
    date,
    // TODO implement a way to tag journal entries
    description: `Recognized document – ${source.description}`,
    transactions,
  }
}

function getEarliestAndLatestDate(dates: Date[]) {
  let earliest = dates[0];
  let latest = dates[0];

  for (const date of dates) {
    if (date < earliest) earliest = date;
    if (date > latest) latest = date;
  }

  return { earliest, latest };
}

function unique<T>(array: T[]) {
  return [...new Set(array)]
}

function uniqueDate(array: Date[]) {
  return [...new Set(array.map((date) => date.getTime()))].map(
    (time) => new Date(time),
  )
}

const monetaryFormats = [
  /(\d{1,3}\.\d{3}\.\d{2}) SEK/, // MacBook purchase
  /(\d{1,3}(?: \d{3})*,\d{2}) SEK/,
  /(\d{1,3}(?: \d{3})*\.\d{2}) SEK/,
  /(\d+) SEK/, // Webhallen purchase
  /(\d{1,3}([ .]?\d{3})*,\d{2})/,
  /(\d+,\d{2})/,
]
export function getMonetaryValues(strings: string[]) {
  const found = monetaryFormats.find((regex) =>
    strings.find((string) => string.match(regex)),
  )

  if (!found) {
    return []
  }

  return unique(
    strings
      .map((string) => string.match(found))
      .filter((found): found is RegExpMatchArray => found !== null)
      .map((found) =>
        found[1]
          // invoice
          .replace(/.(\d{3})/, '$1')
          // using point as decimal separator
          .replace(',', '.'),
      ),
  )
    .map((string) => krToOre(string))
    .sort((a, b) => b - a)
}

const dateFormats = [
  /[A-Z][a-z]{2} \d{1,2}, \d{4}/,
  /\d{4}-\d{2}-\d{2}/,
  /(\d{2})\/(\d{2})\/(\d{4})/,
  /(\d{1,2})[./](\d{1,2})[./](\d{4})/,
]
/*
  There exists ambiguity between MM/DD/YYYY and DD/MM/YYYY. It appears that USA and Canada use MM/DD/YYYY.
  If $ is detected as the currency in an unknown document, we'll assume MM/DD/YYYY.

  An alternate solution is to return dates assuming both formats, as long as they're valid. It doesn't matter
  for unknown documents, because the date is only used to find bank transactions.
 */
export function getDates(strings: string[], checkMMDDYYYY = false) {
  const found = dateFormats.findIndex((regex) =>
    strings.find((string) => string.match(regex)),
  )

  if (found === -1) {
    return []
  }

  return uniqueDate(
    strings
      .map((string) => string.match(dateFormats[found]))
      .filter((foundDate): foundDate is RegExpMatchArray => foundDate !== null)
      .map((foundDate) => {
        if (found === 2) {
          if (!checkMMDDYYYY) {
            return new Date(`${foundDate[3]}-${foundDate[2]}-${foundDate[1]}`)
          }

          return new Date(`${foundDate[3]}-${foundDate[1]}-${foundDate[2]}`)
        }

        /*
          While "2024-05-25" is treated as UTC, strings like "2023-5-25" and "Apr 8, 2023" are treated as local time.
          UTC+00:00 is a hack to make sure both of them are treated as UTC. Another option is padding the month and day.
         */
        if (found === 3) {
          if (!checkMMDDYYYY) {
            return new Date(
              `${foundDate[3]}-${foundDate[2]}-${foundDate[1]} UTC+00:00`,
            )
          }

          return new Date(
            `${foundDate[3]}-${foundDate[1]}-${foundDate[2]} UTC+00:00`,
          )
        }

        return new Date(`${foundDate[0]} UTC+00:00`)
      }),
  )
}
