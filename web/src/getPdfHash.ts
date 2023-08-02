import { getPDFStrings } from './receipt'
import { getHash } from './utils'

/*
  Developers Bay generates a slightly different PDF each time you download
  an invoice — specifically CreationDate and ModDate in the PDF metadata.

  Because of this, the hash is instead based on the PDF strings.

  Additionally, this function needs to be "insulated" from Vitest. It uses
  pdfjs-dist, which crashes Vitest. See https://github.com/vitest-dev/vitest/issues/740
 */
export async function getPdfHash(data: Buffer) {
  const pdfStrings = await getPDFStrings(data)
  return getHash(JSON.stringify(pdfStrings))
}
