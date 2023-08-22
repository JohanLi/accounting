/*
  TODO
    Remove this script once this accounting solution is stable and FY 2023
    is closed.
 */

import { readdir, readFile } from 'fs/promises'
import iconv from 'iconv-lite'
import {
  extractVerifications,
  getAccountMap,
  getUniqueAccountIds,
  markDeletedAndRemoveNegations,
} from './sie'
import db from '../src/db'
import {
  Accounts,
  Documents,
  JournalEntryTransactions,
  JournalEntries,
  Transactions,
} from '../src/schema'
import { oldBankTransactions } from './oldBankTransactions'

import { getPdfHash } from '../src/getPdfHash'
import Decimal from 'decimal.js'
import { asc, eq } from 'drizzle-orm'

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

    if (extension !== 'pdf') {
      console.log(
        `${fileName} belonging to journalEntryId ${journalEntryId} is not a pdf – skipping`,
      )
      continue
    }

    const data = await readFile(`${directory}/${fileName}`)
    const hash = await getPdfHash(data)

    try {
      await db.insert(Documents).values({
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

async function importOldBankTransactions() {
  let balance = 0

  for (const transaction of oldBankTransactions) {
    const journalEntryId = oldIdToId.get(Number(transaction.oldId))

    if (!journalEntryId) {
      throw new Error(
        `Could not find journal entry for old bank transaction ${JSON.stringify(
          transaction,
          null,
          2,
        )}`,
      )
    }

    const amount = new Decimal(
      transaction.amount
        .replace(/[^0-9.,−]/g, '')
        .replace(',', '.')
        .replace('−', '-'),
    )
      .mul(100)
      .toNumber()

    balance += amount

    await db.insert(Transactions).values({
      type: 'bankOld',
      date: new Date(transaction.date),
      description: transaction.description,
      amount,
      balance,
      raw: {},
      externalId: transaction.artificialId.toString(),
      linkedToJournalEntryId: journalEntryId,
    })
  }
}

async function importPersonalBankTransactions() {
  const transactions = await db
    .select({
      journalEntryId: JournalEntries.id,
      date: JournalEntries.date,
      amount: JournalEntryTransactions.amount,
      description: JournalEntries.description,
    })
    .from(JournalEntryTransactions)
    .innerJoin(
      JournalEntries,
      eq(JournalEntries.id, JournalEntryTransactions.journalEntryId),
    )
    .where(eq(JournalEntryTransactions.accountId, 2890))
    .orderBy(asc(JournalEntries.date))

  let balance = 0
  let artificialId = 0

  for (const transaction of transactions) {
    artificialId += 1
    balance += transaction.amount

    await db.insert(Transactions).values({
      type: 'bankPersonal',
      date: new Date(transaction.date),
      description: transaction.description,
      amount: transaction.amount,
      balance,
      raw: {},
      externalId: artificialId.toString(),
      linkedToJournalEntryId: transaction.journalEntryId,
    })
  }
}

async function main() {
  for (const year of [2021, 2022, 2023]) {
    await importJournalEntries(year)
    await importDocuments(year)
  }

  await importOldBankTransactions()
  await importPersonalBankTransactions()

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
