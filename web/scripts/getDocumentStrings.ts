import { getDocument } from 'pdfjs-dist/legacy/build/pdf'
import { TextContent } from 'pdfjs-dist/types/web/text_layer_builder'
import { readdir, writeFile } from 'fs/promises'

async function main() {
  const dir = `${__dirname}/../src/documents`

  const filesInDirectory = (await readdir(dir)).filter((file) =>
    file.endsWith('.pdf'),
  )

  for (const file of filesInDirectory) {
    const pdf = await getDocument({
      url: `${dir}/${file}`,
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
          .map((item) => {
            // @ts-ignore
            return item.str
          })
          .flat(),
      )
      .flat()

    const metadata = await pdf.getMetadata()

    await writeFile(
      `${dir}/${file}.json`,
      JSON.stringify({ metadata, strings }, null, 2),
    )
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
