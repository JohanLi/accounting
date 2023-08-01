import type { NextApiRequest, NextApiResponse } from 'next'
import db, { logPostgresError } from '../../db'
import {
  JournalEntryTransactions,
  Transactions,
  JournalEntries,
} from '../../schema'
import { and, asc, eq, InferModel, isNotNull, isNull, like } from 'drizzle-orm'

/*
  Some of the existing accounting entries for FY 2023 need to be revised.
  My previous accounting software, due to having no integration with Skatteverket,
  instructs you to, in essence, aggregate entries.

  While it works from an accounting perspective, it doesn't allow you to
  match tax account transactions with entries one-to-one:
  when Personalskatt and Arbetsgivaravgift are withdrawn from the tax account,
  they actually show up as separate transactions.
 */
function taxTransactionToJournalEntry(
  transaction: InferModel<typeof Transactions>,
) {
  const { date, description, amount } = transaction

  let journalEntryDescription = ''
  let journalEntryTransactions: { accountId: number; amount: number }[] = []

  if (description.startsWith('Inbetalning bokförd ')) {
    journalEntryDescription = 'Skattekonto – insättning'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 1930,
        amount: -amount,
      },
    ]
  } else if (
    description === 'Intäktsränta' ||
    description === 'Korrigerad intäktsränta'
  ) {
    journalEntryDescription =
      description === 'Intäktsränta'
        ? 'Skattekonto – intäktsränta'
        : 'Skattekonto – intäktsränta (korrigering)'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 8314, // Skattefria ränteintäkter
        amount: -amount,
      },
    ]
  } else if (
    description === 'Kostnadsränta' ||
    description === 'Korrigerad kostnadsränta'
  ) {
    journalEntryDescription =
      description === 'Kostnadsränta'
        ? 'Skattekonto – kostnadsränta'
        : 'Skattekonto – kostnadsränta (korrigering)'
    journalEntryTransactions = [
      {
        accountId: 1630,
        // it's not -amount because the amount is already negative
        amount,
      },
      {
        accountId: 8423, // Kostnadsränta för skatter och avgifter
        amount: -amount,
      },
    ]
  } else if (description === 'Debiterad preliminärskatt') {
    journalEntryDescription = 'Skattekonto – preliminärskatt'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        /*
          TODO
            My previous accounting software used 2510 Skatteskulder,
            but two sources recommend using 2518 – Betald F-skatt to
            keep different types of taxes separate.

            https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/preliminarskatt-i-aktiebolag
            https://www.arsredovisning-online.se/bokfora_slutlig_skatt
         */
        accountId: 2510, // Skatteskulder
        amount: -amount,
      },
    ]
  } else if (description === 'Utbetalning') {
    // TODO more research needs to be done on this one
    journalEntryDescription = 'Skattekonto – fått tillbaka'
    journalEntryTransactions = [
      {
        accountId: 1930,
        amount: -amount,
      },
      {
        accountId: 2510,
        amount,
      },
    ]
  } else if (description === 'Tillgodoförd debiterad preliminärskatt') {
    // TODO more research needs to be done on this one
    journalEntryDescription =
      'Skattekonto – tillgodoförd debiterad preliminärskatt'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 2510,
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Moms ')) {
    // https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/moms
    journalEntryDescription = 'Skattekonto – dragning av moms'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 2650, // Redovisningskonto för moms
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Beslut ')) {
    /*
      TODO
        More investigation needs to be done to understand how this works from an accounting perspective.
        What's unclear to me is whether 2650 or 1650 should be used.
        Potential sources:
        - https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/moms-pa-skattekonto
        - https://forum.bjornlunden.se/org/blinfo/d/ater-om-momsfordran-och-konto-1650/
        - https://foretagande.se/forum/bokforing-skatter-och-foretagsformer/72760-konto-1650-momsfordran
     */
    journalEntryDescription = 'Skattekonto – beslut'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 1650,
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Arbetsgivaravgift ')) {
    journalEntryDescription = 'Skattekonto – arbetsgivaravgift'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 2731, // Avräkning lagstadgade sociala avgifter
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Avdragen skatt ')) {
    journalEntryDescription = 'Skattekonto – personalskatt'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 2710, // Personalskatt
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Förs.avgift ')) {
    /*
      Got hit by this the very first month my company got registered as
      an employer, even though it didn't have any employees. Sadge

      TODO
        Previous accounting software used to debit 8423, but in late 2022
        they changed it to 6992. Most sources say 6992. Investigation needed.

      Also, 1930 was credited instead of 1630. Again, skipping the debiting
      and crediting of 1630 works, but if we want to create entries based on
      tax account transactions it'll get messy.
     */
    journalEntryDescription = 'Skattekonto – förseningsavgift'
    journalEntryTransactions = [
      {
        accountId: 1630,
        amount,
      },
      {
        accountId: 6992, // Övriga externa kostnader, ej avdragsgilla
        amount: -amount,
      },
    ]
  }

  if (!journalEntryDescription || !journalEntryTransactions.length) {
    throw new Error(
      `Unknown tax transaction: ${JSON.stringify(transaction, null, 2)}`,
    )
  }

  const journalEntry: InferModel<typeof JournalEntries, 'insert'> = {
    date,
    description: journalEntryDescription,
  }

  return { journalEntry, transactions: journalEntryTransactions }
}

async function linkDeposits() {
  const transactionsLackingEntries = await db
    .select()
    .from(Transactions)
    .where(
      and(
        eq(Transactions.type, 'tax'),
        like(Transactions.description, 'Inbetalning bokförd %'),
        isNotNull(Transactions.linkedToJournalEntryId),
      ),
    )
    .orderBy(asc(Transactions.id))

  for (const entry of transactionsLackingEntries) {
    const depositedFromPersonalAccount = entry.date < new Date('2021-09-01')
    const depositedFromNoLongerUsedBank =
      entry.date >= new Date('2022-10-10') &&
      entry.date < new Date('2023-03-01')

    if (depositedFromPersonalAccount || depositedFromNoLongerUsedBank) {
      continue
    }

    const yesterday = new Date(entry.date)
    yesterday.setDate(yesterday.getDate() - 1)

    const bankTransactions = await db
      .select()
      .from(Transactions)
      .where(
        and(
          eq(Transactions.type, 'bankRegular'),
          eq(Transactions.date, yesterday),
          eq(Transactions.amount, -entry.amount),
        ),
      )

    if (!bankTransactions.length) {
      throw new Error(
        `Could not find bank transaction for ${JSON.stringify(entry, null, 2)}`,
      )
    }

    if (bankTransactions.length > 1) {
      throw new Error(
        `Found multiple bank transactions for ${JSON.stringify(
          entry,
          null,
          2,
        )}`,
      )
    }

    await db
      .update(Transactions)
      .set({ linkedToJournalEntryId: entry.linkedToJournalEntryId })
      .where(eq(Transactions.id, bankTransactions[0].id))
  }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const transactionsLackingEntries = await db
      .select()
      .from(Transactions)
      .where(
        and(
          eq(Transactions.type, 'tax'),
          isNull(Transactions.linkedToJournalEntryId),
        ),
      )
      .orderBy(asc(Transactions.id))

    try {
      await db.transaction(async (tx) => {
        for (const transaction of transactionsLackingEntries) {
          const entry = taxTransactionToJournalEntry(transaction)

          const insertedjournalEntry = await tx
            .insert(JournalEntries)
            .values(entry.journalEntry)
            .returning({ id: JournalEntries.id })

          await tx.insert(JournalEntryTransactions).values(
            entry.transactions.map((transaction) => ({
              ...transaction,
              journalEntryId: insertedjournalEntry[0].id,
            })),
          )

          await tx
            .update(Transactions)
            .set({
              linkedToJournalEntryId: insertedjournalEntry[0].id,
            })
            .where(eq(Transactions.id, transaction.id))
        }
      })

      await linkDeposits()
    } catch (e) {
      console.error(e)
      logPostgresError(e)

      res.status(500).json({})
      return
    }

    res.status(200).json({})
    return
  }

  res.status(405).end()
  return
}

export default handler
