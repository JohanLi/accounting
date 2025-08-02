### VAT

"Utgående moms" is when you sell something. It's either 2610, 2620 or
2630 depending on the VAT rate. In my case, it's exclusively 2610 (25% VAT).
Treated as a debt to Skatteverket.

"Ingående moms" is when you make purchases. Always account 2640. This
is what you get back from Skatteverket/it's treated as a credit.

Sources:
- https://www.fortnox.se/fortnox-foretagsguide/bokforingstips/moms

VAT returns/declarations are done every month, quarter, or year depending
on revenue. When I started the company, I only had to do it yearly. After
FY2023, it'll be done quarterly.

#### VAT return journal entry

On the last day of a reporting period, zero all VAT accounts. If VAT is owed
(which it most likely is), move it to 2650. Otherwise, move it to 1650.

The number should be floored to the nearest krona. The remainder is moved
to account 3740.

#### 1650 or 2650?

1650 is used for positive VAT while 2650 is used to denote what you owe
Skatteverket. My understanding is that it doesn't make a huge difference,
but preferably one of them should be moved to the other at the end of reporting
periods if their sign is wrong.

Random sources claim having the wrong sign can trigger validation errors
when reporting VAT, and that it may look strange in the annual report.

(It strikes me as odd that there's apparently a convention of having specific
accounts that are supposed to always be positive or negative.)

Sources:
- https://foretagande.se/forum/bokforing-skatter-och-foretagsformer/72818-moms-1650-mot-2650
- https://foretagande.se/forum/bokforing-skatter-och-foretagsformer/72811-hur-bokfora-aterbetalning-av-skatterattelse-pa-moms
- https://forum.vismaspcs.se/t5/Fragor-om-bokforing/Omfora-moms-fran-2650-till-1650-vid-bokslut/td-p/113024

#### 2614, 2645

These accounts have to do with reverse charge VAT, and occurs when I purchase
subscriptions like Google Workspace. They should sum to 0.

2615 also exists, but it's for goods as opposed to services.

#### Rounding down to the nearest krona

5000.90 SEK becomes 5000.00 SEK. 0.90 SEK is moved to account 3740.

"redovisning och inbetalning av mervärdesskatt till statsverket alltid görs i hela krontal"

"lag om avrundning av vissa öresbelopp (1970:1029)"

Source: https://www4.skatteverket.se/rattsligvagledning/edition/2015.2/321578.html#ref-cite-sfs-20111261-1

One thing to note is that 3740 affects your revenue.
