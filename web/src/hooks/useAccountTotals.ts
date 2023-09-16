import { useQuery } from '@tanstack/react-query'
import { AccountTotalsResponse } from '../pages/api/accountTotals'

export function useAccountTotals(selectedFiscalYear: number) {
  return useQuery<AccountTotalsResponse>({
    queryKey: ['accounts', selectedFiscalYear],
    queryFn: () =>
      fetch(`/api/accountTotals?fiscalYear=${selectedFiscalYear}`).then((res) =>
        res.json(),
      ),
  })
}
