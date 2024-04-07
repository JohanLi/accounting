import pLimit from 'p-limit'
import { useEffect, useReducer } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type {
  RequestBody,
  ResponseBody,
  UploadFile,
} from './background/messages/download'
import LoadingSpinner from './loadingSpinner'
import { classNames } from './utils'

/*
 For SEB, downloading too many in parallel seems to cause the server to
 error out. It's probably a good idea to do this in general, though.
 */
const limit = pLimit(5)

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
        dispatch({ type: 'error', payload: 'Failed to fetch download URLs' })
      })
  }, [state.state])

  const onClick = async () => {
    dispatch({ type: 'downloadStarted' })

    let uploadFiles: UploadFile[]

    try {
      uploadFiles = await Promise.all(
        state.downloads.map(async (download) => {
          const response = await limit(() => fetch(download.url, requestInit))
          const buffer = await response.arrayBuffer()
          const data = Buffer.from(buffer).toString('base64')
          return {
            filename: download.filename,
            data,
          }
        }),
      )
    } catch (e) {
      console.error(e)
      dispatch({ type: 'error', payload: 'Failed to download' })
      return
    }

    const response = await sendToBackground<RequestBody, ResponseBody>({
      name: 'download',
      body: {
        uploadFiles,
      },
    })

    if (response.error) {
      dispatch({
        type: 'error',
        payload: `Failed to upload: ${response.error}`,
      })
      return
    }

    dispatch({ type: 'downloadCompleted', payload: response.created })
  }

  const goBack = (
    <button
      type="button"
      className="mt-4 rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
      onClick={() => dispatch({ type: 'reset' })}
    >
      Go back
    </button>
  )

  return (
    <div className="fixed bottom-4 right-4 h-32 w-64 rounded-lg bg-white p-4 font-sans shadow-lg ring-1 ring-black ring-opacity-5">
      {state.error && (
        <>
          <div>{state.error}</div>
          {goBack}
        </>
      )}
      {!state.error && (
        <>
          {state.state === 'initial' && 'Attempting to fetch invoices...'}
          {(state.state === 'foundUrls' || state.state === 'downloading') && (
            <button
              type="button"
              className={classNames(
                'inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                state.state === 'downloading'
                  ? 'cursor-not-allowed opacity-50'
                  : '',
              )}
              onClick={onClick}
              disabled={state.state === 'downloading'}
            >
              {state.state === 'foundUrls' && (
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
              {goBack}
            </>
          )}
        </>
      )}
    </div>
  )
}
