import Decimal from 'decimal.js'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf'
import { TextContent } from 'pdfjs-dist/types/web/text_layer_builder'

type Type = 'INCOME' | 'BANKING_COSTS' | 'MOBILE_PROVIDER' | 'WELLNESS'
type VatRate = '0.25' | '0.12' | '0.06' | '0'

const types: {
  [key in Type]: {
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
  WELLNESS: {
    debit: 7699,
    credit: 2890,
    vatRate: '0.06',
  },
}

type Source = {
  identifiedBy: string
  type: Type
  description: string
}

const sources: Source[] = [
  {
    identifiedBy: 'Developers Bay AB',
    type: 'INCOME',
    description: 'Inkomst',
  },
  {
    identifiedBy: 'Skandinaviska Enskilda Banken AB',
    type: 'BANKING_COSTS',
    description: 'SEB månadsavgift',
  },
  {
    identifiedBy: 'Hi3G Access AB',
    type: 'MOBILE_PROVIDER',
    description: 'Tre företagsabonnemang',
  },
  {
    identifiedBy: 'Flottsbro',
    type: 'WELLNESS',
    description: 'Friskvård skidåkning',
  },
]

export type DocumentDetails = {
  total: number
  vat: number
  date: Date
  type: Type
  description: string
}

export async function parseDetails(
  buffer: Buffer,
): Promise<DocumentDetails | null> {
  const strings = await getPDFStrings(buffer)

  let source = sources.find((source) => strings.includes(source.identifiedBy))

  if (!source) {
    source = sources.find((source) =>
      strings.find((string) => string.includes(source.identifiedBy)),
    )
  }

  if (!source) {
    return null
  }

  const { vatRate } = types[source.type]

  const monetaryValues = getMonetaryValues(strings)

  if (!monetaryValues.length) {
    throw Error('Did not find any monetary values')
  }

  const dates = getDates(strings)

  if (!dates.length) {
    throw Error('Did not find any dates')
  }

  const assumedTotal = Decimal.max(...monetaryValues)

  const document: DocumentDetails = {
    total: assumedTotal.mul(100).toNumber(),
    vat: 0,
    date: getLatestDate(dates),
    type: source.type,
    description: source.description,
  }

  if (vatRate !== '0') {
    const expectedVat = Decimal.sub(
      assumedTotal,
      Decimal.div(assumedTotal, Decimal.add(1, vatRate)),
    ).toFixed(2)

    const foundExpectedVat = monetaryValues.find(
      (value) =>
        value === expectedVat ||
        value === `${expectedVat.replace(',', '.')} SEK`,
    )

    if (!foundExpectedVat) {
      // this can occur if the total has been rounded to the nearest krona
      if (!strings.includes(`Moms ${Decimal.mul(vatRate, 100)}%`)) {
        throw Error('Did not find the expected VAT rate')
      }
    }

    document.vat = new Decimal(expectedVat).mul(100).toNumber()
  }

  return document
}

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
          // @ts-ignore
          return item.str
        })
        .flat(),
    )
    .flat()
}

function getLatestDate(dates: Date[]) {
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

const monetaryFormats = [
  /€(\d+.\d+)/, // TODO support € and $
  /(\d+,\d+) SEK/,
  /(\d+.\d+) SEK/,
  /(\d+.\d+,\d+)/,
  /(\d+,\d+)/,
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
}

const dateFormats = [
  /[A-Z][a-z]{2} \d{1,2}, \d{4}/,
  /\d{4}-\d{2}-\d{2}/,
  /(\d{2})\/(\d{2})\/(\d{4})/,
]
export function getDates(strings: string[]) {
  const found = dateFormats.findIndex((regex) =>
    strings.find((string) => string.match(regex)),
  )

  if (found === -1) {
    return []
  }

  return unique(
    strings
      .map((string) => string.match(dateFormats[found]))
      .filter((foundDate): foundDate is RegExpMatchArray => foundDate !== null)
      .map((foundDate) => {
        if (found === 2) {
          return new Date(`${foundDate[3]}-${foundDate[2]}-${foundDate[1]}`)
        }

        /*
          While "2023-04-08" is treated as UTC, "Apr 8, 2023" is treated as local time.
          UTC+00:00 is a hack to make sure both of them are treated as UTC.
         */
        return new Date(`${foundDate[0]} UTC+00:00`)
      }),
  )
}

export function documentToTransactions(document: DocumentDetails) {
  const { total, vat, type } = document
  const { debit, credit, vatRate } = types[type]

  if (type === 'INCOME') {
    return [
      {
        accountId: debit,
        amount: total,
      },
      {
        accountId: credit,
        amount: -(document.total - document.vat),
      },
      {
        accountId: 2610, // assumes 25% vat
        amount: -vat,
      },
    ]
  }

  const transactions = [
    {
      accountId: debit,
      amount: document.total - document.vat,
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

  return transactions
}
