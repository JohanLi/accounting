import ActiveLink from './ActiveLink'

const tabs = [
  {
    name: 'Home',
    href: '/',
  },
  {
    name: 'Journal entries',
    href: '/journalEntries',
  },
  {
    name: 'Transactions',
    href: '/transactions',
  },
  {
    name: 'Salary',
    href: '/salary',
  },
  {
    name: 'Account totals',
    href: '/accountTotals',
  },
]

export default function Nav() {
  return (
    <div className="mb-8 mt-4">
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <ActiveLink key={tab.name} href={tab.href}>
                {tab.name}
              </ActiveLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
