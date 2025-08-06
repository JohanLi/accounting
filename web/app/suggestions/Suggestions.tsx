import { H2 } from '../components/common/heading'
import {
  DateOrAccountCodeTh,
  DescriptionTh,
  DocumentTh,
  EditTh,
  LinkedTh,
  Table,
  TableBody,
  TableHeader,
  TransactionsTh,
} from '../components/common/table'
import { SuggestionKnownForm } from './SuggestionKnownForm'
import { getSuggestions } from './getSuggestions'

export default async function Suggestions() {
  const suggestions = await getSuggestions()

  return (
    <div className="mt-8 space-y-8">
      <H2>Suggestions</H2>
      {suggestions.length > 0 && (
        <Table>
          <TableHeader>
            <DateOrAccountCodeTh>Date</DateOrAccountCodeTh>
            <DescriptionTh>Description</DescriptionTh>
            <TransactionsTh>Transactions</TransactionsTh>
            <DocumentTh />
            <LinkedTh />
            <EditTh />
          </TableHeader>
          <TableBody>
            {suggestions.map((suggestion) => (
              <SuggestionKnownForm
                key={`documentId-${
                  suggestion.documentId
                }-linkedToTransactionIds-${suggestion.linkedToTransactionIds.join(
                  ',',
                )}`}
                suggestion={suggestion}
              />
            ))}
          </TableBody>
        </Table>
      )}
      {suggestions.length === 0 && (
        <div>
          <span className="max-w-md text-sm text-gray-500">
            Download documents and transactions to start seeing suggestions
          </span>
        </div>
      )}
    </div>
  )
}
