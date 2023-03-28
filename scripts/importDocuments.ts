/*
  Throwaway code to import documents
  Assumes that all verifications have been imported first
 */

import crypto from 'crypto'
import { readdir, readFile, copyFile, mkdir } from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import { getFiscalYear } from '../src/utils'

const prisma = new PrismaClient()

async function md5(filePath: string) {
  const file = await readFile(filePath)
  return crypto.createHash('md5').update(file).digest('hex')
}

async function importDocuments(year: number) {
  const destination = `${__dirname}/../public/documents`

  await mkdir(destination, { recursive: true })

  const directory = `${__dirname}/documents/${year}`

  const files = await readdir(directory)

  for (const file of files) {
    const found = file.match(/V(\d+)_?(\d)?/)

    if (!found) {
      throw Error(`Found an unexpected file name: ${file}`)
    }

    // the ordering of documents for a given verification is not handled for now
    const [, id, i] = found

    const { start, end } = getFiscalYear(year)

    const { id: verificationId } = await prisma.verification.findFirstOrThrow({
      where: {
        oldId: Number(id),
        date: {
          gte: start,
          lte: end,
        },
      },
    })

    const extension = file.split('.').pop()

    if (!extension) {
      throw Error(`No extension found: ${file}`)
    }

    const hash = await md5(`${directory}/${file}`)

    const { id: documentId } = await prisma.document.create({
      data: {
        extension,
        hash,
        verificationId,
      },
    })

    const newFilename = `${documentId}.${extension}`
    await copyFile(`${directory}/${file}`, `${destination}/${newFilename}`)
  }
}

async function main() {
  try {
    await importDocuments(2020)
    await importDocuments(2021)
    await importDocuments(2022)
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main().then(() => console.log('done'))
