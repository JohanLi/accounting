export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export const COMPANY_START_DATE = '2020-10-01'

// by ChatGPT
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
