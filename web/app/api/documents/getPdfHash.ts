import { getPDFStrings } from '../../document'
import { getHash } from '../../utils'

/*
  Developers Bay generates a slightly different PDF each time you download
  an invoice — CreationDate and ModDate in the metadata is different.

  Because of this, the hash is instead based on the PDF strings.

  Additionally, this function needs to be "insulated" from Vitest. It uses
  pdfjs-dist, which crashes Vitest. See https://github.com/vitest-dev/vitest/issues/740
 */
export async function getPdfHash(data: Buffer, filename: string) {
  const pdfStrings = await getPDFStrings(data)

  /*
    It's rare, but I do have a few PDFs that just wrap a JPEG. They won't
    produce any strings, so a fallback is to use their filenames instead.

    Such JPEGs are always manually imported, so this is OK. These hashes
    don't have to be foolproof, as long as I can download recurring PDFs
    through my extension without creating duplicates.
   */
  if (pdfStrings.length === 0) {
    return filename
  }

  return getHash(JSON.stringify(pdfStrings))
}
