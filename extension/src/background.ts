import { download } from './download';

export type Download = {
  url: string;
  filename: string;
}

chrome.runtime.onMessage.addListener(
  function (request, _sender, sendResponse) {
    (async () => {
      const { downloads, clear } = request as {
        downloads?: Download[];
        clear?: true;
      }

      if (downloads) {
        try {
          await download(downloads)

          sendResponse({ success: true })
        } catch(e) {
          sendResponse({ success: false })
          console.log(e)
        }
      }

      /*
        While erase() should merely remove files from the download history, an
        undocumented behavior is that files actually get deleted if erase()
        is called as part of the same user action. This is probably done
        for security reasons.
       */
      if (clear) {
        await chrome.downloads.erase({})
        sendResponse({ success: true })
      }
    })();

    return true
  }
);

export {}
