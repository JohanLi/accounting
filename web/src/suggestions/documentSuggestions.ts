import db from '../db'
import { Documents, JournalEntries } from '../schema'
import { asc, eq, isNull } from 'drizzle-orm'
import { documentToTransactions, parseDetails } from '../document'

export async function getDocumentSuggestions() {
  const pendingDocuments = await db
    .select({
      id: Documents.id,
      filename: Documents.filename,
      hash: Documents.hash,
      data: Documents.data,
      createdAt: Documents.createdAt,
    })
    .from(Documents)
    .leftJoin(JournalEntries, eq(Documents.id, JournalEntries.documentId))
    .where(isNull(JournalEntries.id))
    .orderBy(asc(Documents.id))

  return Promise.all(
    pendingDocuments.map(async (document) => {
      const details = await parseDetails(document.data)

      if (!details) {
        return null
      }

      return {
        date: details.date,
        // TODO implement a way to tag journal entries
        description: `Dokument – ${details.description}`,
        transactions: documentToTransactions(details),
        linkedToTransactionIds: [],
        documentId: document.id,
      }
    }),
  )
}
