export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const COMPANY_START_DATE = '2020-10-01'

export function getTomorrow() {
  const currentDate = new Date()

  currentDate.setDate(currentDate.getDate() + 1)

  const year = currentDate.getFullYear()
  const month = String(currentDate.getMonth() + 1).padStart(2, '0')
  const day = String(currentDate.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function waitFor(selector: string, count: number = 1) {
  return new Promise<void>((resolve) => {
    if (document.querySelectorAll(selector).length >= count) {
      return resolve()
    }

    const observer = new MutationObserver(() => {
      if (document.querySelectorAll(selector).length >= count) {
        observer.disconnect()
        resolve()
      }
    })

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}
export async function responseToBase64(response: Response): Promise<string> {
  const bytes = new Uint8Array(await response.arrayBuffer())
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
}

export function getContentDispositionFilename(response: Response) {
  const contentDisposition = response.headers.get('content-disposition')

  if (!contentDisposition) {
    return null
  }

  const utf8Match = contentDisposition.match(/filename\*=UTF-8''([^;]+)/i)

  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1].replace(/^"|"$/g, ''))
  }

  const match = contentDisposition.match(/filename="?([^";]+)"?/i)

  return match?.[1] ?? null
}
