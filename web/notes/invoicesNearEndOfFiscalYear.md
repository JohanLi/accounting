### Invoices created near the end of the fiscal year

Since my revenue is below 3 million, I use _kontantmetoden_. However, invoices
created one fiscal year, but paid in the next one, need to use
_fakturametoden_ (unless its amount is below 5000).

#### Kontantmetoden

When paid:

| Account | Amount |
|---------|--------|
| 1930    | 20000  |
| 2610    | -4000  |
| 3011    | -16000 |

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

#### TODO

Evaluate if it's worth implementing this special case, or it becomes a
manual step as part of a checklist.

Another alternative is booking all my invoices using _fakturametoden_, avoiding
this case altogether. I think this option has implications on quarterly VAT,
but it needs more investigation.
