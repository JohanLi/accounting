// Throwaway code to import verifications and their documents

import crypto from 'crypto'
import { readdir, readFile, copyFile, mkdir } from 'fs/promises'
import { PrismaClient } from '@prisma/client'
import { getFiscalYear } from '../src/utils'
import iconv from 'iconv-lite'
import {
  extractVerifications,
  getAccountMap,
  getUniqueAccountCodes,
  markDeletedAndRemoveNegations,
} from './sie'

const prisma = new PrismaClient()

async function importVerifications(year: number) {
  const sieFile = iconv.decode(
    await readFile(`${__dirname}/verifications/${year}.sie`),
    'CP437',
  )

  const verifications = markDeletedAndRemoveNegations(
    extractVerifications(sieFile),
  )

  const accountMap = getAccountMap(sieFile)
  const uniqueAccountCodes = getUniqueAccountCodes(verifications)
  const accounts = uniqueAccountCodes.map((code) => ({
    code,
    description: accountMap[code],
  }))

  // https://stackoverflow.com/a/71409459
  await prisma.$transaction(
    accounts.map((account) =>
      prisma.account.upsert({
        where: { code: account.code },
        update: {
          description: account.description,
        },
        create: account,
      }),
    ),
  )

  for (const verification of verifications) {
    await prisma.verification.create({
      data: {
        ...verification,
        transactions: {
          create: verification.transactions,
        },
        /*
          Verification IDs in SIE seem to start from 1 for each fiscal year,
          and likely don't have any intrinsic meaning
         */
        id: undefined,
      },
    })
  }
}

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
    for (const year of [2021, 2022, 2023]) {
      await importVerifications(year)
      await importDocuments(year)
    }
  } catch (e) {
    console.error(e)
    process.exit(1)
  }
}

main().then(() => console.log('done'))
