'use server'

import { updateJournalEntry } from '../actions/updateJournalEntry'
import { Transaction } from '../getJournalEntries'
import { SALARY_ACCOUNT_ID, getSalaryTaxes } from '../tax'

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
  ] satisfies Transaction[]

  const journalEntry = {
    date: new Date(),
    description: 'Lön',
    transactions,
    linkedToTransactionIds: [],
  }

  return updateJournalEntry(journalEntry)
}
