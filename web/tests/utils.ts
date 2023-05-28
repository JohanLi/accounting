import { Page, Locator } from '@playwright/test'
import { readFile } from 'fs/promises'

export async function getBase64(filePath: string) {
  return (await readFile(filePath)).toString('base64')
}

// https://github.com/microsoft/playwright/issues/13364#issuecomment-1156288428
export async function dragAndDropFile(
  page: Page,
  locator: Locator,
  filePath: string,
  fileName: string,
) {
  const buffer = await getBase64(filePath)

  const dataTransfer = await page.evaluateHandle(
    async ({ bufferData, localFileName }) => {
      const dt = new DataTransfer()

      const blobData = await fetch(bufferData).then((res) => res.blob())

      const file = new File([blobData], localFileName)
      dt.items.add(file)
      return dt
    },
    {
      bufferData: `data:application/octet-stream;base64,${buffer}`,
      localFileName: fileName,
    },
  )

  await locator.dispatchEvent('drop', { dataTransfer })
}
