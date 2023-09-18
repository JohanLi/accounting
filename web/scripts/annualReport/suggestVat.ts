import { suggestVat } from '../../src/suggestions/suggestVat'

/*
  TODO
    The idea is to create a UI that wraps this. There'll be more to it,
    because from FY 2024 and onwards, VAT period is quarterly instead of yearly.

    For now, the console output is sent to the API endpoint.
 */

suggestVat()
  .then((suggestion) => {
    console.log(JSON.stringify(suggestion, null, 2))
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
