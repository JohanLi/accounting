import { useQuery, useMutation } from '@tanstack/react-query'

type Account = {
  code: string
  description: string
}

export default function Accounts() {
  const accounts = useQuery<Account[]>({
    queryKey: ['accounts'],
    queryFn: () => fetch('/api/accounts').then((res) => res.json()),
  })

  const mutation = useMutation({
    mutationFn: (account: Account) =>
      fetch('/api/accounts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(account),
      }).then((res) => res.json()),
    onSuccess: () => {
      accounts.refetch()
    },
  })

  return (
    <div className="mt-8">
      <h1 className="text-base font-semibold leading-6 text-gray-900">
        Accounts
      </h1>
      <table className="min-w-full divide-y divide-gray-300">
        <thead>
          <tr>
            <th
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
            >
              Code
            </th>
            <th
              scope="col"
              className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900"
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {accounts.data?.map((account) => (
            <tr key={account.code}>
              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                {account.code}
              </td>
              <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                <input
                  type="text"
                  name="description"
                  autoComplete="off"
                  defaultValue={account.description}
                  onBlur={(e) => {
                    const { value } = e.target
                    const unchanged = value === account.description

                    if (unchanged) {
                      return
                    }

                    mutation.mutate({
                      code: account.code,
                      description: e.target.value,
                    })
                  }}
                  className="block w-full max-w-lg rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6"
                />
              </td>
            </tr>
          ))}
          {accounts.data?.length === 0 && (
            <tr>
              <td colSpan={2} className="py-4 px-3 text-sm text-gray-500">
                No accounts found. Import an SIE file first.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
