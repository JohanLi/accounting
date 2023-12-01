'use server'

import { getSalaryTaxes, SALARY_ACCOUNT_ID } from '../../src/tax'
import { validate } from '../../src/validateJournalEntry'
import { upsertJournalEntry } from '../../src/pages/api/journalEntries'

export async function create(amount: number) {
  const { preliminaryIncomeTax, payrollTax } = getSalaryTaxes(amount)

  const transactions = [
    {
      accountId: 1930, // Bankkonto
      amount: -(amount - preliminaryIncomeTax),
    },
    {
      accountId: 2710, // Personalskatt
      amount: -preliminaryIncomeTax,
    },
    {
      accountId: 2731, // Avräkning lagstadgade sociala avgifter
      amount: -payrollTax,
    },
    {
      accountId: SALARY_ACCOUNT_ID, // Löner till tjänstemän
      amount,
    },
    {
      accountId: 7510, // Arbetsgivaravgifter
      amount: payrollTax,
    },
  ]

  const entry = {
    date: new Date(),
    description: 'Lön',
    transactions,
    linkedToTransactionIds: [],
  }

  const validatedEntry = validate(entry)
  return upsertJournalEntry(validatedEntry)
}
