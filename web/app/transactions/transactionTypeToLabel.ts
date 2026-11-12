import { TransactionType } from '../schema'

export const transactionTypeToLabel: {
  [key in TransactionType]: string
} = {
  bankRegular: 'Företagskonto',
  bankSavings: 'Sparkonto',
  bankSavings2: 'Sparkonto 2',
  tax: 'Skattekonto',
}
