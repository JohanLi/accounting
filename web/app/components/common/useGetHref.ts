import { usePathname, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'

export function useGetHref(name: string, defaultValue: string) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  return useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams)

      if (value !== defaultValue) {
        params.set(name, value.toString())
      } else {
        params.delete(name)
      }

      if (params.toString() === '') {
        return pathname
      }

      return `${pathname}?${params.toString()}`
    },
    [searchParams],
  )
}
