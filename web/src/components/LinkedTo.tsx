import { useQuery } from '@tanstack/react-query'
import { Verification } from '../pages/api/verifications'
import { TransactionsResponse } from '../pages/api/transactions'
import Verifications from './Verifications'
import TransactionsBank from './TransactionsBank'

export type LinkedToProps =
  | {
      verification: Verification
      taxTransaction?: never
      bankTransaction?: never
    }
  | {
      verification?: never
      taxTransaction: TransactionsResponse['tax'][0]
      bankTransaction?: never
    }
  | {
      verification?: never
      taxTransaction?: never
      bankTransaction: TransactionsResponse['regular'][0]
    }

export default function LinkedTo({
  verification,
  taxTransaction,
  bankTransaction,
}: LinkedToProps) {
  const verifications = useQuery<Verification[]>({
    queryKey: ['verifications'],
    queryFn: () => fetch('/api/verifications').then((res) => res.json()),
  })

  const transactions = useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })

  let linkedBankTransaction: TransactionsResponse['regular'][0] | undefined
  let linkedTaxTransaction: TransactionsResponse['tax'][0] | undefined
  let linkedVerification: Verification | undefined

  if (taxTransaction) {
    linkedBankTransaction = transactions.data?.regular.find(
      (transaction) =>
        transaction.verificationId === taxTransaction.verificationId,
    )

    linkedVerification = verifications.data?.find(
      (verification) => verification.id === taxTransaction.verificationId,
    )
  }

  return (
    <div className="absolute -right-2 z-10 mt-2 overflow-hidden rounded-lg bg-white p-6 text-left shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex justify-end gap-24">
        {linkedBankTransaction && (
          <div className="w-[500px]">
            <TransactionsBank
              transactions={[linkedBankTransaction]}
              type="regular"
            />
          </div>
        )}
        {linkedVerification && (
          <div className="w-[600px]">
            <Verifications verifications={[linkedVerification]} />
          </div>
        )}
      </div>
    </div>
  )
}
