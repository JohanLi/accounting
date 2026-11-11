### Journal entry revisions

#### 2025-08-02

- All instances of Momsredovisning renamed to include `FY`. E.g., `Momsredovisning 2025 Q3` is now `Momsredovisning FY2025 Q3`
- Hotel invoices were entered as account code 6550. All instances in FY2025 have been changed to 5831. VAT is unaffected — 12% had been correctly applied.

#### 2026-09-28

- The savings account interest from 2023-12-29 (5 850.26) was imported twice, creating two bank transactions
  and two identical journal entries (306 and 318). FY2024 interest income was therefore overstated,
  and 1931 has been 5 850.26 higher than the actual bank balance ever since.
- As FY2024 and FY2025 are closed and filed, entry 318 is left untouched. Instead, a correction entry (797)
  dated 2026-06-30 moves the difference to a non-deductible account:

| Account | Amount   |
| ------- | -------- |
| 6992    | 5850.26  |
| 1931    | -5850.26 |

- 6992 (Övriga externa kostnader, ej avdragsgilla) is used because the interest was taxed in FY2024, not FY2026.
  Deducting it in FY2026 would put the tax effect in the wrong year. Roughly 1 205 SEK (20.6%) was overpaid
  in FY2024, which could be reclaimed through omprövning.
- VAT is unaffected, as interest is exempt from VAT.
- Since October 2023, Trygg-Hansa premiums were booked with the wrong sign (1930 debited, 6310 credited),
  due to a bug in `insuranceSuggestions.ts`. Each premium was recorded as income rather than a cost,
  and 1930 ended up higher than the actual bank balance by twice the premium.
- The bug is fixed, and the entries in FY2026 and FY2027 have been flipped in place. Entries in FY2024
  (9 premiums, 2 593 SEK) and FY2025 (12 premiums, 3 666 SEK) are left untouched, as those years are closed and filed.
  Instead, a correction entry (798) dated 2026-06-30 covers twice their total:

| Account | Amount    |
| ------- | --------- |
| 6992    | 12518.00  |
| 1930    | -12518.00 |

- As with the interest above, 6992 is used because the deductions belong to FY2024 and FY2025. Roughly 1 070 SEK (FY2024)
  and 1 510 SEK (FY2025) was overpaid, which could be reclaimed through omprövning.

#### 2026-11-11

- Entries 741 and 743 (Skånetrafiken, Öresundszon Malmö Hyllie–CPH Airport, 150 SEK each) deducted 6% input VAT
  (8.49 SEK each), but the receipts state 0% VAT. FY2026 Q4 (April–June) input VAT was therefore overstated by 16.98 SEK.
- As the FY2026 Q4 VAT return is filed, entries 741 and 743 are left untouched. Instead, a correction entry (838)
  dated 2026-09-30 includes the difference in the FY2027 Q1 (July–September) VAT return:

| Account | Amount |
| ------- | ------ |
| 2640    | -16.98 |
| 5810    | 16.98  |

- 5810 is used rather than 6992, as the cost was never deducted in FY2026. It's deducted once, a year late, which is immaterial.
