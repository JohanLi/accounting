import {
  customType,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// https://github.com/drizzle-team/drizzle-orm/issues/298
const bytea = customType<{ data: Buffer }>({
  dataType() {
    return 'bytea'
  },
})

export const Transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  accountCode: smallint('account_code')
    .notNull()
    .references(() => Accounts.code),
  amount: integer('amount').notNull(),
  verificationId: integer('verification_id')
    .notNull()
    .references(() => Verifications.id),
})

/*
  https://orm.drizzle.team/docs/rqb
  references() affects the database itself, while relations() is a higher level abstraction that works on the application level.
 */
export const TransactionsRelations = relations(Transactions, ({ one }) => ({
  verification: one(Verifications, {
    fields: [Transactions.verificationId],
    references: [Verifications.id],
  }),
}))

export const Accounts = pgTable('accounts', {
  code: smallint('code').primaryKey(),
  description: text('description').notNull(),
})

export const Documents = pgTable(
  'documents',
  {
    id: serial('id').primaryKey(),
    extension: text('extension').notNull(),
    hash: text('hash').notNull(),
    data: bytea('data').notNull(),
    verificationId: integer('verification_id')
      .notNull()
      .references(() => Verifications.id),
  },
  (documents) => ({
    hashIndex: uniqueIndex('hash_idx').on(documents.hash),
  }),
)

export const DocumentsRelations = relations(Documents, ({ one }) => ({
  verification: one(Verifications, {
    fields: [Documents.verificationId],
    references: [Verifications.id],
  }),
}))

export const Verifications = pgTable('verifications', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull(),
  description: text('description').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
  oldId: integer('old_id'),
})

export const VerificationsRelations = relations(Verifications, ({ many }) => ({
  transactions: many(Transactions),
  documents: many(Documents),
}))

export const TransactionsBank = pgTable(
  'transactions_bank',
  {
    id: serial('id').primaryKey(),
    bookedDate: timestamp('booked_date').notNull(),
    valueDate: timestamp('value_date').notNull(),
    description: text('description').notNull(),
    amount: integer('amount').notNull(),
    balance: integer('balance').notNull(),
    externalId: varchar('external_id', { length: 1000 }).notNull(),
    accountId: text('account_id').notNull(),
  },
  (transactions) => ({
    transactionsBankIndex: uniqueIndex('external_id_idx').on(
      transactions.externalId,
    ),
  }),
)

export const TransactionsTax = pgTable(
  'transactions_tax',
  {
    id: serial('id').primaryKey(),
    date: timestamp('date').notNull(),
    description: text('description').notNull(),
    amount: integer('amount').notNull(),
    balance: integer('balance').notNull(),
  },
  (transactions) => ({
    // TODO we should keep track of when the last import was done instead of relying ON CONFLICT
    bankTransactionsIndex: uniqueIndex('transactions_tax_idx').on(
      transactions.date,
      transactions.amount,
      transactions.balance,
    ),
  }),
)
