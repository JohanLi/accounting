import ActiveLink from './ActiveLink'

const tabs = [
  { name: 'Home', href: '/' },
  { name: 'Accounts', href: '/accounts' },
]

export default function Nav() {
  return (
    <div className="mb-8 mt-4">
      <div className="hidden sm:block">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <ActiveLink
                key={tab.name}
                href={tab.href}
                className="whitespace-nowrap border-b-2 px-1 py-4 text-sm font-medium"
                conditionalClassNames={[
                  'border-indigo-500 text-indigo-600',
                  'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                ]}
              >
                {tab.name}
              </ActiveLink>
            ))}
          </nav>
        </div>
      </div>
    </div>
  )
}
