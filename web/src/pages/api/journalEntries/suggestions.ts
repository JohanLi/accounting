import type { NextApiRequest, NextApiResponse } from 'next'
import { JournalEntryUpsert } from '../journalEntries'
import { filterNull } from '../../../utils'
import { getDocumentSuggestions } from '../../../suggestions/documentSuggestions'
import { getBankSavingsSuggestions } from '../../../suggestions/bankSavingsSuggestions'
import { getTaxSuggestions } from '../../../suggestions/taxSuggestions'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<JournalEntryUpsert[]>,
) {
  if (req.method === 'GET') {
    const taxSuggestions = await getTaxSuggestions()
    const bankSavingsSuggestions = await getBankSavingsSuggestions()
    const documentSuggestions = await getDocumentSuggestions()

    res
      .status(200)
      .json(
        filterNull([
          ...taxSuggestions,
          ...bankSavingsSuggestions,
          ...documentSuggestions,
        ]),
      )
    return
  }

  res.status(405)
}
