import { and, eq, like, sql } from 'drizzle-orm';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { TextContent, TextItem } from 'pdfjs-dist/types/src/display/api';



import { JournalEntryUpdate } from './actions/updateJournalEntry';
import { Transaction } from './getJournalEntries';
import { getNonLinkedBankTransactions } from './getNonLinkedBankTransactions';
import { Transactions } from './schema';
import { AccountCode } from './types';
import { krToOre } from './utils';





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

type PDFLineItem = {
  str: string
  x: number
  y: number
}

function isTextItem(item: TextContent['items'][number]): item is TextItem {
  return 'str' in item
}

export async function getPDFLines(buffer: Buffer) {
  const pdf = await getDocument({
    data: Uint8Array.from(buffer),
    // https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
    useSystemFonts: true,
  }).promise
  const { numPages } = pdf

  const pageLines: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const lines: { y: number; items: PDFLineItem[] }[] = []
    const items = textContent.items
      .filter(isTextItem)
      .filter((item) => item.str.trim() !== '')
      .map((item) => ({
        str: item.str,
        x: item.transform[4],
        y: item.transform[5],
      }))
      .sort((a, b) => b.y - a.y || a.x - b.x)

    for (const item of items) {
      let line = lines.find((line) => Math.abs(line.y - item.y) < 2)

      if (!line) {
        line = { y: item.y, items: [] }
        lines.push(line)
      }

      line.items.push(item)
    }

    pageLines.push(
      ...lines
        .sort((a, b) => b.y - a.y)
        .map((line) =>
          line.items
            .sort((a, b) => a.x - b.x)
            .map((item) => item.str)
            .join(' ')
            .replace(/\s+/g, ' ')
            .trim(),
        ),
    )
  }

  return pageLines
}

type VatRate = '0.25' | '0.12' | '0.06' | '0'

type ExtractionRule<T> = {
  regex: RegExp
  parse: (match: RegExpMatchArray) => T
}

type RecognizedDocument = {
  identifiedBy: string
  description: string
  postingType?: 'income'
  accounting: {
    debit: AccountCode
    credit: AccountCode
    vatRate: VatRate
  }
  extraction: {
    dateRule: ExtractionRule<Date>
    monetaryValueRule: ExtractionRule<number>
  }
  getLinkedToTransactionIds?: (date: Date, amount: number) => Promise<number[]>
}

const recognizedDocuments: RecognizedDocument[] = [
  {
    identifiedBy: 'Magnit Global Sweden',
    description: 'Inkomst kundfordran',
    postingType: 'income',
    accounting: {
      debit: 1510,
      credit: 3011,
      vatRate: '0.25',
    },
    extraction: {
      dateRule: {
        regex: /Invoice Date:\s*(\d{1,2})-([A-Z][a-z]{2})-(\d{4})/g,
        parse: (match) =>
          getUTCDate(match[3], monthNameToNumber(match[2]), match[1]),
      },
      monetaryValueRule: {
        regex: /kr\s+(\d{1,3}(?:,\d{3})*\.\d{2})/g,
        parse: (match) => krToOre(match[1].replaceAll(',', '')),
      },
    },
  },
  {
    identifiedBy: 'Skandinaviska Enskilda Banken AB',
    description: 'SEB månadsavgift',
    accounting: {
      debit: 6570,
      credit: 1930,
      vatRate: '0',
    },
    extraction: {
      dateRule: {
        regex: /FÖRFALLODATUM:\s*(\d{4})-(\d{2})-(\d{2})/g,
        parse: (match) => getUTCDate(match[1], match[2], match[3]),
      },
      monetaryValueRule: {
        regex: /(\d+,\d{2})/g,
        parse: (match) => parseSwedishKronor(match[1]),
      },
    },
    getLinkedToTransactionIds: async (date, amount) => {
      const transactions = await getNonLinkedBankTransactions({
        date,
        dateMarginDays: 1,
        where: and(
          eq(Transactions.amount, -amount),
          sql`${Transactions.description} ~ '^[0-9]+$'`,
        ),
      })

      return transactions.map((transaction) => transaction.id)
    },
  },
  {
    identifiedBy: 'Hi3G Access AB',
    description: 'Tre företagsabonnemang',
    accounting: {
      debit: 6212,
      credit: 1930,
      vatRate: '0.25',
    },
    extraction: {
      dateRule: {
        regex: /Oss tillhanda\s+(\d{4})-(\d{2})-(\d{2})/g,
        parse: (match) => getUTCDate(match[1], match[2], match[3]),
      },
      monetaryValueRule: {
        regex: /(\d+,\d{2})/g,
        parse: (match) => parseSwedishKronor(match[1]),
      },
    },
    getLinkedToTransactionIds: async (date, amount) => {
      const transactions = await getNonLinkedBankTransactions({
        date,
        where: and(
          eq(Transactions.amount, -amount),
          like(Transactions.description, 'TRE %'),
        ),
      })

      return transactions.map((transaction) => transaction.id)
    },
  },
  {
    identifiedBy: 'Årsredovisning Online',
    description: 'Årsredovisning Online',
    accounting: {
      debit: 6550,
      credit: 1930,
      vatRate: '0.25',
    },
    extraction: {
      dateRule: {
        regex: /Datum\s+(\d{4})-(\d{2})-(\d{2})/g,
        parse: (match) => getUTCDate(match[1], match[2], match[3]),
      },
      monetaryValueRule: {
        regex: /(\d{1,3}(?: \d{3})*,\d{2})/g,
        parse: (match) => parseSwedishKronor(match[1]),
      },
    },
  },
]

export async function getRecognizedDocument(
  strings: string[],
): Promise<Pick<
  JournalEntryUpdate,
  'date' | 'description' | 'transactions' | 'linkedToTransactionIds'
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

  const { debit, credit, vatRate } = source.accounting
  const { dateRule, monetaryValueRule } = source.extraction

  const monetaryValues = getRecognizedDocumentMonetaryValues(
    strings,
    monetaryValueRule,
  )

  if (!monetaryValues.length) {
    throw Error('Did not find any monetary values')
  }

  const date = getRecognizedDocumentDate(strings, dateRule)

  if (!date) {
    throw Error('Did not find any dates')
  }

  const total = monetaryValues[0]
  let vat = 0

  if (vatRate !== '0') {
    const expectedVat = Math.round(total - total / (1 + parseFloat(vatRate)))

    const foundExpectedVat = monetaryValues.find(
      /*
       The 50 ören tolerance has to do with some providers rounding the VAT
       to the nearest kr, like Tre does. I haven't bothered writing logic
       handling öresavrundning as I find the amount negligible.
       */
      (value) => Math.abs(value - expectedVat) <= 50,
    )

    if (!foundExpectedVat) {
      throw Error('Did not find the expected VAT')
    }

    vat = expectedVat
  }

  let transactions: Transaction[]

  if (source.postingType === 'income') {
    transactions = [
      {
        accountId: debit,
        amount: total,
      },
      {
        accountId: 2610, // assumes 25% vat
        amount: -vat,
      },
      {
        accountId: credit,
        amount: -(total - vat),
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
      transactions.unshift({
        accountId: 2640,
        amount: vat,
      })
    }
  }

  let linkedToTransactionIds: number[] = []

  if (source.getLinkedToTransactionIds) {
    linkedToTransactionIds = await source.getLinkedToTransactionIds(date, total)

    if (!linkedToTransactionIds.length) {
      return null
    }
  }

  return {
    date,
    // TODO implement a way to tag journal entries
    description: `Recognized document – ${source.description}`,
    transactions,
    linkedToTransactionIds,
  }
}

function unique<T>(array: T[]) {
  return [...new Set(array)]
}

function uniqueDate(array: Date[]) {
  return [...new Set(array.map((date) => date.getTime()))].map(
    (time) => new Date(time),
  )
}

function extractWithRule<T>(strings: string[], rule: ExtractionRule<T>) {
  return strings.flatMap((string) =>
    Array.from(string.matchAll(rule.regex)).map((match) => rule.parse(match)),
  )
}

function getRecognizedDocumentMonetaryValues(
  strings: string[],
  rule: ExtractionRule<number>,
) {
  return unique(extractWithRule(strings, rule)).sort((a, b) => b - a)
}

function getRecognizedDocumentDate(
  strings: string[],
  rule: ExtractionRule<Date>,
) {
  const dates = uniqueDate(extractWithRule(strings, rule))

  if (dates.length > 1) {
    throw Error('Found more than one date')
  }

  return dates[0]
}

function getUTCDate(year: string, month: string, day: string) {
  return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`)
}

function monthNameToNumber(month: string) {
  const monthNumber = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ].indexOf(month)

  if (monthNumber === -1) {
    throw Error(`Unknown month: ${month}`)
  }

  return String(monthNumber + 1)
}

function parseSwedishKronor(value: string) {
  return krToOre(value.replaceAll(' ', '').replace(',', '.'))
}
