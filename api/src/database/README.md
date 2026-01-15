# Database Setup

Production-ready database configuration for SkillBase using TypeORM and PostgreSQL.

## Structure

```
api/src/database/
├── data-source.ts       # TypeORM DataSource configuration
├── database.module.ts   # NestJS database module
└── migrations/         # Database migration files
```

## Entities

### User Entity
- `id` (uuid, primary key)
- `email` (unique, indexed)
- `password` (string)
- `name` (nullable)
- `created_at` (timestamp)

### Project Entity
- `id` (uuid, primary key)
- `name` (string)
- `api_key` (unique, indexed)
- `environment` (enum: 'live' | 'test')
- `user_id` (uuid, FK → User)
- `created_at` (timestamp)

## Migration Commands

### Run Migrations
```bash
npm run migration:run
```

### Revert Last Migration
```bash
npm run migration:revert
```

### Generate New Migration
```bash
npm run migration:generate api/src/database/migrations/MigrationName
```

### Show Migration Status
```bash
npm run migration:show
```

## Environment Variables

Required environment variables in `.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=skillbase
```

## Important Notes

- **synchronize: false** - Never use synchronize in production
- All schema changes must be done through migrations
- Migrations are reversible (up/down methods)
- Foreign keys use CASCADE delete for data integrity

