# Extension

Downloads my most common invoices. Also downloads bank and tax account transactions.
Requires manual login.

Invoices are sent to the web app's `/api/documents` endpoint; transactions are
sent to `/api/transactions`. The web app handles validation and deduplication,
so uploads are idempotent. It must be running locally for uploads to work.

Downloads intentionally overlap previous periods. Since I run them at least
quarterly for VAT reporting, an unexpectedly large number of new records signals
that an integration may have broken.

## Notes

To load the unpacked extension in Chrome — as `.output` is hidden — press `Command + Shift + .` in Finder to show hidden
folders.

### Credits

Icon created by Freepik - Flaticon
