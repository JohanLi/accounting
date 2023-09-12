### Skatt och årets resultat

There are a few journal entries that need to be created during the last
day of the fiscal year, as well as on the first day of the next one.

Some sort of abstraction would be useful, kind of like what I've done with
regard to salary. In fact, preliminary tax, salary, and whatever this would
be named are examples of such "abstractions". I'm unsure if it's worth the
effort, though, as it's only a few entries per year after all.

Assuming a 2022-01-01 to 2022-12-31 fiscal year, you'd need to do something
like:

2022-12-31: Skatt på årets resultat
2022-12-31: Årets resultat

2023-01-01: Omföring av årets resultat

2023-04-10: Resultatdisposition
2023-04-20: Utbetalning av utdelning (conditional)

Source: https://www.arsredovisning-online.se/bokfora_skatt_och_arets_resultat

#### Third-party services for submitting annual reports

Interestingly, the two services I've tried both calculated a different
"Skatt på årets resultat". As far as I can tell, it's because one of them
doesn't properly handle accounting entries that should not affect the tax
(either positively or negatively).

Unsurprisingly, it's the cheaper and less used one (looking at revenue numbers)
that doesn't handle it correctly. You get what you pay for, I guess.
