## Getting started

```
docker volume create --name=accounting-postgres
docker-compose up -d

npm install
npx prisma migrate dev
npm run dev
```
