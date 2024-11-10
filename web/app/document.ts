import Decimal from 'decimal.js'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { TextContent } from 'pdfjs-dist/types/src/display/api'
import { Transaction } from './getJournalEntries'
import { JournalEntryUpdate } from './actions/updateJournalEntry'
import { krToOre } from './utils'
import db from './db'
import { Transactions } from './schema'
import { and, asc, eq, gte, isNull, lt, lte, or } from 'drizzle-orm'

if (typeof window == 'undefined') {
  /*
    When this code is run in Node, pdfjs-dist will attempt to load 'canvas' and 'path2d' even though they're
    not needed for the things we're using pdfjs-dist for.

    This hack prevents warning messages (https://github.com/mozilla/pdf.js/blob/bb73d2a92240a5177268a652f400a98805f83682/src/display/node_utils.js#L71)
    from showing up in the console.
   */

  // @ts-expect-error
  globalThis.DOMMatrix = {}
  // @ts-expect-error
  globalThis.Path2D = {}
}

// https://github.com/vercel/next.js/issues/58313#issuecomment-1807184812
// @ts-expect-error
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
          // @ts-expect-error
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
  | 'WELLNESS'
type VatRate = '0.25' | '0.12' | '0.06' | '0'

const characterizations: {
  [key in Characterization]: {
    debit: number
    credit: number
    vatRate: VatRate
  }
} = {
  INCOME: {
    debit: 1930,
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
  /*
    It's kinda excessive having logic recognizing this document. I did it
    mainly because the old accounting software handled this specific receipt
    poorly. It couldn't get the total, and it couldn't get the VAT. It even
    thought the date of the receipt was my date of birth.
   */
  WELLNESS: {
    debit: 7699,
    credit: 1930,
    vatRate: '0.06',
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
    description: 'Inkomst',
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
    identifiedBy: 'Flottsbro',
    characterization: 'WELLNESS',
    description: 'Friskvård skidåkning',
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

  let transactions: Transaction[]

  if (source.characterization === 'INCOME') {
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
    date: getLatestDate(dates),
    // TODO implement a way to tag journal entries
    description: `Recognized document – ${source.description}`,
    transactions,
  }
}

export function getLatestDate(dates: Date[]) {
  return dates.reduce((latest, date) => {
    if (date > latest) {
      return date
    }

    return latest
  })
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
  /(\d+,\d{2}) SEK/,
  /(\d+\.\d{2}) SEK/,
  /(\d+) SEK/, // Webhallen purchase
  /(\d+.\d{3},\d{2})/,
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

const foreignCurrencyMonetaryFormats = {
  EUR: [/€(\d+.\d{2})/, /(\d+.\d{2}) EUR/],
  USD: [/\$(\d+.\d{2})/],
}
export function getForeignCurrencyMonetaryValues(strings: string[]) {
  for (const [foreignCurrency, monetaryFormats] of Object.entries(
    foreignCurrencyMonetaryFormats,
  )) {
    const found = monetaryFormats.find((regex) =>
      strings.find((string) => string.match(regex)),
    )

    if (!found) {
      continue
    }

    return {
      foreignCurrency,
      values: unique(
        strings
          .map((string) => string.match(found))
          .filter((found): found is RegExpMatchArray => found !== null)
          .map((found) => found[1]),
      )
        .map((string) => krToOre(string))
        .sort((a, b) => b - a),
    }
  }

  return null
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

/*
  For documents like these, I've found it easiest to only detect dates. Then, using those dates, check against
  non-linked bank transactions to suggest values. This solution also works well for documents with foreign currencies.
 */
const SEARCH_DAY_RANGE = 10
const FOREIGN_CURRENCY = {
  conversionRate: 10,
  tolerance: 0.5,
}
export async function getUnknownDocument(strings: string[]) {
  const foreignValues = getForeignCurrencyMonetaryValues(strings)
  const dates = getDates(strings, foreignValues?.foreignCurrency === 'USD')

  if (!dates.length) {
    return null
  }

  const datesSQL = or(
    ...dates.map((date) => {
      const startInclusive = new Date(date)
      startInclusive.setDate(startInclusive.getDate() - SEARCH_DAY_RANGE)

      const endInclusive = new Date(date)
      endInclusive.setDate(endInclusive.getDate() + SEARCH_DAY_RANGE)

      return and(
        gte(Transactions.date, startInclusive),
        lte(Transactions.date, endInclusive),
      )
    }),
  )

  let values
  let amountSQL
  if (!foreignValues) {
    values = getMonetaryValues(strings)
    amountSQL = or(...values.map((value) => eq(Transactions.amount, -value)))
  } else {
    values = foreignValues.values
    amountSQL = or(
      ...values.map((value) =>
        and(
          gte(
            Transactions.amount,
            -value *
              FOREIGN_CURRENCY.conversionRate *
              (1 + FOREIGN_CURRENCY.tolerance),
          ),
          lt(
            Transactions.amount,
            -value *
              FOREIGN_CURRENCY.conversionRate *
              (1 - FOREIGN_CURRENCY.tolerance),
          ),
        ),
      ),
    )
  }

  const bankTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        isNull(Transactions.journalEntryId),
        /*
          I've encountered a PDF before that's just a scan of a printed document. In those rare cases, rather than
          solving it through UI/code, I'll simply go here and comment out the following conditions.
         */
        datesSQL,
        amountSQL,
      ),
    )
    .orderBy(asc(Transactions.id))

  if (!bankTransactions.length) {
    return null
  }

  return {
    bankTransactions,
    // TODO implement a way to tag journal entries
    description: '',
    values,
    foreignCurrency: foreignValues?.foreignCurrency,
    dates,
  }
}
