# Job Tracker Backend

## Setup

1. Copy env file:
```bash
   cp .env.example .env
```
   Fill in real values.

2. Start Postgres (Docker):
```bash
   docker-compose up -d
```

3. Install deps:
```bash
   npm install
```

4. Run migrations:
```bash
   npx prisma migrate dev
```

5. Start dev server:
```bash
   npm run start:dev
```

API runs on http://localhost:3000.