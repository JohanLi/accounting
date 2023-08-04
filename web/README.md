### Invoices and receipts used for testing

Real documents are used for unit tests and end-to-end tests. Because they
contain sensitive information, they are not included in the repository.

Instead, they are uploaded to Cloudflare R2 and downloaded during CI.

Uploading is done by running:

```
rclone copy src/documents/ r2:accounting/ --include "*.pdf"
```

Make sure `~/.config/rclone/rclone.conf` is set up.

### Importing old invoices and receipts

```
pnpm run import
```
