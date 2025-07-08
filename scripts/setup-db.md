# Database Setup Guide

You have several options for setting up the PostgreSQL database:

## Option 1: Local PostgreSQL (Recommended for Development)

### Install PostgreSQL locally:
```bash
# On macOS with Homebrew
brew install postgresql
brew services start postgresql

# Create database
createdb gamerentals

# Or connect to PostgreSQL and create manually
psql postgres
CREATE DATABASE gamerentals;
\q
```

### Update .env.local:
```
DATABASE_URL="postgresql://postgres:@localhost:5432/gamerentals"
```

## Option 2: Docker PostgreSQL (Easy Setup)

### Run PostgreSQL in Docker:
```bash
docker run --name gamerentals-db \
  -e POSTGRES_DB=gamerentals \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  -d postgres:15
```

### Update .env.local:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/gamerentals"
```

## Option 3: Online Database Services (Production-like)

### Railway.app (Free Tier):
1. Go to https://railway.app
2. Sign up and create new project
3. Add PostgreSQL service
4. Copy connection string to .env.local

### Supabase (Free Tier):
1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy connection string to .env.local

### Neon (Free Tier):
1. Go to https://neon.tech
2. Create new project
3. Copy connection string to .env.local

## After Database Setup:

1. Generate Prisma client:
```bash
npm run db:generate
```

2. Run migrations:
```bash
npm run db:migrate
```

3. Seed with sample data:
```bash
npm run db:seed
```

4. Test connection:
```bash
npm run db:test
```

5. Open Prisma Studio (optional):
```bash
npm run db:studio
```