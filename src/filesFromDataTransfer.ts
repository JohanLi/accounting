// based on https://stackoverflow.com/a/53058574
export async function getAllFileEntries(
  dataTransferItemList: DataTransferItemList,
) {
  let fileEntries: FileSystemFileEntry[] = []
  let queue: FileSystemEntry[] = []
  for (let i = 0; i < dataTransferItemList.length; i++) {
    const entry = dataTransferItemList[i].webkitGetAsEntry()

    if (entry) {
      queue.push(entry)
    }
  }
  while (queue.length > 0) {
    let entry = queue.shift() as FileSystemEntry

    if (isFile(entry)) {
      fileEntries.push(entry)
    } else if (isDirectory(entry)) {
      queue.push(...(await readAllDirectoryEntries(entry.createReader())))
    }
  }
  return fileEntries
}

async function readAllDirectoryEntries(
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
