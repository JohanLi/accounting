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
})

export const VerificationsRelations = relations(Verifications, ({ many }) => ({
  transactions: many(Transactions),
  documents: many(Documents),
}))

export const transactionBankTaxTypes = [
  'bankRegular',
  'bankSavings',
  'tax',
] as const

/*
  https://github.com/drizzle-team/drizzle-orm/issues/646#issuecomment-1586349095
  Whether intentional or not, it appears enums must be exported
 */
export const transactionBankTaxTypeEnum = pgEnum(
  'transactionBankTaxType',
  transactionBankTaxTypes,
)

export const TransactionsBankTax = pgTable(
  'transactions_bank_tax',
  {
    id: serial('id').primaryKey(),
    type: transactionBankTaxTypeEnum('type').notNull(),
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
    verificationId: integer('verification_id').references(
      () => Verifications.id,
    ),
  },
  (transactions) => ({
    transactionsBankTaxIndex: uniqueIndex(
      'transactions_bank_tax_external_id_idx',
    ).on(transactions.type, transactions.externalId),
  }),
)
