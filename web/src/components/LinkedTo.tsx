import { useQuery } from '@tanstack/react-query'
import { Verification } from '../pages/api/verifications'
import { InferModel } from 'drizzle-orm'
import { TransactionsBankTax } from '../schema'
import { LinkedToResponse } from '../pages/api/linkedTo'

export type LinkedToProps =
  | {
      verification: Verification
      transaction?: never
    }
  | {
      verification?: never
      transaction: InferModel<typeof TransactionsBankTax>
    }

export default function LinkedTo({ verification, transaction }: LinkedToProps) {
  const linkedTo = useQuery<LinkedToResponse>({
    queryKey: [
      'linkedTo',
      verification
        ? `verificationId=${verification.id}`
        : `bankTransactionId=${transaction.id}`,
    ],
    queryFn: ({ queryKey }) =>
      fetch(`/api/linkedTo?${queryKey[1]}`).then((res) => res.json()),
  })

  if (!linkedTo.data) {
    return null
  }

  const { linkedBankTransactions, linkedVerification } = linkedTo.data

  return (
    <div className="divide-y divide-gray-300">
      {verification && (
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            Verification
          </h2>
          <pre>{JSON.stringify(verification, null, 2)}</pre>
        </div>
      )}
      {transaction && (
        <div>
          <h2 className="text-base font-semibold leading-6 text-gray-900">
            {transaction.type}
          </h2>
          <pre>{JSON.stringify(transaction, null, 2)}</pre>
        </div>
      )}
      <div>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Transactions
        </h2>
        <pre>{JSON.stringify(linkedBankTransactions, null, 2)}</pre>
        <h2 className="text-base font-semibold leading-6 text-gray-900">
          Verifications
        </h2>
        <pre>{JSON.stringify(linkedVerification, null, 2)}</pre>
      </div>
    </div>
  )
}
