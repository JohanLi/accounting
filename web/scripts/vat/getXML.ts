import { krToOre } from '../../app/utils'

/*
  The inputs are actually mapped to more accounts than I've added, but many
  of them will likely never be applicable. A good place to check what should be
  mapped to what: https://www.bjornlunden.se/skatt/momsdeklaration__6798
 */
const VAT_MAP: {
  [id: string]: {
    accountIds: number[]
    xmlElement: string
    invert?: true
    sales?: true
  }
} = {
  // Momspliktig försäljning som inte ingår i ruta 06, 07 eller 08
  '5': {
    accountIds: [3011],
    xmlElement: 'ForsMomsEjAnnan',
    invert: true,
    sales: true,
  },
  // Utgående moms 25%
  '10': {
    accountIds: [2610],
    xmlElement: 'MomsUtgHog',
    invert: true,
  },
  // Inköp av tjänster från ett annat EU-land enligt huvudregeln
  '21': {
    accountIds: [4535, 4536, 4537],
    xmlElement: 'InkopTjanstAnnatEg',
  },
  // Inköp av tjänster från ett land utanför EU
  '22': {
    accountIds: [4531, 4532, 4533],
    xmlElement: 'InkopTjanstUtomEg',
  },
  // Utgående moms 25%
  '30': {
    accountIds: [2614],
    xmlElement: 'MomsInkopUtgHog',
    invert: true,
  },
  // Ingående moms att dra av
  '48': {
    accountIds: [2640, 2645],
    xmlElement: 'MomsIngAvdr',
  },
}

/*
  Sales are taken from salesAccounts rather than accounts. Those only include
  journal entries with outgoing VAT, which leaves out accrued income and its
  reversal – their VAT is reported when invoicing, which is also when the sale
  should be reported.
 */
export function getXML({
  endInclusive,
  accounts,
  salesAccounts,
}: {
  endInclusive: Date
  accounts: { id: number; amount: number }[]
  salesAccounts: { id: number; amount: number }[]
}) {
  const elements: string[] = []

  let totalKr = 0

  Object.entries(VAT_MAP).forEach(
    ([id, { accountIds, xmlElement, invert, sales }]) => {
      let elementTotal = (sales ? salesAccounts : accounts)
        .filter((a) => accountIds.includes(a.id))
        .reduce((acc, a) => acc + a.amount, 0)

      if (invert) {
        elementTotal = -elementTotal
      }

      elementTotal = Math.trunc(elementTotal / 100)

      if (['10', '30'].includes(id)) {
        totalKr += elementTotal
      }

      if (id === '48') {
        totalKr -= elementTotal
      }

      elements.push(`<${xmlElement}>${elementTotal}</${xmlElement}>`)
    },
  )

  elements.push(`<MomsBetala>${totalKr}</MomsBetala>`)

  // there's close to no documentation about this; it was mostly figured out through feeding different values
  const period = `${endInclusive.getFullYear()}${(endInclusive.getMonth() + 1)
    .toString()
    .padStart(2, '0')}`

  const xml = `
<?xml version="1.0" encoding="ISO-8859-1"?>
<!DOCTYPE eSKDUpload PUBLIC "-//Skatteverket, Sweden//DTD Skatteverket eSKDUpload-DTD Version 6.0//SV" "https://www1.skatteverket.se/demoeskd/eSKDUpload_6p0.dtd">
<eSKDUpload Version="6.0">
  <OrgNr>559278-4465</OrgNr>
  <Moms>
    <Period>${period}</Period>
    ${elements.join('\n    ')}
  </Moms>
</eSKDUpload>
  `.trim()

  return {
    xml,
    vatTotalTruncated: krToOre(totalKr),
  }
}
