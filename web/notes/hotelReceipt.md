### getTextContent() falling short on a hotel receipt

A hotel receipt, even though you can see "SEK 1 234,56" and "SEK 123,45",
results in strings like `["SEK", " ", "1", " ", "234,56"]`. Words are also
split up, but not always.

An option could be to match against the entire document joined together.

As only one document has this problem, that document will be handled manually.
