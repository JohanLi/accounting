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

// copied from https://stackoverflow.com/a/61511955
export function waitFor(selector: string) {
  return new Promise(resolve => {
    if (document.querySelector(selector)) {
      return resolve(document.querySelector(selector));
    }

    const observer = new MutationObserver(() => {
      if (document.querySelector(selector)) {
        observer.disconnect();
        resolve(document.querySelector(selector));
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
