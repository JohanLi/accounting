import { useEffect, useReducer } from 'react'

import { sendToBackground } from '@plasmohq/messaging'

import type {
  RequestBody,
  ResponseBody,
  Transactions,
} from './background/messages/transactions'
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

    const response = await sendToBackground<RequestBody, ResponseBody>({
      name: 'transactions',
      body: {
        transactions: state.downloads,
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
      className="rounded bg-white px-2 py-1 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 mt-4"
      onClick={() => dispatch({ type: 'reset' })}
    >
      Go back
    </button>
  )

  return (
    <div className="fixed bottom-4 right-4 w-64 h-32 font-sans rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 p-4">
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
                'inline-flex rounded bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600',
                state.state === 'downloading'
                  ? 'opacity-50 cursor-not-allowed'
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
