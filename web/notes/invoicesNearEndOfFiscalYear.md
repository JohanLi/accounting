### Kontantmetoden vs. Fakturametoden

Companies not exceeding 3 million in revenue can opt to use _kontantmetoden_ rather than _fakturametoden_.

Normally, each invoice you create results in two journal entries: one for the invoice itself and one for the payment.
Kontantmetoden is convenient as it allows you to skip the invoice entry.

#### Fakturametoden

When invoice is created:

| Account | Amount |
|---------|--------|
| 1510    | 20000  |
| 2610    | -4000  |
| 3011    | -16000 |

When invoice is paid:

| Account | Amount |
|---------|--------|
| 1930    | 20000  |
| 1510    | -20000 |

#### Kontantmetoden

When paid:

| Account | Amount |
|---------|--------|
| 1930    | 20000  |
| 2610    | -4000  |
| 3011    | -16000 |

## Special case: invoices created near the end of the fiscal year

Invoices created near the end of the fiscal year, but paid in the next one, need to be handled using fakturametoden.
The rationale is that it gives a more accurate picture of your company's financial situation. The only exception
is if the invoice amount is below 5000 SEK.

#### Going for fakturametoden

To avoid handling this special case, I've decided to use _fakturametoden_ for all _my_ invoices. While it does
result in marginally more journal entries, the creation of them is easily automated anyway.

It's also simpler to wrap my head around — using _kontantmetoden_ means I need to link two
events that occur 45 days apart (payment terms) together.

The only implication is that VAT no longer gets deferred by two months. On the flip side,
the quarterly VAT reports are more even:

#### Fakturametoden

| Quarter | Invoices |
|---------|----------|
| 1       | 4        |
| 2       | 4        |
| 3       | 4        |
| 4       | 4        |

#### Kontantmetoden

| Quarter | Invoices |
|---------|----------|
| 1       | 2        |
| 2       | 4        |
| 3       | 4        |
| 4       | 6        |
