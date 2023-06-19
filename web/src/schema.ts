import {
  customType,
  integer,
  pgTable,
  serial,
  smallint,
  text,
  timestamp,
  uniqueIndex,
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
  (documents) => {
    return {
      hashIndex: uniqueIndex('hash_idx').on(documents.hash),
    }
  },
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

export const BankTransactions = pgTable(
  'bank_transactions',
  {
    id: serial('id').primaryKey(),
    externalId: text('external_id').notNull(),
    date: timestamp('date').notNull(),
    amount: integer('amount').notNull(),
    balance: integer('balance').notNull(),
    description: text('description').notNull(),
  },
  (transactions) => {
    /*
     Two transactions can actually have the same "externalId" + "date".
     An example: two transfers on the same day to the tax account.
     Hence, balance is part of the index as well.
     */
    return {
      bankTransactionsIndex: uniqueIndex('bank_transactions_idx').on(
        transactions.externalId,
        transactions.date,
        transactions.balance,
      ),
    }
  },
)
