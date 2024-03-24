import db from '../db'
import { Transactions } from '../schema'
import { and, eq, InferInsertModel } from 'drizzle-orm'
import { getTaxTransactions } from './getTaxTransactions'

function taxAccountMap(description: string): {
  debit: number
  credit: number
  description: string
  searchForBankTransaction?: true
} | null {
  if (description.startsWith('Inbetalning bokförd ')) {
    return {
      debit: 1630,
      credit: 1930,
      description: 'Insättning',
      searchForBankTransaction: true,
    }
  }

  if (
    description === 'Intäktsränta' ||
    description === 'Korrigerad intäktsränta'
  ) {
    return {
      debit: 1630,
      credit: 8314, // Skattefria ränteintäkter (Ej skattepliktiga intäkter)
      description,
    }
  }

  if (
    description === 'Kostnadsränta' ||
    description === 'Korrigerad kostnadsränta'
  ) {
    return {
      credit: 1630,
      debit: 8423, // Kostnadsränta för skatter och avgifter (Ej avdragsgilla kostnader)
      description,
    }
  }

  if (description === 'Debiterad preliminärskatt') {
    return {
      credit: 1630,
      /*
        https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/preliminarskatt-i-aktiebolag
        https://www.arsredovisning-online.se/bokfora_slutlig_skatt
       */
      debit: 2510, // Skatteskulder
      description: 'Debiterad preliminärskatt',
    }
  }

  if (description === 'Tillgodoförd debiterad preliminärskatt') {
    return {
      debit: 1630,
      credit: 2510,
      description: 'Tillgodoförd debiterad preliminärskatt',
    }
  }

  /*
    I'm not sure what exactly triggers this, but it seems to be related to:
    - when you've paid too much in preliminary tax, and after it's compared against the actual value
    - same as above, but for VAT (perhaps related to amending a VAT return?)

    Usually, it's two transactions from Skatteverket: the first one "refunds"
    your tax account and the second one moves it from your tax account to your
    bank account. "Utbetalning" is the second transaction.
   */
  if (description === 'Utbetalning') {
    return {
      credit: 1630,
      debit: 1930,
      description: 'Utbetalning',
    }
  }

  if (description.startsWith('Moms ')) {
    return {
      credit: 1630,
      debit: 2650, // Redovisningskonto för moms
      description: 'Dragning av moms',
    }
  }

  /*
    To make things simpler, 2650 will be used for VAT. In the unlikely event that 2650 (liability) is positive
    when the fiscal year ends, it'll be moved to 1650 (asset).
   */
  if (/^Beslut \d{6} moms /.test(description)) {
    return {
      credit: 1630,
      debit: 2650, // Redovisningskonto för moms
      description: 'Beslut moms',
    }
  }

  if (description.startsWith('Arbetsgivaravgift ')) {
    return {
      credit: 1630,
      debit: 2731, // Avräkning lagstadgade sociala avgifter
      description: 'Arbetsgivaravgift',
    }
  }

  if (/^(Avdragen skatt|Beslut \d{6} avdragen skatt)/.test(description)) {
    return {
      credit: 1630,
      debit: 2710, // Personalskatt
      description: 'Personalskatt',
    }
  }

  if (description === 'Slutlig skatt') {
    return {
      credit: 1630,
      debit: 2510,
      description: 'Slutlig skatt',
    }
  }

  return null
}

async function searchForBankTransaction(
  taxTransaction: InferInsertModel<typeof Transactions>,
) {
  const depositedFromPersonalAccount =
    taxTransaction.date < new Date('2021-09-01')
  const depositedFromNoLongerUsedBank =
    taxTransaction.date >= new Date('2022-10-10') &&
    taxTransaction.date < new Date('2023-03-01')

  if (depositedFromPersonalAccount || depositedFromNoLongerUsedBank) {
    return null
  }

  const yesterday = new Date(taxTransaction.date)
  yesterday.setDate(yesterday.getDate() - 1)

  const bankTransactions = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'bankRegular'),
        eq(Transactions.date, yesterday),
        eq(Transactions.amount, -taxTransaction.amount),
      ),
    )

  if (!bankTransactions.length) {
    console.error(
      `Could not find bank transaction for ${JSON.stringify(
        taxTransaction,
        null,
        2,
      )}`,
    )
    return null
  }

  if (bankTransactions.length > 1) {
    console.error(
      `Found multiple bank transactions for ${JSON.stringify(
        taxTransaction,
        null,
        2,
      )}`,
    )
    return null
  }

  return bankTransactions[0].id
}

export async function getTaxSuggestions() {
  const taxTransactions = await getTaxTransactions()

  return Promise.all(
    taxTransactions.map(async (transaction) => {
      const match = taxAccountMap(transaction.description)

      if (!match) {
        return null
      }

      const amount =
        match.debit === 1630 ? transaction.amount : -transaction.amount

      const transactions = [
        { accountId: match.debit, amount },
        { accountId: match.credit, amount: -amount },
      ]

      const linkedToTransactionIds = [transaction.id]

      if (match.searchForBankTransaction) {
        const bankTransactionId = await searchForBankTransaction(transaction)

        if (bankTransactionId) {
          linkedToTransactionIds.push(bankTransactionId)
        }
      }

      return {
        date: transaction.date,
        // TODO implement a way to tag journal entries
        description: `Skatt – ${match.description}`,
        transactions,
        linkedToTransactionIds,
      }
    }),
  )
}
