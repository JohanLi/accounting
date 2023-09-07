### `getTextContent()` returning split words and values

It appears that documents produced by saving Gmail emails as PDF results in
files that aren't correctly handled by getTextContent(). A hotel receipt and
a flight receipt both have this problem.

For example, even though you can see "SEK 1 234,56" and "SEK 123,45" in the PDF,
`getTextContent()` produces `["SEK", " ", "1", " ", "234,56"]`. Words are
also split up, but not always.

An option could be to match against the entire document joined together.

As only few documents are of this sort, they will be handled manually for now.
