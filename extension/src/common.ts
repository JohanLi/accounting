export function waitUntil(fn: () => boolean, maxWaitSeconds = 5) {
  return new Promise<void>((resolve, reject) => {
    const startTime = performance.now()

    const interval = setInterval(() => {
      if (performance.now() - startTime > maxWaitSeconds * 1000) {
        reject(new Error('waitUntil timed out'))
      }

      if (fn()) {
        clearInterval(interval);
        resolve();
      }
    }, 200);
  });
}

export function insertClearDownloadsButton(parent: HTMLElement) {
  const button = document.createElement('button')
  button.type = 'button'
  button.textContent = `Clear history`

  button.addEventListener('click', async () => {
    await chrome.runtime.sendMessage({ clear: true })
    button.remove()
  })

  parent.appendChild(button)
}
