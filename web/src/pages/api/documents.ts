import type { NextApiRequest, NextApiResponse } from 'next'
import mime from 'mime-types'
import { prisma } from '../../db'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === 'GET') {
    const id = parseInt(req.query.id as string)

    const document = await prisma.document.findFirstOrThrow({
      where: {
        id,
      },
    })

    const contentType = mime.lookup(document.extension)

    if (!contentType) {
      throw Error(`Unknown content type for extension: ${document.extension}`)
    }

    res.setHeader('Content-Type', contentType)
    res.end(document.data)
    return
  }

  res.status(405)
}
