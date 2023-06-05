import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'
import { prisma } from '../../db'
import { getSalaryTaxes } from '../../tax'

const SalaryRequest = z.object({
  amount: z.number(),
})

export type SalaryRequest = z.infer<typeof SalaryRequest>

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.status(405).end()
    return
  }

  // TODO: the business logic of storing amounts in ören should be centralized
  const amount = SalaryRequest.parse(req.body).amount * 100

  const { personalIncomeTax, payrollTax } = getSalaryTaxes(amount)

  const date = new Date()

  try {
    // https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/loneutbetalning
    const createdVerifications = await prisma.$transaction([
      prisma.verification.create({
        data: {
          date,
          // löneutbetalning
          description: 'Lön',
          transactions: {
            create: [
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
          },
        },
      }),
      prisma.verification.create({
        data: {
          date,
          // efter inlämnad arbetsgivardeklaration
          description: 'Lön (skuld till Skatteverket)',
          transactions: {
            create: [
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
          },
        },
      }),
      prisma.verification.create({
        data: {
          date,
          description: 'Lön (betalning till Skatteverket)',
          transactions: {
            create: [
              {
                accountCode: 1630, // Skattekonto
                amount: personalIncomeTax + payrollTax,
              },
              {
                accountCode: 1930, // Företagskonto
                amount: -(personalIncomeTax + payrollTax),
              },
            ],
          },
        },
      }),
    ])
    res.json(createdVerifications)
  } catch (e) {
    console.error(e)
    res.status(500).json({})
  }
}

export default handler
