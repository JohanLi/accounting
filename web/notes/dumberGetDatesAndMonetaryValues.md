In the beginning, my approach was to create generic functions for extracting all
dates and monetary values, respectively.

Over time, I realized both can appear in too many formats, particularly as I have
a mix of Swedish, US, and EU documents. Soon enough, there'll be cases where a
regex rule extracts one document correctly but grabs wrong values for
another. The order of rules became important, and I found myself having to add code
that looks for hints elsewhere in documents.

E.g., to resolve ambiguities like MM/DD/YYYY and DD/MM/YYYY, one could check if
$ is found in the document (meaning USA/Canada).

Having many regex rules also becomes problematic over time — I change providers, and
existing providers change document format. Which rules are still necessary to keep?

## Solution

Rather than using invoices/documents as a starting point, I realized it'd be better
to use bank transactions as just that. Each transaction already has a value and a date.

The number of providers for which I want to extract dates and monetary values is small
and changes infrequently. It's simpler to define extraction rules for each of them.
