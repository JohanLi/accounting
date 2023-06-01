import { useEffect, useReducer } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type { RequestBody, ResponseBody } from './background/messages/download'
import { classNames } from './utils'
import pLimit from 'p-limit'

/*
 For SEB, downloading too many in parallel seems to cause the server to
 error out. It's probably a good idea to do this in general, though.
 */
const limit = pLimit(5)

// taken from https://tailwindcss.com/docs/animation#spin
// https://github.com/tailwindlabs/heroicons/issues/131
function LoadingSpinner() {
  return (
    <svg
      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
  )
}

export type DownloadType = {
  url: string
  filename: string
}

type Props = {
  getDownloads: () => Promise<DownloadType[]>
  requestInit?: RequestInit
}

type State = {
  state: 'initial' | 'foundUrls' | 'downloading' | 'downloaded'
  downloads: DownloadType[]
  created: number
  error: string
}

export type Action =
  | { type: 'foundDownloads'; payload: DownloadType[] }
  | { type: 'downloadStarted' }
  | { type: 'downloadCompleted'; payload: number }
  | { type: 'reset' }
  | { type: 'error'; payload: string }

const initialState: State = {
  state: 'initial',
  downloads: [],
  created: 0,
  error: '',
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'foundDownloads': {
      return {
        ...state,
        state: 'foundUrls',
        downloads: action.payload,
      }
    }
    case 'downloadStarted': {
      return {
        ...state,
        state: 'downloading',
      }
    }
    case 'downloadCompleted': {
      return {
        ...state,
        state: 'downloaded',
        created: action.payload,
      }
    }
    case 'reset': {
      return initialState
    }
    case 'error': {
      return {
        ...state,
        error: action.payload,
      }
    }
  }
}

export default function Download({ getDownloads, requestInit }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    if (state.state !== 'initial') {
      return
    }

    getDownloads()
      .then((downloads) => {
        dispatch({ type: 'foundDownloads', payload: downloads })
      })
      .catch((e) => {
        console.error(e)
        dispatch({ type: 'error', payload: 'Failed to fetch downloads' })
      })
  }, [state.state])

  const onClick = async () => {
    dispatch({ type: 'downloadStarted' })

    const uploadFiles = await Promise.all(
      state.downloads.map(async (download) => {
        const response = await limit(() => fetch(download.url, requestInit))
        const buffer = await response.arrayBuffer()
        const data = Buffer.from(buffer).toString('base64')
        return {
          data,
          extension: 'pdf',
        }
      }),
    )

    const response = await sendToBackground<RequestBody, ResponseBody>({
      name: 'download',
      body: {
        uploadFiles,
      },
    })

    dispatch({ type: 'downloadCompleted', payload: response.created })
  }

  return (
    <div className="fixed bottom-4 right-4 w-64 h-32 font-sans rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
      {state.error && 'Failed to fetch invoices'}
      {!state.error && (
        <>
          {state.state === 'initial' && 'Attempting to fetch invoices...'}
          {(state.state === 'foundUrls' || state.state === 'downloading') && (
            <button
              type="button"
              className={classNames(
                'inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                state.state === 'downloading' ? 'cursor-not-allowed' : '',
              )}
              onClick={onClick}
              disabled={state.state === 'downloading'}
            >
              {state.state !== 'downloading' && (
                <>Download {state.downloads.length} invoices</>
              )}
              {state.state === 'downloading' && (
                <>
                  <LoadingSpinner />
                  Downloading...
                </>
              )}
            </button>
          )}
          {state.state === 'downloaded' && (
            <>
              <table>
                <thead>
                <tr>
                  <th className="pr-4 text-xs font-semibold text-gray-900">
                    Downloaded
                  </th>
                  <th className="text-xs font-semibold text-gray-900">
                    Created
                  </th>
                </tr>
                </thead>
                <tbody>
                <tr>
                  <td className="pr-4 text-center text-lg text-gray-500">
                    {state.downloads.length}
                  </td>
                  <td className="text-center text-lg text-gray-500">
                    {state.created}
                  </td>
                </tr>
                </tbody>
              </table>
              <button
                type="button"
                className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-4"
                onClick={() => dispatch({ type: 'reset' })}
              >
                Go back
              </button>
            </>
          )}
        </>
      )}
    </div>
  )
}
