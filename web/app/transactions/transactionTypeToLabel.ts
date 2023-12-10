import { TransactionType } from '../schema'

export const transactionTypeToLabel: {
  [key in TransactionType]: string
} = {
  bankRegular: 'Företagskonto',
  bankSavings: 'Sparkonto',
  bankOld: 'Gamla företagskontot',
  bankPersonal: 'Privat konto',
  tax: 'Skattekonto',
}
