'use client'

import { useState } from 'react'
import Select from '../../src/components/Select'
import { JournalEntry } from '../../src/components/JournalEntry'
import { getSalaryTaxes, PERSONAL_TAX } from '../../src/tax'
import { getAllIncomeYearsInReverse } from '../../src/utils'
import { Button } from '../../src/components/Button'
import { Amount } from '../../src/components/Amount'
import JournalEntryForm from '../../src/components/JournalEntryForm'
import useJournalEntries from '../../src/hooks/useJournalEntries'
import { AmountInput, formatAmount } from '../../src/components/AmountInput'

const SALARY_ACCOUNT_ID = 7210

// test case: switching years should close an opened create form

export default function Salary() {
  const journalEntries = useJournalEntries()

  const [selectedIncomeYear, setSelectedIncomeYear] = useState(
    new Date().getFullYear(),
  )

  const [create, setCreate] = useState(false)
  const [amount, setAmount] = useState(0)

  const reset = () => {
    setCreate(false)
    setAmount(0)
  }

  if (!journalEntries.data) {
    return null
  }

  let yearFilteredJournalEntries = journalEntries.data.filter(
    (journalEntry) =>
      new Date(journalEntry.date).getFullYear() === selectedIncomeYear &&
      journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID),
  )

  const incomeThisYear = yearFilteredJournalEntries.reduce(
    (acc, journalEntry) => {
      const income =
        journalEntry.transactions.find((t) => t.accountId === SALARY_ACCOUNT_ID)
          ?.amount || 0
      return acc + income
    },
    0,
  )

  const reachedLimit = incomeThisYear >= PERSONAL_TAX.annualSalary

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

  return (
    <>
      <div className="flex">
        <div className="flex space-x-8">
          <h1 className="text-base font-semibold leading-6 text-gray-900">
            Income this year
          </h1>
          <Amount amount={incomeThisYear} />
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <div className="text-gray-500">Year</div>
          <Select
            value={selectedIncomeYear}
            onChange={(year) => {
              setSelectedIncomeYear(year)
              reset()
            }}
            items={getAllIncomeYearsInReverse()}
          />
        </div>
      </div>
      <div className="mb-24 mt-4">
        {!create && (
          <>
            <Button
              type="primary"
              disabled={reachedLimit}
              onClick={() => setCreate(true)}
              text="Create"
            />
            {reachedLimit && (
              <div className="mt-4 max-w-md text-sm text-red-500">
                You have reached the annual salary limit of{' '}
                {formatAmount(PERSONAL_TAX.annualSalary)}, which the effective
                tax rate is based on. If you intend to pay more, you need to
                re-calculate the tax rate.
              </div>
            )}
          </>
        )}
        {create && (
          <div>
            <label className="block max-w-md">
              <div>Amount</div>
              <AmountInput
                value={amount}
                onChange={setAmount}
                placeholder={`max ${formatAmount(
                  PERSONAL_TAX.annualSalary - incomeThisYear,
                )}`}
              />
            </label>
            <JournalEntryForm
              key={amount}
              journalEntry={{
                date: new Date(),
                description: 'Lön',
                transactions,
                linkedToTransactionIds: [],
              }}
              onClose={() => {
                reset()
              }}
            />
          </div>
        )}
      </div>

      <h2 className="text-base font-semibold leading-6 text-gray-900">
        Journal entries
      </h2>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="w-32 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Date
            </th>
            <th
              scope="col"
              className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
            <th
              scope="col"
              className="w-48 py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Transactions
            </th>
            <th
              scope="col"
              className="py-3.5 pr-3 text-left text-sm font-semibold text-gray-900"
            >
              Documents
            </th>
            <th scope="col" className="w-16 py-3.5" />
            <th scope="col" className="py-3.5" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {yearFilteredJournalEntries.map((journalEntry) => (
            <JournalEntry key={journalEntry.id} journalEntry={journalEntry} />
          ))}
        </tbody>
      </table>
    </>
  )
}
