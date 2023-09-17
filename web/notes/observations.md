# General observations

## Lag/delay

Many systems and processes in accounting and running a company have
a certain "lag"/"delay".

You work August, but the invoice is generated for the last day of the month.
Then, clients typically pay it anywhere from 30 to 90 days later.

Preliminary income tax for August is actually collected the next month.
The same applies to tax related to paying salaries.

Fiscal year ends, but you're given more than 6 months to close it.

The same goes for calculating "utdelningsutrymme".

### Matching preliminary with actual

For both corporate and personal, there's a step where the respective values
are matched. This also ties into the above point, where there's a considerable
delay.

### User-experience challenges

From a user-experience point of view, the difficulty lies in keeping track
of related events. For example, journal entries that are more than a year
apart from each other might have some form of relation. In other words,
it doesn't suffice to just look at 3 or 4 time-adjacent journal entries.

## Constant logins

Everything is behind BankID these days, with short sessions. I wish it
weren't this way: I'd prefer if most services continued using a user + password
login with long sessions (or at least provided choices). Then, only for "write"
or actual sensitive operations is BankID or 2FA required.

I can understand it from an engineering perspective – it costs the least to
implement and is "good enough".

However, it feels beyond silly having to grab my phone and do the exact same
thing a half dozen times to download a few receipts. Because of this, I tend
to log in infrequently and download multiple receipts in one go. With my
VAT reporting frequency changing to quarterly, I might need to do this more
often.
