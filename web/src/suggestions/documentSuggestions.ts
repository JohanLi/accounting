import db from '../db'
import { Documents, JournalEntries } from '../schema'
import { asc, eq, isNull } from 'drizzle-orm'
import {
  getPDFStrings,
  getRecognizedDocument,
  getUnknownDocument,
} from '../document'
import { getGoogleWorkspaceDocument } from '../documentGoogleWorkflow'

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
      const strings = await getPDFStrings(document.data)

      const recognizedDocument = await getRecognizedDocument(strings)

      if (recognizedDocument) {
        return {
          ...recognizedDocument,
          linkedToTransactionIds: [],
          documentId: document.id,
        }
      }

      const googleWorkspaceDocument = await getGoogleWorkspaceDocument(strings)

      if (googleWorkspaceDocument) {
        return {
          ...googleWorkspaceDocument,
          documentId: document.id,
        }
      }

      const unknownDocument = await getUnknownDocument(strings)

      return {
        ...unknownDocument,
        linkedToTransactionIds: [],
        documentId: document.id,
      }
    }),
  )
}
