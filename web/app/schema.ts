import {
  char,
  customType,
  foreignKey,
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

export const JournalEntryTransactions = pgTable(
  'journal_entry_transactions',
  {
    id: serial('id').primaryKey(),
    journalEntryId: integer('journal_entry_id').notNull(),
    accountId: smallint('account_id')
      .notNull()
      .references(() => Accounts.id),
    amount: integer('amount').notNull(),
  },
  (table) => {
    /*
      Rather than .references(), this is done to shorten fk names
      that would otherwise be too long and truncated.
     */
    return {
      journalEntryReference: foreignKey({
        name: 'journal_entry_transactions_jei_jei_fk',
        columns: [table.journalEntryId],
        foreignColumns: [JournalEntries.id],
      }).onDelete('cascade'),
    }
  },
)

export const Documents = pgTable(
  'documents',
  {
    id: serial('id').primaryKey(),
    filename: text('filename'),
    hash: text('hash').notNull(),
    data: bytea('data').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (documents) => ({
    hashIndex: uniqueIndex('documents_hash_idx').on(documents.hash),
  }),
)

export const JournalEntries = pgTable('journal_entries', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  documentId: integer('document_id').references(() => Documents.id, {
    onDelete: 'set null',
  }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at'),
})

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
    journalEntryId: integer('journal_entry_id').references(
      () => JournalEntries.id,
      {
        onDelete: 'set null',
      },
    ),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (transactions) => ({
    externalIdIndex: uniqueIndex('transactions_external_id_idx').on(
      transactions.type,
      transactions.externalId,
    ),
  }),
)
