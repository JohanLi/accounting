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

### Rounding, cents/ören being huge time-wasters

Sigh. It's like the 80/20 rule. Except here, we're talking about dedicating
a lot of time to handle a couple of kronor here and there due to rounding
conventions:

- "Det skattemässiga resultatet avrundas sedan nedåt till närmaste tiotal"
- After the above is done and corporate tax is calculated, the result is floored

- VAT is floored to the nearest krona. The decimals are moved to account 3740,
  and has an effect on your revenue.

I understand too little to grasp why the above rounding conventions (?) exist.
As far as I can tell, it's rooted in laws from the 60s and 70s? Come to think
of it, Skatteverket only ever seems to deal with whole kronor when looking
through all transactions. It just feels inconsistent, because you most certainly
handle decimals elsewhere (such as with invoices).

It seems similar to the case with physical receipts, where people digitize
them as soon as possible, but still need to store the physical receipt in
a folder due to antiquated laws.

## Victim of cargo culting

My close friend who recommended I get into software consulting uses a "brutet räkenskapsår".
They surmised that accounting firms will be less busy when handling their annual reports. I chose to copy them.

Having the fiscal year start in July complicates the business logic somewhat, and adds mental overhead.

It is possible to switch so the fiscal year overlaps with the calendar year, but I have yet to figure out
the implications.

## Arbitrary business logic

In a Kevlin Henney talk (probably about unit testing), he mentioned how business logic can feel highly arbitrary.

I got a taste of this when realizing how corporate tax is calculated, particularly the way it's supposed to be rounded.
