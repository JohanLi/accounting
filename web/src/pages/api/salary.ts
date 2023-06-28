import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { getSalaryTaxes } from '../../tax'
import db from '../../db'
import { Transactions, Verifications } from '../../schema'
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
    const insertedVerifications = await db
      .insert(Verifications)
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
      .returning({ id: Verifications.id })

    const transactions = [
      [
        {
          accountCode: 1930, // Bankkonto
          amount: -(amount - personalIncomeTax),
        },
        {
          accountCode: 7210, // Löner till tjänstemän
          amount,
        },
        {
          accountCode: 2710, // Personalskatt
          amount: -personalIncomeTax,
        },
        {
          accountCode: 7510, // Arbetsgivaravgifter
          amount: payrollTax,
        },
        {
          accountCode: 2731, // Avräkning lagstadgade sociala avgifter
          amount: -payrollTax,
        },
      ],
      [
        {
          accountCode: 1630, // Skattekonto
          amount: -(personalIncomeTax + payrollTax),
        },
        {
          accountCode: 2710, // Personalskatt
          amount: personalIncomeTax,
        },
        {
          accountCode: 2731, // Avräkning lagstadgade sociala avgifter
          amount: payrollTax,
        },
      ],
      [
        {
          accountCode: 1630, // Skattekonto
          amount: personalIncomeTax + payrollTax,
        },
        {
          accountCode: 1930, // Företagskonto
          amount: -(personalIncomeTax + payrollTax),
        },
      ],
    ]

    for (const [i, verification] of insertedVerifications.entries()) {
      await db.insert(Transactions).values(
        transactions[i].map((transaction) => ({
          ...transaction,
          verificationId: verification.id,
        })),
      )
    }

    res.json(insertedVerifications)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
