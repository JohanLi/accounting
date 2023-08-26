import type { NextApiRequest, NextApiResponse } from 'next'
import db from '../../../db'
import { Transactions } from '../../../schema'
import { and, asc, eq, gte, InferModel, isNull } from 'drizzle-orm'
import { JournalEntryInsert } from '../journalEntries'
import { filterNull } from '../../../utils'

/*
  Some of the existing accounting entries for FY 2023 need to be revised.
  My previous accounting software, due to having no integration with Skatteverket,
  instructs you to, in essence, aggregate entries.

  While it works from an accounting perspective, it doesn't allow you to
  match tax account transactions with entries one-to-one:
  when Personalskatt and Arbetsgivaravgift are withdrawn from the tax account,
  they actually show up as separate transactions.
 */

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
      credit: 8314, // Skattefria ränteintäkter
      description: 'Intäktsränta',
    }
  }

  if (
    description === 'Kostnadsränta' ||
    description === 'Korrigerad kostnadsränta'
  ) {
    return {
      debit: 1630,
      credit: 8423, // Kostnadsränta för skatter och avgifter
      description: 'Kostnadsränta',
    }
  }

  if (description === 'Debiterad preliminärskatt') {
    return {
      debit: 1630,
      /*
        TODO
          My previous accounting software used 2510 Skatteskulder,
          but two sources recommend using 2518 – Betald F-skatt to
          keep different types of taxes separate.

          https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/preliminarskatt-i-aktiebolag
          https://www.arsredovisning-online.se/bokfora_slutlig_skatt
       */
      credit: 2510, // Skatteskulder
      description: 'Debiterad preliminärskatt',
    }
  }

  // TODO more research needs to be done on this one
  if (description === 'Utbetalning') {
    return {
      debit: 2510,
      credit: 1930,
      description: 'Utbetalning',
    }
  }

  // TODO more research needs to be done on this one
  if (description === 'Tillgodoförd debiterad preliminärskatt') {
    return {
      debit: 1630,
      credit: 2510,
      description: 'Tillgodoförd debiterad preliminärskatt',
    }
  }

  if (description.startsWith('Moms ')) {
    return {
      debit: 1630,
      credit: 2650, // Redovisningskonto för moms
      description: 'Dragning av moms',
    }
  }

  /*
    TODO
      More investigation needs to be done to understand how this works from an accounting perspective.
      What's unclear to me is whether 2650 or 1650 should be used.
      Potential sources:
      - https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/moms-pa-skattekonto
      - https://forum.bjornlunden.se/org/blinfo/d/ater-om-momsfordran-och-konto-1650/
      - https://foretagande.se/forum/bokforing-skatter-och-foretagsformer/72760-konto-1650-momsfordran
   */
  if (description.startsWith('Beslut ')) {
    return {
      debit: 1630,
      credit: 1650,
      description: 'Beslut',
    }
  }

  if (description.startsWith('Arbetsgivaravgift ')) {
    return {
      debit: 1630,
      credit: 2731, // Avräkning lagstadgade sociala avgifter
      description: 'Arbetsgivaravgift',
    }
  }

  if (description.startsWith('Avdragen skatt ')) {
    return {
      debit: 1630,
      credit: 2710, // Personalskatt
      description: 'Personalskatt',
    }
  }

  return null
}

async function searchForBankTransaction(
  taxTransaction: InferModel<typeof Transactions, 'insert'>,
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

export type SuggestionsResponse = (JournalEntryInsert & {
  linkedToTransactionIds: number[]
})[]

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuggestionsResponse>,
) {
  if (req.method === 'GET') {
    const taxTransactions = await db
      .select()
      .from(Transactions)
      .where(
        and(
          eq(Transactions.type, 'tax'),
          isNull(Transactions.journalEntryId),
          /*
           TODO
             The software should not suggest transactions for closed fiscal years.
             Hard coding for now.
           */
          gte(Transactions.date, new Date('2022-07-01')),
        ),
      )
      .orderBy(asc(Transactions.id))

    const taxSuggestions = await Promise.all(
      taxTransactions.map(async (transaction) => {
        const match = taxAccountMap(transaction.description)

        if (!match) {
          return null
        }

        const transactions = [
          { accountId: match.debit, amount: transaction.amount },
          { accountId: match.credit, amount: -transaction.amount },
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

    const bankSavingsTransactions = await db
      .select()
      .from(Transactions)
      .where(
        and(
          eq(Transactions.type, 'bankSavings'),
          isNull(Transactions.journalEntryId),
          gte(Transactions.date, new Date('2022-07-01')),
        ),
      )
      .orderBy(asc(Transactions.id))

    // doesn't need to be performant, as these suggestions are far and few between
    const bankSavingsSuggestions = await Promise.all(
      bankSavingsTransactions.map(async (transaction) => {
        const bankRegularTransactionMatch = await db
          .select()
          .from(Transactions)
          .where(
            and(
              eq(Transactions.type, 'bankRegular'),
              isNull(Transactions.journalEntryId),
              eq(Transactions.date, transaction.date),
              eq(Transactions.amount, -transaction.amount),
            ),
          )

        if (!bankRegularTransactionMatch.length) {
          return null
        }

        const transactions = [
          { accountId: 1930, amount: -transaction.amount },
          { accountId: 1931, amount: transaction.amount },
        ]

        const linkedToTransactionIds = [
          transaction.id,
          bankRegularTransactionMatch[0].id,
        ]

        return {
          date: transaction.date,
          // TODO implement a way to tag journal entries
          description: `Bank – överföring sparkonto`,
          transactions,
          linkedToTransactionIds,
        }
      }),
    )

    res
      .status(200)
      .json(filterNull([...taxSuggestions, ...bankSavingsSuggestions]))
    return
  }

  res.status(405)
}
