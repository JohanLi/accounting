### Preliminary tax, corporate tax, 2518 and 2512 vs. 2510

As far as preliminary tax and corporate tax goes, it's often advisable to
move them to 2518 and 2512, respectively. This lets you more easily compare
the two, rather than using the catch-all account 2510 for both.

Sources:

- https://edeklarera.se/arsredovisning/skatt-i-aktiebolag#redovisning-av-bolagsskatt
- https://forum.vismaspcs.se/t5/Fragor-om-bokforing/Byta-fran-2510-till-2518-och-2512/m-p/174660

#### Deciding to use 2510

For calculating paid preliminary tax and corporate tax, I've built an abstraction for it.

I'm also not sure if 2518 alone would've helped, because preliminary tax is shifted 1 month forward. In other words,
just looking at 2518 for a fiscal year isn't enough.

Also, the approach of using 2518 and 2512 isn't useful in of itself – the actual user experience is knowing
whether it's likely they'll be a large difference between your paid preliminary tax and your corporate tax.

#### What events/transactions are part of preliminary tax?

**Debiterad preliminärskatt**

On the 12th of the next month, preliminary tax is deducted from your tax account for the current month.
The amount deducted depends on the "expected profit" you've provided Skatteverket. This amount can be changed,
and Skatteverket will adjust the amount deducted accordingly.

**Tillgodoförd debiterad preliminärskatt**

Some time after you've submitted your annual report (actually, it's Inkomstdeklaration 2), Skatteverket will
return all your paid preliminary tax to your tax account. I haven't figured out exactly when this happens.
Funnily enough, for FY2022, this transaction occurred as late as FY2024.

**Slutlig skatt**

On the same day, provided you have corporate tax to pay (which I didn't in FY2021),
Skatteverket deducts the full amount of your corporate tax from your tax account as.
