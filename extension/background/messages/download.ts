import type { PlasmoMessaging } from '@plasmohq/messaging'

export type UploadFile = {
  data: string
}

export type RequestBody = {
  uploadFiles: UploadFile[]
  isPendingDocument?: true
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
  const { uploadFiles, isPendingDocument } = req.body

  const response = await fetch(!isPendingDocument ? 'http://localhost:3000/api/documents' : 'http://localhost:3000/api/documentsPending', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(uploadFiles),
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
