## Preferring to build queries over using relations()

Over the years, something I value more is having code that I can quickly understand even
if I take a longer break from the entire codebase or even tech stack.

I've used SQL all my life, but am currently not using it in my day-to-day work, let alone using Drizzle.
This means that certain abstractions it introduces and offers don't provide me as much value.

I've decided to ditch `relations()` and instead build queries manually with the help
of `array_agg` and `json_build_object`. While it's no denying `relations()` is useful, it's rather
hard for me to glance at those definitions and quickly determine what they do and how they work. In
addition, something like `export const JournalEntriesRelations = relations()` is never actually
imported in userland, so it adds confusion to me. Fortunately, Drizzle's query builder is very intuitive.

Joins, `array_agg` and `json_build_object` are ingrained into my mind, but `relations()` aren't.
