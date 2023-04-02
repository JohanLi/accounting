import fs from 'fs'
import Decimal from 'decimal.js'
import { getDocument, PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf'
import { TextContent } from 'pdfjs-dist/types/web/text_layer_builder'

export type Receipt = {
  total: number
  vat: number
  date: Date
  type: 'SALE_WITHIN_SWEDEN_25' | ''
  description: string
}

export async function parse(path: string): Promise<Receipt> {
  const strings = await getPDFStrings(path)

  if (strings.includes('Developers Bay AB')) {
    const vatRate = 0.25

    const monetaryValues: string[] = []
    const dates: Date[] = []

    strings.forEach((string) => {
      const foundMonetaryValue = string.match(/(\d+.\d+,\d+)/)

      if (foundMonetaryValue) {
        monetaryValues.push(
          foundMonetaryValue[1].replace('.', '').replace(',', '.'),
        )
        return
      }

      const foundDate = string.match(/\d{4}-\d{2}-\d{2}/)

      if (foundDate) {
        dates.push(new Date(foundDate[0]))
      }
    })

    const assumedTotal = Decimal.max(...monetaryValues)
    const expectedVat = Decimal.sub(
      assumedTotal,
      Decimal.div(assumedTotal, 1 + vatRate),
    ).toFixed(2)

    const foundExpectedVat = monetaryValues.find(
      (value) => value === expectedVat,
    )

    if (!foundExpectedVat) {
      throw Error('Did not find the expected VAT amount')
    }

    return {
      total: assumedTotal.mul(100).toNumber(),
      vat: new Decimal(expectedVat).mul(100).toNumber(),
      date: getLatestDate(dates),
      type: 'SALE_WITHIN_SWEDEN_25',
      description: 'Income',
    }
  }

  // vatRate 0.00
  if (
    strings.find((string) =>
      string.includes('Skandinaviska Enskilda Banken AB'),
    )
  ) {
    const monetaryValues: string[] = []
    const dates: Date[] = []

    strings.forEach((string) => {
      const foundMonetaryValue = string.match(/SEK (\d+,\d+)/)

      if (foundMonetaryValue) {
        monetaryValues.push(foundMonetaryValue[1].replace(',', '.'))
        return
      }

      const foundDate = string.match(/\d{4}-\d{2}-\d{2}/)

      // all their receipts show 2099-12-31 as the end date
      if (foundDate && foundDate[0] !== '2099-12-31') {
        dates.push(new Date(foundDate[0]))
      }
    })

    const assumedTotal = Decimal.max(...monetaryValues)

    return {
      total: assumedTotal.mul(100).toNumber(),
      vat: 0,
      date: getLatestDate(dates),
      type: '',
      description: '',
    }
  }

  if (strings.includes('Hi3G Access AB')) {
    const vatRate = 0.25

    if (!strings.includes(`Moms ${vatRate * 100}%`)) {
      throw Error('Did not find the expected VAT rate')
    }

    const monetaryValues: string[] = []
    const dates: Date[] = []

    strings.forEach((string) => {
      const foundMonetaryValue = string.match(/(\d+,\d+) SEK/)

      if (foundMonetaryValue) {
        monetaryValues.push(foundMonetaryValue[1].replace(',', '.'))
        return
      }

      const foundDate = string.match(/\d{4}-\d{2}-\d{2}/)

      if (foundDate) {
        dates.push(new Date(foundDate[0]))
      }
    })

    const assumedTotal = Decimal.max(...monetaryValues)

    return {
      total: assumedTotal.mul(100).toNumber(),
      vat: Decimal.sub(assumedTotal, Decimal.div(assumedTotal, 1 + vatRate))
        .mul(100)
        .toNumber(),
      date: getLatestDate(dates),
      type: '',
      description: '',
    }
  }

  if (strings.find((string) => string.includes('Flottsbro'))) {
    const vatRate = 0.06

    const monetaryValues: string[] = []
    const dates: Date[] = []

    strings.forEach((string) => {
      const foundMonetaryValue = string.match(/(\d+.\d+) SEK/)

      if (foundMonetaryValue) {
        monetaryValues.push(foundMonetaryValue[1])
        return
      }

      const foundDate = string.match(/(\d{2})\/(\d{2})\/(\d{4})/)

      if (foundDate) {
        dates.push(new Date(`${foundDate[3]}-${foundDate[2]}-${foundDate[1]}`))
      }
    })

    const assumedTotal = Decimal.max(...monetaryValues)
    const expectedVat = Decimal.sub(
      assumedTotal,
      Decimal.div(assumedTotal, 1 + vatRate),
    ).toFixed(2)

    const foundExpectedVat = monetaryValues.find(
      (value) => value === expectedVat,
    )

    if (!foundExpectedVat) {
      throw Error('Did not find the expected VAT amount')
    }

    return {
      total: assumedTotal.mul(100).toNumber(),
      vat: new Decimal(expectedVat).mul(100).toNumber(),
      date: getLatestDate(dates),
      type: '',
      description: '',
    }
  }

  throw Error('Receipt is not from a recognized source')
}

async function getPDFStrings(path: string) {
  const data = new Uint8Array(await fs.readFileSync(path))

  const pdf: PDFDocumentProxy = await getDocument({
    data,
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
