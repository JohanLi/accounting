import type { PlasmoMessaging } from '@plasmohq/messaging'

export type UploadFile = {
  data: string
}

export type RequestBody = {
  uploadFiles: UploadFile[]
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
  const { uploadFiles } = req.body

  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
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
