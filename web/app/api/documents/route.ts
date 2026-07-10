import { eq } from 'drizzle-orm'

import db from '../../db'
import { getPDFLines } from '../../document'
import { Documents } from '../../schema'
import { getPdfHash } from './getPdfHash'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  const viewLines = searchParams.get('viewLines')

  if (!id) {
    return new Response('id is required', { status: 400 })
  }

  const document = await db.query.Documents.findFirst({
    where: eq(Documents.id, parseInt(id)),
  })

  if (!document) {
    throw Error(`Could not find document with id: ${id}`)
  }

  if (viewLines) {
    const strings = await getPDFLines(document.data)

    return new Response(JSON.stringify(strings, null, 2))
  }

  return new Response(document.data, {
    headers: {
      'Content-Type': 'application/pdf',
    },
  })
}

export async function PUT(request: Request) {
  const formData = await request.formData()
  const entries = formData.getAll('documents')
  const files = entries.filter((entry): entry is File => entry instanceof File)

  if (!files.length || files.length !== entries.length) {
    return new Response('documents must contain at least one file', {
      status: 400,
    })
  }

  const documents = await Promise.all(
    files.map(async (file) => {
      const data = Buffer.from(await file.arrayBuffer())

      return {
        data,
        hash: await getPdfHash(data),
      }
    }),
  )

  const insertedDocuments = await db
    .insert(Documents)
    .values(documents)
    .onConflictDoNothing()
    .returning({ id: Documents.id })

  return Response.json(insertedDocuments)
}
