import { getPDFLines } from '../../document'
import { getHash } from '../../utils'

/*
  Some providers regenerate the same invoice with different PDF metadata.
  Hashing its rendered text lines identifies the document by content instead.
 */
export async function getPdfHash(data: Buffer) {
  const lines = await getPDFLines(data)

  /*
    While rare, I do have a few PDFs that wrap JPEGs. They don't have any text,
    so the fallback is hashing their bytes.
   */
  if (!lines.length) {
    return getHash(data)
  }

  return getHash(JSON.stringify(lines))
}
