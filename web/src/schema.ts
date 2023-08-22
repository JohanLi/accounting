import {
  char,
  customType,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

/*
  TODO
    Foreign key names are currently generated by Drizzle and often end up too long.
    The ability to specify your own names is being worked on: https://github.com/drizzle-team/drizzle-orm/issues/466
 */

// https://github.com/drizzle-team/drizzle-orm/issues/298
const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const Accounts = pgTable('accounts', {
  id: smallint('id').primaryKey(),
  description: text('description').notNull(),
})

/*
  TODO
    It's not clear yet whether it would be better to "derive" transactions than to
    store them explicitly like this. Needs to be revisited.
 */
export const JournalEntryTransactions = pgTable('journal_entry_transactions', {
  id: serial('id').primaryKey(),
  journalEntryId: integer('journal_entry_id')
    .notNull()
    .references(() => JournalEntries.id),
  accountId: smallint('account_id')
    .notNull()
    .references(() => Accounts.id),
  amount: integer('amount').notNull(),
})

/*
  https://orm.drizzle.team/docs/rqb
  references() affects the database itself, while relations() is an application level abstraction
 */
export const JournalEntryTransactionsRelations = relations(
  JournalEntryTransactions,
  ({ one }) => ({
    journalEntry: one(JournalEntries, {
      fields: [JournalEntryTransactions.journalEntryId],
      references: [JournalEntries.id],
    }),
  }),
)

/*
  Documents that cannot immediately be used to create a journal entry are
  treated as "pending". Filename is of interest for pending documents, until
  they are processed.

  Reasons for being pending:
  - A non-SEK currency is used. The actual exchange rate will not be known until the corresponding bank transaction is imported and matched
  - A non-recurring document, where it's not worth the effort to write logic that identifies it
    Instead, generic logic will be used together with imported bank transactions to determine totals and vat
 */
export const Documents = pgTable(
  'documents',
  {
    id: serial('id').primaryKey(),
    journalEntryId: integer('journal_entry_id').references(
      () => JournalEntries.id,
    ),
    filename: text('filename'),
    hash: text('hash').notNull(),
    data: bytea('data').notNull(),
  },
  (documents) => ({
    hashIndex: uniqueIndex('documents_hash_idx').on(documents.hash),
  }),
)

export const JournalEntryDocumentsRelations = relations(
  Documents,
  ({ one }) => ({
    journalEntry: one(JournalEntries, {
      fields: [Documents.journalEntryId],
      references: [JournalEntries.id],
    }),
  }),
)

export const JournalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
})

export const JournalEntriesRelations = relations(
  JournalEntries,
  ({ many }) => ({
    transactions: many(JournalEntryTransactions),
    documents: many(Documents),
  }),
)

export const transactionTypes = ['bankRegular', 'bankSavings', 'tax'] as const
export type TransactionType = (typeof transactionTypes)[number]

/*
  https://github.com/drizzle-team/drizzle-orm/issues/646#issuecomment-1586349095
  Whether intentional or not, it appears enums must be exported
 */
export const transactionTypeEnum = pgEnum('transactionType', transactionTypes)

export const Transactions = pgTable(
  'transactions',
  {
    id: serial('id').primaryKey(),
    type: transactionTypeEnum('type').notNull(),
    date: timestamp('date').notNull(),
    description: text('description').notNull(),
    amount: integer('amount').notNull(),
    balance: integer('balance').notNull(),
    raw: jsonb('raw').notNull(),
    /*
      Tax account transactions, at least through the web UI, do not appear
      to contain an ID. This might change once/if I get access to Skatteverket's
      official API.

      SEB transactions do contain IDs, but some of them exceed 600 characters.

      While one approach is using partial indexes, I think a more pragmatic
      solution is generating an ID in the application layer.
     */
    externalId: char('external_id', { length: 64 }).notNull(),
    linkedToJournalEntryId: integer('linked_to_journal_entry_id').references(
      () => JournalEntries.id,
    ),
  },
  (transactions) => ({
    externalIdIndex: uniqueIndex('transactions_external_id_idx').on(
      transactions.type,
      transactions.externalId,
    ),
  }),
)
