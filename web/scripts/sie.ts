import { krToOre } from '../src/utils'

function removeQuotes(input: string) {
  if (input.startsWith('"') && input.endsWith('"')) {
    return input.slice(1, -1)
  }

  return input
}

/*
  https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_080930.pdf
  https://sie.se/wp-content/uploads/2020/05/SIE_filformat_ver_4B_ENGLISH.pdf
 */

export function getAccountMap(input: string) {
  const accounts: { [key: number]: string } = {}

  const lines = input.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#KONTO')) {
      // https://stackoverflow.com/a/16261693
      const found = lines[i].match(/(?:[^\s"]+|"[^"]*")+/g)

      if (!found) {
        throw Error('#KONTO line contains no fields')
      }

      const [, code, description] = found.map(removeQuotes)

      accounts[parseInt(code)] = description
    }
  }

  return accounts
}

export function extractDate(input: string) {
  return new Date(input.replace(/(\d+)(\d{2})(\d{2})/g, '$1-$2-$3'))
}

type Transaction = {
  accountId: number
  amount: number
}

export type ImportVerification = {
  oldId: number
  date: Date
  description: string
  createdAt: Date
  deletedAt: Date | null
  transactions: Transaction[]
}

export function extractVerifications(input: string) {
  const verifications: ImportVerification[] = []

  const lines = input.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#VER')) {
      // https://stackoverflow.com/a/16261693
      const found = lines[i].match(/(?:[^\s"]+|"[^"]*")+/g)

      if (!found) {
        throw Error('#VER line contains no fields')
      }

      const [, , number, date, description, createdAt] = found.map(removeQuotes)

      const verification: ImportVerification = {
        oldId: parseInt(number),
        date: extractDate(date),
        description,
        createdAt: extractDate(createdAt),
        deletedAt: null,
        transactions: [],
      }

      if (!lines[i + 1].startsWith('{')) {
        throw Error('Line after #VER does not start with "{"')
      }

      i = i + 2

      while (!lines[i].startsWith('}')) {
        if (!lines[i].startsWith('\t#TRANS')) {
          throw Error('Line after "{" does not start with "\t#TRANS"')
        }

        // "dimensions" comes after accountId, but it's not used in my bookkeeping
        const [, accountId, , amount] = lines[i].trim().split(' ')

        verification.transactions.push({
          accountId: parseInt(accountId),
          amount: krToOre(amount),
        })

        i++
      }

      verifications.push(verification)
    }
  }

  return verifications
}

export function getUniqueAccountIds(verifications: ImportVerification[]) {
  const accountIds: number[] = []

  for (const verification of verifications) {
    for (const transaction of verification.transactions) {
      if (!accountIds.includes(transaction.accountId)) {
        accountIds.push(transaction.accountId)
      }
    }
  }

  return accountIds
}

export function markDeletedAndRemoveNegations(
  verifications: ImportVerification[],
) {
  const deletedIdsAndDate: { [id: number]: Date } = {}

  const removedNegations = verifications.filter((verification) => {
    const id = verification.description.match(/^Annullering av V(\d+)/)?.[1]

    if (id) {
      deletedIdsAndDate[parseInt(id)] = verification.createdAt
      return false
    }

    return true
  })

  return removedNegations.map((verification) => {
    const deletedAt = deletedIdsAndDate[verification.oldId]

    if (deletedAt) {
      verification.deletedAt = deletedAt
    }

    return verification
  })
}
