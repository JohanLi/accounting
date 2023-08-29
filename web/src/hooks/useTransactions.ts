import { useQuery } from '@tanstack/react-query'
import { TransactionsResponse } from '../pages/api/transactions'

export default function useTransactions() {
  return useQuery<TransactionsResponse>({
    queryKey: ['transactions'],
    queryFn: () => fetch('/api/transactions').then((res) => res.json()),
  })
}
