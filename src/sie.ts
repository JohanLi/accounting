import { VerificationInsert } from './pages/api/import'

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

export function extractVerifications(input: string) {
  const verifications: VerificationInsert[] = []

  const lines = input.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#VER')) {
      // https://stackoverflow.com/a/16261693
      const found = lines[i].match(/(?:[^\s"]+|"[^"]*")+/g)

      if (!found) {
        throw Error('#VER line contains no fields')
      }

      const [, , number, date, description, createdAt] = found.map(removeQuotes)

      const verification: VerificationInsert = {
        id: parseInt(number),
        date: extractDate(date),
        description,
        createdAt: extractDate(createdAt),
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

        // "dimensions" comes after accountCode, but it's not used in my bookkeeping
        const [, accountCode, , amount] = lines[i].split(' ')

        verification.transactions.push({
          accountCode: parseInt(accountCode),
          amount: Math.round(parseFloat(amount) * 100),
        })

        i++
      }

      verifications.push(verification)
    }
  }

  return verifications
}

export function getUniqueAccountCodes(
  verifications: Pick<VerificationInsert, 'transactions'>[],
) {
  const accountCodes: number[] = []

  for (const verification of verifications) {
    for (const transaction of verification.transactions) {
      if (!accountCodes.includes(transaction.accountCode)) {
        accountCodes.push(transaction.accountCode)
      }
    }
  }

  return accountCodes
}
