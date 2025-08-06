import { asc, eq, isNull } from 'drizzle-orm'

import db from '../db'
import { getPDFStrings, getRecognizedDocument } from '../document'
import { Documents, JournalEntries } from '../schema'

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

  const knownDocumentSuggestions = []

  for (const document of pendingDocuments) {
    const strings = await getPDFStrings(document.data)

    const recognizedDocument = await getRecognizedDocument(strings)

    if (recognizedDocument) {
      knownDocumentSuggestions.push({
        ...recognizedDocument,
        linkedToTransactionIds: [],
        documentId: document.id,
      })
    }
  }

  return knownDocumentSuggestions
}
