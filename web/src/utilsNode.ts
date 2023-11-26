import fs from 'fs/promises'
import path from 'path'

// https://stackoverflow.com/questions/64958413/how-can-i-omit-a-first-parameter-from-the-function-parameters-type
type Tail<T extends any[]> = T extends [infer _, ...infer Rest] ? Rest : never

export async function writeFile(
  filePath: string,
  ...args: Tail<Parameters<typeof fs.writeFile>>
) {
  const directory = path.dirname(filePath)

  await fs.mkdir(directory, { recursive: true })
  return fs.writeFile(filePath, ...args)
}
