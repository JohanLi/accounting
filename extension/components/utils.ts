export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatDate(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getOneYearAgo() {
  const currentDate = new Date()

  currentDate.setFullYear(currentDate.getFullYear() - 1)

  return formatDate(currentDate)
}

export function getTomorrow() {
  const currentDate = new Date()

  currentDate.setDate(currentDate.getDate() + 1)

  return formatDate(currentDate)
}

export function getYesterday() {
  const currentDate = new Date()

  currentDate.setDate(currentDate.getDate() - 1)

  return formatDate(currentDate)
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
