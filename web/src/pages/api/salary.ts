import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { getSalaryTaxes } from '../../tax'
import db from '../../db'
import { JournalEntryTransactions, JournalEntries } from '../../schema'
import { krToOre } from '../../utils'

const SalaryRequest = z.object({
  amount: z.number(),
})

export type SalaryRequest = z.infer<typeof SalaryRequest>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  const amount = krToOre(SalaryRequest.parse(req.body).amount)

  const { personalIncomeTax, payrollTax } = getSalaryTaxes(amount)

  const date = new Date()

  try {
    // https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/loneutbetalning
    const insertedJournalEntries = await db
      .insert(JournalEntries)
      .values([
        {
          date,
          description: 'Lön',
        },
        {
          date,
          description: 'Lön (skuld till Skatteverket)',
        },
        {
          date,
          description: 'Lön (betalning till Skatteverket)',
        },
      ])
      .returning({ id: JournalEntries.id })

    const transactions = [
      [
        {
          accountId: 1930, // Bankkonto
          amount: -(amount - personalIncomeTax),
        },
        {
          accountId: 7210, // Löner till tjänstemän
          amount,
        },
        {
          accountId: 2710, // Personalskatt
          amount: -personalIncomeTax,
        },
        {
          accountId: 7510, // Arbetsgivaravgifter
          amount: payrollTax,
        },
        {
          accountId: 2731, // Avräkning lagstadgade sociala avgifter
          amount: -payrollTax,
        },
      ],
    ]

    for (const [i, journalEntry] of insertedJournalEntries.entries()) {
      await db.insert(JournalEntryTransactions).values(
        transactions[i].map((transaction) => ({
          ...transaction,
          journalEntryId: journalEntry.id,
        })),
      )
    }

    res.json(insertedJournalEntries)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
