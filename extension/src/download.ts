/*
  To my understanding, chrome.downloads.download() merely initiates downloads.
  Determining whether they failed is done via listening to onChanged events.
 */

export function download(files: { url: string, filename: string }[]) {
  return new Promise<void>((resolve, reject) => {
    /*
      This keeps the browser UI cleaner.
      Explicitly requires the "downloads.shelf" permission
     */
    chrome.downloads.setShelfEnabled(false);

    let successfulCount = 0

    chrome.downloads.onChanged.addListener((e) => {
      if (e.error) {
        reject(e)
      }

      if (e.state?.current === 'complete') {
        successfulCount += 1
      }

      if (successfulCount === files.length) {
        resolve()
      }
    })

    Promise.all(files.map(({ url, filename }) => chrome.downloads.download({
      url,
      filename,
      conflictAction: 'overwrite',
    }))).catch((e) => {
      console.log(e)
      reject(e)
    })
  })
}
