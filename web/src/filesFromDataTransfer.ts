import { DocumentUpload } from './pages/api/documents'

export async function getFileEntries(items: DataTransferItemList) {
  let entries: FileSystemFileEntry[] = []
  let queue: FileSystemEntry[] = []

  for (let i = 0; i < items.length; i++) {
    const entry = items[i].webkitGetAsEntry()

    if (entry) {
      queue.push(entry)
    }
  }

  while (queue.length > 0) {
    let entry = queue.shift()!

    if (isFile(entry)) {
      entries.push(entry)
    } else if (isDirectory(entry)) {
      queue.push(...(await readDirectoryEntries(entry.createReader())))
    }
  }

  return entries
}

async function readDirectoryEntries(
  directoryReader: FileSystemDirectoryReader,
) {
  let entries: FileSystemEntry[] = []
  let readEntries = await readEntriesPromise(directoryReader)

  while (readEntries.length > 0) {
    entries.push(...readEntries)
    readEntries = await readEntriesPromise(directoryReader)
  }

  return entries
}

async function readEntriesPromise(directoryReader: FileSystemDirectoryReader) {
  return await new Promise<FileSystemEntry[]>((resolve, reject) => {
    directoryReader.readEntries(resolve, reject)
  })
}

function isFile(item: FileSystemEntry): item is FileSystemFileEntry {
  return item.isFile
}

function isDirectory(item: FileSystemEntry): item is FileSystemDirectoryEntry {
  return item.isDirectory
}

export async function getFilenameAndData(file: File) {
  return new Promise<DocumentUpload>((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)

    reader.onload = () => {
      // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/readAsDataURL
      let data = reader.result as string
      data = data.substring(data.indexOf(',') + 1)

      resolve({ filename: file.name, data })
    }

    reader.onerror = (error) => reject(error)
  })
}
