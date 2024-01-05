// this isn't an exhaustive list – for outgoing VAT, I've only included the 25% rate
const VAT_ACCOUNT_IDS = [2610, 2614, 2640, 2645]

export function getJournalEntryTransactions({
  accounts,
  vatTotalTruncated,
}: {
  accounts: { id: number; amount: number }[]
  vatTotalTruncated: number
}) {
  const vatAccounts = accounts.filter((a) => VAT_ACCOUNT_IDS.includes(a.id))

  const transactions = vatAccounts.map((a) => ({
    accountId: a.id,
    amount: -a.amount,
  }))

  transactions.push({
    accountId: 2650,
    amount: -vatTotalTruncated,
  })

  const cents =
    -vatTotalTruncated - vatAccounts.reduce((acc, a) => acc + a.amount, 0)

  const centsAbs = Math.abs(cents)
  if (centsAbs > 0) {
    if (centsAbs > 200) {
      throw Error(`Remainder cents are ${cents}, which doesn't seem reasonable`)
    }

    transactions.push({
      accountId: 3740,
      amount: -cents,
    })
  }

  return transactions
}
