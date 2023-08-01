import { readdir, readFile } from 'fs/promises'
import iconv from 'iconv-lite'
import {
  extractVerifications,
  getAccountMap,
  getUniqueAccountIds,
  markDeletedAndRemoveNegations,
} from './sie'
import { getHash } from '../src/pages/api/upload'
import db from '../src/db'
import {
  Accounts,
  JournalEntryDocuments,
  JournalEntryTransactions,
  JournalEntries,
} from '../src/schema'

const oldIdToId = new Map()

async function importJournalEntries(year: number) {
  const sieFile = iconv.decode(
    await readFile(`${__dirname}/journalEntries/${year}.sie`),
    'CP437',
  )

  const journalEntries = markDeletedAndRemoveNegations(
    extractVerifications(sieFile),
  ).filter(({ deletedAt }) => !deletedAt)

  const accountMap = getAccountMap(sieFile)
  const uniqueAccountIds = getUniqueAccountIds(journalEntries)
  const accounts = uniqueAccountIds.map((id) => ({
    id,
    description: accountMap[id],
  }))

  await db.insert(Accounts).values(accounts).onConflictDoNothing()

  const insertedJournalEntries = await db
    .insert(JournalEntries)
    .values(journalEntries)
    .returning()

  journalEntries.forEach((v, i) => {
    oldIdToId.set(v.oldId, insertedJournalEntries[i].id)
  })

  await db.insert(JournalEntryTransactions).values(
    journalEntries
      .map(({ transactions, oldId }) =>
        transactions.map((transaction) => ({
          ...transaction,
          journalEntryId: oldIdToId.get(oldId),
        })),
      )
      .flat(),
  )
}

async function importDocuments(year: number) {
  const directory = `${__dirname}/journalEntries/documents/${year}`

  const fileNames = await readdir(directory)

  for (const fileName of fileNames) {
    const found = fileName.match(/V(\d+)_?(\d)?/)

    if (!found) {
      throw Error(`Found an unexpected file name: ${fileName}`)
    }

    // the ordering of documents for a given journal entry is not handled for now
    const [, oldId] = found

    const journalEntryId = oldIdToId.get(Number(oldId))

    if (!journalEntryId) {
      continue
    }

    const extension = fileName.split('.').pop()

    if (!extension) {
      throw Error(`No extension found: ${fileName}`)
    }

    const data = await readFile(`${directory}/${fileName}`)
    const hash = await getHash(data, extension)

    try {
      await db.insert(JournalEntryDocuments).values({
        extension,
        hash,
        data,
        journalEntryId,
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
        `${directory}/${fileName} with the hash '${hash}' belonging to journalEntryId ${journalEntryId} already exists`,
      )
    }
  }
}

async function main() {
  for (const year of [2021, 2022, 2023]) {
    await importJournalEntries(year)
    await importDocuments(year)
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
