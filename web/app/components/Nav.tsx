import Image from 'next/image'
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
    name: 'Account totals',
    href: '/accountTotals',
  },
]

const specializedToolsTabs = [
  {
    name: 'Salary',
    href: '/salary',
  },
  {
    name: 'Corporate tax',
    href: '/corporate-tax',
  },
  {
    name: 'Annual-related',
    href: '/annual-related',
  },
]

export default function Nav() {
  return (
    <div className="flex grow flex-col gap-y-8 bg-gray-900 px-6 py-8">
      <Image
        src="/icon.development.png"
        width={60}
        height={60}
        alt="logo"
        priority
      />
      <nav className="flex flex-1">
        <ul role="list" className="flex flex-1 flex-col gap-y-8">
          <li>
            <ul role="list" className="-mx-2 space-y-2">
              {tabs.map((tab) => (
                <li key={tab.name}>
                  <ActiveLink href={tab.href}>{tab.name}</ActiveLink>
                </li>
              ))}
            </ul>
          </li>
          <li>
            <div className="mb-2 text-xs font-semibold leading-6 text-gray-400">
              Specialized tools
            </div>
            <ul role="list" className="-mx-2 space-y-2">
              {specializedToolsTabs.map((tab) => (
                <li key={tab.name}>
                  <ActiveLink href={tab.href}>{tab.name}</ActiveLink>
                </li>
              ))}
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  )
}
