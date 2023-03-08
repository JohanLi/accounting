# Accounting

For personal use. The user experience I'm aiming for is:

- A Chrome extension for getting bank transactions and downloading receipts
- Receipts, or entire folders of them, are drag-and-dropped into a web app
- The backend recognizes typical ones, determining the totals, VAT and financial account codes
- Portability is handled through being able to import and export SIE files

## Getting started

```
docker volume create --name=accounting-postgres
docker-compose up -d

npm install
npx prisma migrate dev
npm run dev
```
