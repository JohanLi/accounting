import type { NextApiRequest, NextApiResponse } from 'next'
import db, { logPostgresError } from '../../db'
import { Transactions, TransactionsTax, Verifications } from '../../schema'
import { asc, eq, InferModel, isNull } from 'drizzle-orm'

/*
  Some of the existing accounting entries for FY 2023 need to be revised.
  My previous accounting software, due to having no integration with Skatteverket,
  instructs you to, in essence, aggregate entries.

  While it works from an accounting perspective, it doesn't allow you to
  match tax account transactions with entries one-to-one:
  when Personalskatt and Arbetsgivaravgift are withdrawn from the tax account,
  they actually show up as separate transactions.
 */
function taxTransactionToVerification(
  transaction: InferModel<typeof TransactionsTax>,
) {
  const { date, description, amount } = transaction

  let verificationDescription = ''
  let verificationTransactions: { accountCode: number; amount: number }[] = []

  if (description.startsWith('Inbetalning bokförd ')) {
    verificationDescription = 'Skattekonto – insättning'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 1930,
        amount: -amount,
      },
    ]
  } else if (
    description === 'Intäktsränta' ||
    description === 'Korrigerad intäktsränta'
  ) {
    verificationDescription =
      description === 'Intäktsränta'
        ? 'Skattekonto – intäktsränta'
        : 'Skattekonto – intäktsränta (korrigering)'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 8314, // Skattefria ränteintäkter
        amount: -amount,
      },
    ]
  } else if (
    description === 'Kostnadsränta' ||
    description === 'Korrigerad kostnadsränta'
  ) {
    verificationDescription =
      description === 'Kostnadsränta'
        ? 'Skattekonto – kostnadsränta'
        : 'Skattekonto – kostnadsränta (korrigering)'
    verificationTransactions = [
      {
        accountCode: 1630,
        // it's not -amount because the amount is already negative
        amount,
      },
      {
        accountCode: 8423, // Kostnadsränta för skatter och avgifter
        amount: -amount,
      },
    ]
  } else if (description === 'Debiterad preliminärskatt') {
    verificationDescription = 'Skattekonto – preliminärskatt'
    verificationTransactions = [
      {
        accountCode: 1630,
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
        accountCode: 2510, // Skatteskulder
        amount: -amount,
      },
    ]
  } else if (description === 'Utbetalning') {
    // TODO more research needs to be done on this one
    verificationDescription = 'Skattekonto – fått tillbaka'
    verificationTransactions = [
      {
        accountCode: 1930,
        amount: -amount,
      },
      {
        accountCode: 2510,
        amount,
      },
    ]
  } else if (description === 'Tillgodoförd debiterad preliminärskatt') {
    // TODO more research needs to be done on this one
    verificationDescription =
      'Skattekonto – tillgodoförd debiterad preliminärskatt'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 2510,
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Moms ')) {
    // https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/moms
    verificationDescription = 'Skattekonto – dragning av moms'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 2650, // Redovisningskonto för moms
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
    verificationDescription = 'Skattekonto – beslut'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 1650,
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Arbetsgivaravgift ')) {
    verificationDescription = 'Skattekonto – arbetsgivaravgift'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 2731, // Avräkning lagstadgade sociala avgifter
        amount: -amount,
      },
    ]
  } else if (description.startsWith('Avdragen skatt ')) {
    verificationDescription = 'Skattekonto – personalskatt'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 2710, // Personalskatt
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
    verificationDescription = 'Skattekonto – förseningsavgift'
    verificationTransactions = [
      {
        accountCode: 1630,
        amount,
      },
      {
        accountCode: 6992, // Övriga externa kostnader, ej avdragsgilla
        amount: -amount,
      },
    ]
  }

  if (!verificationDescription || !verificationTransactions.length) {
    throw new Error(
      `Unknown tax transaction: ${JSON.stringify(transaction, null, 2)}`,
    )
  }

  const verification: InferModel<typeof Verifications, 'insert'> = {
    date,
    description: verificationDescription,
  }

  return { verification, transactions: verificationTransactions }
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'PUT') {
    const transactionsLackingEntries = await db
      .select()
      .from(TransactionsTax)
      .where(isNull(TransactionsTax.verificationId))
      .orderBy(asc(TransactionsTax.id))

    try {
      await db.transaction(async (tx) => {
        for (const transaction of transactionsLackingEntries) {
          const entry = taxTransactionToVerification(transaction)

          const insertedVerification = await tx
            .insert(Verifications)
            .values(entry.verification)
            .returning({ id: Verifications.id })

          await tx.insert(Transactions).values(
            entry.transactions.map((transaction) => ({
              ...transaction,
              verificationId: insertedVerification[0].id,
            })),
          )

          await tx
            .update(TransactionsTax)
            .set({
              verificationId: insertedVerification[0].id,
            })
            .where(eq(TransactionsTax.id, transaction.id))
        }
      })
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
