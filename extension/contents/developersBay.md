In the beginning of 2024, they updated their platform and also made changes to invoices. They are now no longer
directly behind an API and generated server-side. Instead, their data is returned from a GraphQL endpoint, and
it is your client that generates the PDF using `@react-pdf/renderer`.

A major issue is that a lot of text inside those PDFs appear OK, but when you copy and paste names, dates and values,
they appear strange. This seems to be a bug in the library they use when certain custom fonts are used
(https://github.com/diegomura/react-pdf/pull/2408). I've notified Developers Bay about this.

For the foreseeable future, I'm redirecting `.ttf` requests to a font that doesn't result in the bug. As
`@react-pdf/renderer` does not support woff2, one way to find `.ttf` URLs from Google Fonts is running:

```
curl https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
```

While the `.ttf` files can also be served locally through `web_accessible_resources` and `redirect.extensionPath`, I think
it creates more moving pieces than necessary.

### General observations

One drawback with `declarative_net_request` (in `package.json`) is that it doesn't allow code colocation.
