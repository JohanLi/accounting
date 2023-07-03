import Layout from '../components/Layout'
import Upload from '../components/Upload'
import Totals from '../components/Totals'
import Actions from '../components/Actions'
import Verifications from '../components/Verifications'
import { useQuery } from '@tanstack/react-query'
import { Verification } from './api/verifications'
import { useState } from 'react'
import { withinFiscalYear } from '../utils'
import Dropdown from '../components/Dropdown'

export default function Home() {
  const verifications = useQuery<Verification[]>({
    queryKey: ['verifications'],
    queryFn: () => fetch('/api/verifications').then((res) => res.json()),
  })

  // TODO hardcoded to 2023 right now, as no entries exist for 2024 yet
  const [selectedFiscalYear, setSelectedFiscalYear] = useState(2023)

  const filteredVerifications =
    verifications.data?.filter((verification) =>
      withinFiscalYear(verification, selectedFiscalYear),
    ) || []

  return (
    <Layout>
      <Upload />
      <Totals />
      <Actions />
      <div className="mt-8">
        <div className="flex justify-end">
          <div className="flex items-center space-x-4">
            <div className="text-gray-500">FY</div>
            <Dropdown
              selectedFiscalYear={selectedFiscalYear}
              setSelectedFiscalYear={setSelectedFiscalYear}
            />
          </div>
        </div>
        <Verifications verifications={filteredVerifications} />
      </div>
    </Layout>
  )
}
