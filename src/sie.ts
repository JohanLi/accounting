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

type Verification = {
  id: string
  date: string
  description: string
  created: string
  transactions: {
    accountCode: string
    amount: string
  }[]
}

export function extractVerifications(input: string) {
  const verifications = []

  const lines = input.split('\n')

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#VER')) {
      // https://stackoverflow.com/a/16261693
      const found = lines[i].match(/(?:[^\s"]+|"[^"]*")+/g)

      if (!found) {
        throw Error('#VER line contains no fields')
      }

      const [, serie, number, date, description, created] =
        found.map(removeQuotes)

      const verification: Verification = {
        id: `${serie}-${number}`,
        date,
        description,
        created,
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
        const [, accountCode, _, amount] = lines[i].split(' ')

        verification.transactions.push({
          accountCode,
          amount,
        })

        i++
      }

      verifications.push(verification)
    }
  }

  return verifications
}
