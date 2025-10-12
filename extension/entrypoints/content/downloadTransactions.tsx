import { useEffect, useReducer } from 'react'
import { browser } from 'wxt/browser'

import type {
  RequestTransactions,
  Response,
  Transactions,
} from '../background.ts'
import LoadingSpinner from './loadingSpinner'
import { classNames } from './utils'

type Props = {
  getDownloads: () => Promise<Transactions>
}

type State = {
  state: 'initial' | 'foundUrls' | 'downloading' | 'downloaded'
  downloads: Transactions
  created: number
  error: string
}

export type Action =
  | { type: 'foundDownloads'; payload: Transactions }
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

export default function DownloadTransactions({ getDownloads }: Props) {
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

    const response = await browser.runtime.sendMessage<
      RequestTransactions,
      Response
    >({
      type: 'transactions',
      transactions: state.downloads,
    })

    if ('error' in response) {
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
      className="mt-4 cursor-pointer rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50"
      onClick={() => dispatch({ type: 'reset' })}
    >
      Go back
    </button>
  )

  return (
    <div className="fixed right-4 bottom-4 h-32 w-64 rounded-lg bg-white p-4 font-sans shadow-lg ring-1 ring-black/5">
      {state.error && (
        <>
          <div>{state.error}</div>
          {goBack}
        </>
      )}
      {!state.error && (
        <>
          {state.state === 'initial' && 'Attempting to fetch transactions...'}
          {(state.state === 'foundUrls' || state.state === 'downloading') && (
            <button
              type="button"
              className={classNames(
                'inline-flex cursor-pointer rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                state.state === 'downloading'
                  ? 'cursor-not-allowed opacity-50'
                  : '',
              )}
              onClick={onClick}
              disabled={state.state === 'downloading'}
            >
              {state.state === 'foundUrls' && (
                <>Download {state.downloads.length} transactions</>
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
