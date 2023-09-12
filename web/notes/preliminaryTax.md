### Preliminary tax, accounts 2510, 2512, and 2518

When preliminary tax is taken from your tax account, there are typically two
ways to book it:

1. Use 2518, which is specifically for preliminary tax.
2. Use the "aggregated"/"catch-all" account 2510.

Basically, the thought behind 2518 is that it lets you directly compare it
against your calculated corporate tax (which is booked in 2512). In other words,
there'd be no other transactions "interfering" with the comparison.

Sources:
- https://edeklarera.se/arsredovisning/skatt-i-aktiebolag#redovisning-av-bolagsskatt
- https://forum.vismaspcs.se/t5/Fragor-om-bokforing/Byta-fran-2510-till-2518-och-2512/m-p/174660

#### Using 2510

After some thought, I'm scrapping the 2512 and 2518 idea:

- So far, I don't see any transactions "polluting" 2510
- Looking at 2518 for a fiscal year doesn't appear to work, because the
  preliminary tax payments are shifted one month. E.g., the final June
  installment actually occurs July 12.
- If this comparison thing ever becomes a problem, it'll be handled through
  an abstraction

Also, I think the real user experience is knowing whether you'll be
owed taxes. Once the July 12 transaction has been imported, and you've
calculated your corporate tax – are you in the red? The desired outcome is
not having to pay interest on the amount, by having it paid by Feb 13
the following year.
