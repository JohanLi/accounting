/*
  SRU files for filing Inkomstdeklaration 2 (INK2, INK2R and INK2S) through
  Skatteverket's e-service Filöverföring. The filed declaration is a draft,
  which then needs to be signed in the e-service Inkomstdeklaration 2.

  The format and field codes are described here:
  https://www.skatteverket.se/foretag/inkomstdeklaration/forredovisningsbyraer/tekniskinformationomfiloverforing.4.13948c0e18e810bfa0cca8.html

  Field codes are based on blankettutgåva SKV2002-33 (beskattningsperiod 2025P4
  and onwards), found in "Ändringar från och med 2025P4 (zip)". Check the
  latest zip on the page above for changes before filing.
 */
import { ACCOUNT_ID_BALANCE_END_EXCLUSIVE } from '../accountIds'

type AccountRange = [number, number]

export type SruAccount = {
  id: number
  // in öre, SIE sign convention (debit is positive)
  result: number
  closingBalance: number
}

export type SruInput = {
  fiscalYear: {
    startInclusive: Date
    endInclusive: Date
  }
  accounts: SruAccount[]
  // in öre, all positive
  taxAdjustments: {
    nonDeductibleExpenses: number
    nonTaxableRevenue: number
    lossFromPrevious: number
  }
  company: {
    name: string
    // 10 digits, e.g. 5592784465
    orgNr: string
    postNr: string
    postOrt: string
  }
  createdAt: Date
}

/*
  Positive amounts are reported with the sign printed on the form, e.g.
  "Övriga externa kostnader" (7513) is printed as "-" and reported as positive.
 */
const INCOME_STATEMENT_FIELDS: {
  field: number
  accounts: AccountRange[]
  sign: 1 | -1
}[] = [
  { field: 7410, accounts: [[3000, 3799]], sign: 1 }, // Nettoomsättning
  { field: 7413, accounts: [[3900, 3999]], sign: 1 }, // Övriga rörelseintäkter
  { field: 7511, accounts: [[4000, 4999]], sign: -1 }, // Råvaror och förnödenheter
  { field: 7513, accounts: [[5000, 6999]], sign: -1 }, // Övriga externa kostnader
  { field: 7514, accounts: [[7000, 7699]], sign: -1 }, // Personalkostnader
  { field: 7515, accounts: [[7700, 7899]], sign: -1 }, // Av- och nedskrivningar
  { field: 7517, accounts: [[7900, 7999]], sign: -1 }, // Övriga rörelsekostnader
  { field: 7417, accounts: [[8300, 8399]], sign: 1 }, // Övriga ränteintäkter
  { field: 7522, accounts: [[8400, 8499]], sign: -1 }, // Räntekostnader
  { field: 7528, accounts: [[8900, 8989]], sign: -1 }, // Skatt på årets resultat
]

const ACCOUNT_ID_YEARLY_RESULT = 8999

const ASSET_FIELDS: { field: number; accounts: AccountRange[] }[] = [
  { field: 7233, accounts: [[1350, 1359]] }, // Andra långfristiga värdepappersinnehav
  { field: 7235, accounts: [[1380, 1389]] }, // Andra långfristiga fordringar
  { field: 7251, accounts: [[1500, 1599]] }, // Kundfordringar
  { field: 7261, accounts: [[1600, 1699]] }, // Övriga fordringar
  { field: 7263, accounts: [[1700, 1799]] }, // Förutbetalda kostnader och upplupna intäkter
  { field: 7271, accounts: [[1800, 1899]] }, // Övriga kortfristiga placeringar
  { field: 7281, accounts: [[1900, 1999]] }, // Kassa och bank
]

const FIELD_OTHER_RECEIVABLES = 7261

/*
  Liabilities are presented as positive amounts. Netted groups with a debit
  balance (e.g. overpaid tax or VAT to be refunded) are receivables instead.
 */
const EQUITY_AND_LIABILITY_FIELDS: {
  field: number
  accounts: AccountRange[]
  netted?: true
}[] = [
  { field: 7301, accounts: [[2080, 2089]] }, // Bundet eget kapital
  { field: 7302, accounts: [[2090, 2099]] }, // Fritt eget kapital
  { field: 7365, accounts: [[2440, 2449]] }, // Leverantörsskulder
  { field: 7368, accounts: [[2500, 2599]], netted: true }, // Skatteskulder
  { field: 7369, accounts: [[2600, 2899]], netted: true }, // Övriga skulder
  { field: 7370, accounts: [[2900, 2999]] }, // Upplupna kostnader och förutbetalda intäkter
]

function isInRanges(id: number, ranges: AccountRange[]) {
  return ranges.some(([from, to]) => id >= from && id <= to)
}

function sum(
  accounts: SruAccount[],
  ranges: AccountRange[],
  key: 'result' | 'closingBalance',
) {
  return accounts
    .filter((a) => isInRanges(a.id, ranges))
    .reduce((total, a) => total + a[key], 0)
}

function assertAllMapped(
  accounts: SruAccount[],
  ranges: AccountRange[],
  key: 'result' | 'closingBalance',
) {
  const unmapped = accounts.filter(
    (a) => a[key] !== 0 && !isInRanges(a.id, ranges),
  )

  if (unmapped.length > 0) {
    throw new Error(
      `Accounts ${unmapped.map((a) => a.id).join(', ')} aren't mapped to any SRU field code`,
    )
  }
}

function toKrona(ore: number) {
  // `+ 0` avoids -0
  return Math.round(ore / 100) + 0
}

/*
  Rounds each part to whole kronor so that the parts add up to the rounded total
  (largest remainder method). Rounding each part separately can otherwise make
  the income statement not add up to "Årets resultat".
 */
export function roundParts(total: number, parts: number[]) {
  const floors = parts.map((p) => Math.floor(p / 100))
  const steps = toKrona(total) - floors.reduce((a, b) => a + b, 0)

  const byFractionDescending = parts
    .map((p, i) => ({ i, fraction: p - floors[i] * 100 }))
    .sort((a, b) => b.fraction - a.fraction)

  for (let k = 0; k < Math.abs(steps); k++) {
    const { i } =
      steps > 0
        ? byFractionDescending[k % parts.length]
        : byFractionDescending[parts.length - 1 - (k % parts.length)]
    floors[i] += Math.sign(steps)
  }

  return floors.map((f) => f + 0)
}

// the beskattningsperiod depends on the month the fiscal year ends
export function getPeriod(endInclusive: Date) {
  const month = endInclusive.getUTCMonth() + 1
  const period = month <= 4 ? 1 : month <= 6 ? 2 : month <= 8 ? 3 : 4

  return `${endInclusive.getUTCFullYear()}P${period}`
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, '')
}

function formatTime(date: Date) {
  return date.toISOString().slice(11, 19).replace(/:/g, '')
}

function getIncomeStatement(allAccounts: SruAccount[]) {
  // for balance sheet accounts, `result` is the change during the year
  const accounts = allAccounts.filter(
    (a) => a.id >= ACCOUNT_ID_BALANCE_END_EXCLUSIVE,
  )

  assertAllMapped(
    accounts,
    [
      ...INCOME_STATEMENT_FIELDS.flatMap((f) => f.accounts),
      [ACCOUNT_ID_YEARLY_RESULT, ACCOUNT_ID_YEARLY_RESULT],
    ],
    'result',
  )

  const parts = INCOME_STATEMENT_FIELDS.map(
    (f) => -sum(accounts, f.accounts, 'result'),
  )
  const result = parts.reduce((a, b) => a + b, 0)
  const rounded = roundParts(result, parts)

  const fields = new Map<number, number>()

  INCOME_STATEMENT_FIELDS.forEach((f, i) => {
    if (rounded[i] !== 0) {
      fields.set(f.field, rounded[i] * f.sign)
    }
  })

  return { fields, result: toKrona(result) }
}

function getBalanceSheet(allAccounts: SruAccount[]) {
  const accounts = allAccounts.filter(
    (a) => a.id < ACCOUNT_ID_BALANCE_END_EXCLUSIVE,
  )

  assertAllMapped(
    accounts,
    [
      ...ASSET_FIELDS.flatMap((f) => f.accounts),
      ...EQUITY_AND_LIABILITY_FIELDS.flatMap((f) => f.accounts),
    ],
    'closingBalance',
  )

  const assets = new Map(
    ASSET_FIELDS.map((f) => [
      f.field,
      sum(accounts, f.accounts, 'closingBalance'),
    ]),
  )
  const equityAndLiabilities = new Map<number, number>()

  for (const f of EQUITY_AND_LIABILITY_FIELDS) {
    const amount = -sum(accounts, f.accounts, 'closingBalance')

    if (f.netted && amount < 0) {
      assets.set(
        FIELD_OTHER_RECEIVABLES,
        assets.get(FIELD_OTHER_RECEIVABLES)! - amount,
      )
    } else {
      equityAndLiabilities.set(f.field, amount)
    }
  }

  const totalAssets = [...assets.values()].reduce((a, b) => a + b, 0)
  const total = [...equityAndLiabilities.values()].reduce((a, b) => a + b, 0)

  if (totalAssets !== total) {
    throw new Error(
      "Assets don't match equity and liabilities. Is the year-end result booked?",
    )
  }

  const fields = new Map<number, number>()

  for (const group of [assets, equityAndLiabilities]) {
    const rounded = roundParts(total, [...group.values()])

    ;[...group.keys()].forEach((field, i) => {
      if (rounded[i] !== 0) {
        fields.set(field, rounded[i])
      }
    })
  }

  return fields
}

function getTaxAdjustments(
  result: number,
  taxAdjustments: SruInput['taxAdjustments'],
  tax: number,
) {
  const nonDeductibleExpenses = toKrona(taxAdjustments.nonDeductibleExpenses)
  const nonTaxableRevenue = toKrona(taxAdjustments.nonTaxableRevenue)
  const lossFromPrevious = toKrona(taxAdjustments.lossFromPrevious)

  const taxable =
    result + tax + nonDeductibleExpenses - nonTaxableRevenue - lossFromPrevious

  const fields = new Map<number, number | string>([
    [result >= 0 ? 7650 : 7750, Math.abs(result)], // 4.1/4.2 Årets resultat
    [7651, tax], // 4.3a Skatt på årets resultat
    [7653, nonDeductibleExpenses], // 4.3c Andra bokförda kostnader
    [7754, nonTaxableRevenue], // 4.5c Andra bokförda intäkter
    [7763, lossFromPrevious], // 4.14a Outnyttjat underskott från föregående år
    [taxable >= 0 ? 7670 : 7770, Math.abs(taxable)], // 4.15/4.16 Överskott/Underskott
    [8041, 'X'], // no accounting consultant helped with the annual report
    [8045, 'X'], // the annual report hasn't been audited
  ])

  for (const [field, value] of fields) {
    if (value === 0) {
      fields.delete(field)
    }
  }

  return { fields, taxable }
}

export function getSru(input: SruInput) {
  const { fiscalYear, accounts, company, createdAt } = input

  const identity = `16${company.orgNr}`
  const period = getPeriod(fiscalYear.endInclusive)
  const start = formatDate(fiscalYear.startInclusive)
  const end = formatDate(fiscalYear.endInclusive)

  const incomeStatement = getIncomeStatement(accounts)
  const balanceSheet = getBalanceSheet(accounts)
  const tax = incomeStatement.fields.get(7528) ?? 0
  const taxAdjustments = getTaxAdjustments(
    incomeStatement.result,
    input.taxAdjustments,
    tax,
  )

  const main = new Map<number, number>([
    [
      taxAdjustments.taxable >= 0 ? 7104 : 7114,
      Math.abs(taxAdjustments.taxable),
    ],
  ])

  incomeStatement.fields.set(
    incomeStatement.result >= 0 ? 7450 : 7550,
    Math.abs(incomeStatement.result),
  )

  const blocks = [
    { type: 'INK2', fields: main },
    {
      type: 'INK2R',
      fields: new Map([...balanceSheet, ...incomeStatement.fields]),
    },
    { type: 'INK2S', fields: taxAdjustments.fields },
  ].map(({ type, fields }) =>
    [
      `#BLANKETT ${type}-${period}`,
      `#IDENTITET ${identity} ${formatDate(createdAt)} ${formatTime(createdAt)}`,
      `#NAMN ${company.name}`,
      `#UPPGIFT 7011 ${start}`,
      `#UPPGIFT 7012 ${end}`,
      ...[...fields].map(([field, value]) => `#UPPGIFT ${field} ${value}`),
      '#BLANKETTSLUT',
    ].join('\n'),
  )

  const blanketter = [...blocks, '#FIL_SLUT'].join('\n') + '\n'

  const info =
    [
      '#DATABESKRIVNING_START',
      '#PRODUKT SRU',
      `#SKAPAD ${formatDate(createdAt)} ${formatTime(createdAt)}`,
      '#PROGRAM https://johan.li 1.0',
      '#FILNAMN BLANKETTER.SRU',
      '#DATABESKRIVNING_SLUT',
      '#MEDIELEV_START',
      `#ORGNR ${identity}`,
      `#NAMN ${company.name}`,
      `#POSTNR ${company.postNr}`,
      `#POSTORT ${company.postOrt}`,
      '#MEDIELEV_SLUT',
    ].join('\n') + '\n'

  return { info, blanketter }
}
