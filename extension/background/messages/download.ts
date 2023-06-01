import type { PlasmoMessaging } from '@plasmohq/messaging'

type UploadFile = {
  extension: string
  data: string
}

export type RequestBody = {
  uploadFiles: UploadFile[]
}

export type ResponseBody = {
  created: number
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

  res.send({
    created: (await response.json()).length
  })
}

export default handler
