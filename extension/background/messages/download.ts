import type { PlasmoMessaging } from '@plasmohq/messaging'

type UploadFile = {
  extension: string
  data: string
}

export type RequestBody = {
  uploadFiles: UploadFile[]
}

export type ResponseBody = {
  message: string
}

const handler: PlasmoMessaging.MessageHandler<
  RequestBody,
  ResponseBody
  > = async (req, res) => {
  const { uploadFiles } = req.body

  await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(uploadFiles),
  })

  res.send({
    message: 'success',
  })
}

export default handler
