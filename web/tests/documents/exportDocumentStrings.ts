import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { TextContent } from 'pdfjs-dist/types/web/text_layer_builder'
import fs from 'fs/promises'
import { writeFile } from '../../src/utilsNode'
import { documentDir } from './documentDir'

// this script is used to help me write parsing logic for a new PDF variant

// TODO doesn't work since the upgrade of pdfjs-dist. This can be built into the UI instead
async function exportDocumentStrings() {
  const writeDir = `${documentDir}/output`

  await fs.rm(writeDir, { recursive: true, force: true })

  const filesInDirectory = (await fs.readdir(documentDir)).filter((file) =>
    file.endsWith('.pdf'),
  )

  for (const file of filesInDirectory) {
    const pdf = await getDocument({
      url: `${documentDir}/${file}`,
      useSystemFonts: true,
    }).promise

    const { numPages } = pdf

    const pageTextContent: Promise<TextContent>[] = []

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i)
      pageTextContent.push(page.getTextContent())
    }

    const strings = (await Promise.all(pageTextContent))
      .map((text) =>
        text.items
          // @ts-ignore
          .map((item) => item.str)
          .flat(),
      )
      .flat()

    const metadata = await pdf.getMetadata()

    await writeFile(
      `${writeDir}/${file}`.replace(/\.pdf$/, '.json'),
      JSON.stringify({ metadata, strings }, null, 2),
    )
  }
}

exportDocumentStrings().catch((e) => {
  console.error(e)
  process.exit(1)
})
