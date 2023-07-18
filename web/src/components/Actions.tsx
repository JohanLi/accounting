import Modal from './Modal'
import { PlusIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { getSalaryTaxes, PERSONAL_TAX } from '../tax'
import { classNames, formatNumber } from '../utils'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { SalaryRequest } from '../pages/api/salary'

/*
  To save time, this Salary component is not fool-proof:
  - It doesn't tell me how much in salary's already been paid out for my individual tax year.
  - There are no safeguards for going over the target annual salary (of which the personal income tax rate is based on)

  I usually only pay salary twice a year, so it's not difficult to keep track of the above.
 */

export default function Actions() {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState(0)

  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (body: SalaryRequest) =>
      fetch('/api/salary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }).then((res) => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['totals'] })
      queryClient.invalidateQueries({ queryKey: ['verifications'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
    },
  })

  const { personalIncomeTax, payrollTax } = getSalaryTaxes(amount)

  const onCreate = () => {
    if (!amount) {
      return
    }

    mutation.mutate({ amount })

    setAmount(0)
    setOpen(false)
  }

  const disabled = mutation.isLoading || !amount

  return (
    <div className="my-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Actions
      </h1>
      <button
        type="button"
        className="inline-flex items-center gap-x-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        onClick={() => setOpen(true)}
      >
        <PlusIcon className="-ml-0.5 h-5 w-5" />
        Salary
      </button>
      <Modal open={open} setOpen={setOpen}>
        <div>
          <label
            htmlFor="amount"
            className="block text-lg font-medium leading-6 text-gray-900"
          >
            Salary amount
          </label>
          <div className="mt-2">
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(e.target.valueAsNumber)}
              id="amount"
              className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>
        <table className="my-4 w-full border-spacing-4">
          <tbody>
            <tr>
              <td className="py-2 text-sm text-gray-500">
                <div>Personal income tax</div>
                <div className="text-xs text-gray-500">
                  based on an annual salary of {PERSONAL_TAX.annualSalary}
                </div>
              </td>
              <td className="py-2 pl-4 text-right text-sm  text-gray-900">
                {amount ? formatNumber(personalIncomeTax) : '0'}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-sm  text-gray-500">Payroll tax</td>
              <td className="py-2 pl-4 text-right text-sm text-gray-900">
                {amount ? formatNumber(payrollTax) : '0'}
              </td>
            </tr>
            <tr>
              <td className="py-2 text-sm text-gray-500">
                <div>Total</div>
                <div className="text-xs text-gray-500">
                  to transfer to tax account
                </div>
              </td>
              <td className="py-2 pl-4 text-right text-sm text-gray-900">
                {formatNumber(personalIncomeTax + payrollTax)}
              </td>
            </tr>
          </tbody>
        </table>
        <button
          type="button"
          className={classNames(
            'inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2',
            disabled ? 'cursor-not-allowed opacity-50' : '',
          )}
          onClick={() => onCreate()}
          disabled={disabled}
        >
          Create
        </button>
      </Modal>
    </div>
  )
}
