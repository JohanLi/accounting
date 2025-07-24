/*
  Dates will be represented as string throughout this application. They'll
  still be stored as timestamp in the database, and manipulations will be done
  by converting them to Date objects.

  One inconvenience is that inferring timestamp as string seems to be bugged
  in Drizzle https://github.com/drizzle-team/drizzle-orm/issues/806

  For now the inferred typings will be hacky – timestamps are Dates, but
  because they're returned using json(), they're actually strings.
 */

type Props = {
  value: string
  onChange: (value: string) => void
}

export function DateInput(props: Props) {
  return (
    <input
      type="date"
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      className="w-32 block rounded-md border-0 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
    />
  )
}
