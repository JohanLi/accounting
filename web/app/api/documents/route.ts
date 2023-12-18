import db from '../../db'
import { eq } from 'drizzle-orm'
import { Documents } from '../../schema'
import { getPdfHash } from './getPdfHash'
import { getPDFStrings } from '../../document'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const viewStrings = searchParams.get('viewStrings')

  if (!id) {
    return new Response('id is required', { status: 400 })
  }

  const document = await db.query.Documents.findFirst({
    where: eq(Documents.id, parseInt(id)),
  })

  if (!document) {
    throw Error(`Could not find document with id: ${id}`)
  }

  if (viewStrings) {
    const strings = await getPDFStrings(document.data)

    return new Response(JSON.stringify(strings, null, 2))
  }

  return new Response(document.data, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}

export type DocumentUpload = {
  filename: string
  data: string
}

export async function PUT(request: Request) {
  const files = (await request.json()) as DocumentUpload[]

  const documents = await Promise.all(
    files.map(async (file) => {
      const data = Buffer.from(file.data, 'base64')

      return {
        filename: file.filename,
        data,
        hash: await getPdfHash(data),
      }
    }),
  )

  const insertedDocuments = await db
    .insert(Documents)
    .values(documents)
    .onConflictDoNothing()
    .returning({ id: Documents.id, filename: Documents.filename })

  return Response.json(insertedDocuments)
}
