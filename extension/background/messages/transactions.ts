import type { PlasmoMessaging } from '@plasmohq/messaging'

export type Transactions = Record<string, string>[]

export type RequestBody = {
  transactions: Transactions
}

export type ResponseBody =
  | {
      created: number
      error?: never
    }
  | {
      created?: never
      error: string
    }

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
> = async (req, res) => {
  const { transactions } = req.body

  const response = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transactions),
  })

  if (!response.ok) {
    res.send({
      error: `${response.status} ${response.statusText}`,
    })
    return
  }

  res.send({
    created: (await response.json()).length,
  })
}

export default handler
