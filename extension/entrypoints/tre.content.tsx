import ReactDOM from 'react-dom/client'
import { waitFor } from '@/entrypoints/content/utils.ts'
import Download from './content/download.tsx'
import "@/assets/tailwind.css";

export default defineContentScript({
  matches: ['https://www.tre.se/mitt3/fakturor'],
  cssInjectionMode: 'ui',

  async main(ctx) {
    const ui = await createShadowRootUi(ctx, {
      name: 'download-ui',
      position: 'inline',
      anchor: 'body',
      onMount: (container) => {
        const app = document.createElement('div');
        container.append(app);

        const root = ReactDOM.createRoot(app);
        root.render(
          <Download
            getDownloads={getDownloads}
            requestInit={{ credentials: 'include' }}
          />
        );
        return root;
      },
      onRemove: (root) => {
        root?.unmount();
      },
    });

    ui.mount();
  },
});

// unfortunately, you can't ever be sure they don't treat this as a password somewhere
const accountNumber = import.meta.env.VITE_TRE_ACCOUNT_NUMBER

if (!accountNumber) {
  throw new Error('Missing VITE_TRE_ACCOUNT_NUMBER')
}

const COUNT = 4

const selector = 'a[href^="/mitt3/fakturor/"]'

async function getDownloads() {
  await waitFor(selector)

  return Array.from(document.querySelectorAll(selector))
    .slice(0, COUNT)
    .map((element) => {
      const match = element
        .getAttribute('href')
        .match(/\/mitt3\/fakturor\/(\d+)/)

      if (match) {
        const invoiceNumber = match[1]

        return {
          url: `https://www.tre.se/t/api/invoices/my3/api/v1/accounts/${accountNumber}/invoices/${invoiceNumber}/document?errorCallback=/mitt3/fakturor`,
          filename: `bookkeeping/tre/tre-${invoiceNumber}.pdf`,
        }
      }

      console.log(element)
      throw new Error('One of the invoice links does not seem to have an ID')
    })
}