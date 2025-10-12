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
  const blob = await response.blob()
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
  return dataUrl.split(",", 2)[1]
}
