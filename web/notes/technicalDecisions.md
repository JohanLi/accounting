## Preferring to build queries over using relations()

Over the years, something I value more is having code that I can quickly understand even
if I take a longer break from the entire codebase or even tech stack.

I've used SQL all my life, but am currently not using it in my day-to-day work, let alone using Drizzle.
This means that certain abstractions it introduces and offers don't provide me as much value.

I've decided to ditch `relations()` and instead build queries manually with the help
of `array_agg` and `jsonb_build_object`. While it's no denying `relations()` is useful, it's rather
hard for me to glance at those definitions and quickly determine what they do and how they work. In
addition, something like `export const JournalEntriesRelations = relations()` is never actually
imported in userland, so it adds confusion to me. Fortunately, Drizzle's query builder is very intuitive.

Joins, `array_agg` and `jsonb_build_object` are ingrained into my mind, but `relations()` aren't.

## Identifying bank transactions by date, amount and balance

Bank transactions used to be identified by a hash of the bank's own ID (`raw.id`). It turned out
the bank sometimes changes that ID for transactions that have already been imported, so importing
an overlapping date range created duplicates. Since 2026-11-11, `external_id` is instead a hash of
`bookedDate-amount-availableBalance`, the same approach as for tax account transactions. Existing rows
were recomputed with a one-off SQL script.

The only exception is transaction 1832. It's a duplicate of 1119 (the savings account interest from
2023-12-29, imported twice, see revisions.md 2026-09-28) and both produce the same new key, which the unique
index on `(type, external_id)` doesn't allow. 1119 got the new key, while 1832 kept the old one, i.e. the
SHA-256 of the bank's ID at the time, which no running code generates anymore. It's kept rather than deleted
because entry 318 in closed FY2024 is linked to it. Since the bank no longer sends that ID, nothing will match it on import.
