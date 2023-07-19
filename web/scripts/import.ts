import { readdir, readFile, mkdir } from 'fs/promises'
import iconv from 'iconv-lite'
import {
  extractVerifications,
  getAccountMap,
  getUniqueAccountCodes,
  markDeletedAndRemoveNegations,
} from './sie'
import { getHash } from '../src/pages/api/upload'
import db from '../src/db'
import { Accounts, Documents, Transactions, Verifications } from '../src/schema'
import { sql } from 'drizzle-orm'

const oldIdToId = new Map()

async function importVerifications(year: number) {
  const sieFile = iconv.decode(
    await readFile(`${__dirname}/verifications/${year}.sie`),
    'CP437',
  )

  const verifications = markDeletedAndRemoveNegations(
    extractVerifications(sieFile),
  ).filter(({ deletedAt }) => !deletedAt)

  /*
    Creating accounts ahead of time is no longer necessary, because the
    database setup script does it. Although it won't occur with this
    particular import, it might be worth properly logging any
    missing accounts
   */
  const accountMap = getAccountMap(sieFile)
  const uniqueAccountCodes = getUniqueAccountCodes(verifications)
  const accounts = uniqueAccountCodes.map((code) => ({
    code,
    description: accountMap[code],
  }))

  await db
    .insert(Accounts)
    .values(accounts)
    .onConflictDoUpdate({
      target: Accounts.code,
      // https://stackoverflow.com/a/36930792
      set: { description: sql`excluded.description` },
    })

  const insertedVerifications = await db
    .insert(Verifications)
    .values(verifications)
    .returning()

  verifications.forEach((v, i) => {
    oldIdToId.set(v.oldId, insertedVerifications[i].id)
  })

  await db.insert(Transactions).values(
    verifications
      .map(({ transactions, oldId }) =>
        transactions.map((transaction) => ({
          ...transaction,
          verificationId: oldIdToId.get(oldId),
        })),
      )
      .flat(),
  )
}

async function importDocuments(year: number) {
  const destination = `${__dirname}/../public/documents`

  await mkdir(destination, { recursive: true })

  const directory = `${__dirname}/documents/${year}`

  const fileNames = await readdir(directory)

  for (const fileName of fileNames) {
    const found = fileName.match(/V(\d+)_?(\d)?/)

    if (!found) {
      throw Error(`Found an unexpected file name: ${fileName}`)
    }

    // the ordering of documents for a given verification is not handled for now
    const [, oldId, i] = found

    const verificationId = oldIdToId.get(Number(oldId))

    if (!verificationId) {
      continue
    }

    const extension = fileName.split('.').pop()

    if (!extension) {
      throw Error(`No extension found: ${fileName}`)
    }

    const data = await readFile(`${directory}/${fileName}`)
    const hash = await getHash(data, extension)

    try {
      await db.insert(Documents).values({
        extension,
        hash,
        data,
        verificationId,
      })
    } catch (e: any) {
      if (e.code !== '23505') {
        throw new Error(e)
      }

      /*
        There are two entries that result in this: the May 2022 and June 2022 invoices.
        Because of a special rule (end of fiscal year), each invoice needs
        two accounting entries (going from kontantmetoden to fakturametoden).

        I don't think the second entry strictly needs the same document attached to it.
       */
      console.log(
        `${directory}/${fileName} with the hash '${hash}' belonging to verificationId ${verificationId} already exists`,
      )
    }
  }
}

async function main() {
  for (const year of [2021, 2022, 2023]) {
    await importVerifications(year)
    await importDocuments(year)
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
