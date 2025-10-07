# 🗄️ Database Migrations

This directory contains all database migration files for the 9ja Dental CBT platform.

## Migration Files

### `000_auth_and_session_migration.sql`

Complete initial schema migration including:

- ✅ Better Auth tables (user, session, account, verification)
- ✅ Dental CBT core tables (19 tables total)
- ✅ Comprehensive indexes for performance
- ✅ Cloudflare D1 optimized

## Running Migrations

### Option 1: Using Wrangler (Recommended for Cloudflare D1)

```bash
# Apply migrations to local D1
wrangler d1 migrations apply dental_data --local

# Apply migrations to remote D1
wrangler d1 migrations apply dental_data --remote
```

### Option 2: Using Drizzle Kit

```bash
# Generate migration files from schema
pnpm db:generate

# Apply migrations (requires proper D1 configuration)
pnpm db:migrate
```

## Migration Structure

```
src/drizzle/
├── 000_auth_and_session_migration.sql  # Initial complete schema
├── meta.json                            # Migration metadata
└── README.md                            # This file
```

## Database Tables

### Authentication (4 tables)

1. **user** - User accounts with Better Auth support
2. **session** - Active user sessions
3. **account** - OAuth provider accounts (Google, etc.)
4. **verification** - Email verification tokens

### Core Application (15 tables)

5. **specialties** - Dental specialties/categories
6. **questions** - Question bank
7. **quizzes** - Quiz templates
8. **quiz_questions** - Quiz-question relationships
9. **quiz_sessions** - Active quiz sessions
10. **quiz_results** - Completed quiz results
11. **user_progress** - User progress by specialty
12. **study_sessions** - Study session tracking
13. **user_preferences** - User settings
14. **achievements** - Achievement definitions
15. **user_achievements** - User achievement progress
16. **daily_activity** - Daily activity logs
17. **user_streaks** - Streak tracking
18. **bookmarks** - User bookmarks
19. **system_settings** - Application settings

## Important Notes

### Timestamp Handling

- Uses `unixepoch()` for SQLite compatibility with Cloudflare D1
- Triggers automatically update `updated_at` fields
- Drizzle ORM uses `$defaultFn()` and `$onUpdateFn()` for timestamps

### Foreign Key Constraints

- Enabled via `PRAGMA foreign_keys = ON`
- CASCADE deletes configured for user-related data
- Proper referential integrity

### Indexes

- Comprehensive indexes for query performance
- Optimized for common query patterns
- Composite indexes for leaderboard and analytics

## Verifying Migrations

### Check Applied Migrations

```bash
# List migrations in D1
wrangler d1 migrations list dental_data --local

# View database structure
wrangler d1 execute dental_data --command "SELECT name FROM sqlite_master WHERE type='table';"
```

### Test Database Connection

```typescript
import { getDb } from "@/db";

const db = await getDb();
const users = await db.select().from(user).limit(1);
console.log("Database connected:", users);
```

## Troubleshooting

### Migration Fails

1. **Check D1 configuration** in `wrangler.jsonc`:

   ```jsonc
   {
     "d1_databases": [
       {
         "binding": "dental_data",
         "database_id": "your-database-id"
       }
     ]
   }
   ```

2. **Verify environment variables** in `.dev.vars`:

   ```
   CLOUDFLARE_ACCOUNT_ID=your-account-id
   CLOUDFLARE_D1_TOKEN=your-token
   ```

3. **Check drizzle.config.ts**:
   ```typescript
   export default defineConfig({
     schema: "./src/db/schema.ts",
     out: "./src/drizzle",
     dialect: "sqlite",
     driver: "d1-http",
   });
   ```

### Schema Sync Issues

If schema changes aren't reflected:

```bash
# Clear migration cache
rm -rf src/drizzle/*.json

# Regenerate migrations
pnpm db:generate

# Apply fresh
wrangler d1 migrations apply dental_data --local
```

## Development Workflow

1. **Modify schema** in `src/modules/auth/schemas/auth.schema.ts`
2. **Generate migration**: `pnpm db:generate --name your_migration_name`
3. **Review migration** file in `src/drizzle/`
4. **Apply locally**: `wrangler d1 migrations apply dental_data --local`
5. **Test changes** in development
6. **Apply to remote**: `wrangler d1 migrations apply dental_data --remote`

## Best Practices

- ✅ Always test migrations locally first
- ✅ Use descriptive migration names
- ✅ Never modify existing migration files
- ✅ Create new migration files for schema changes
- ✅ Backup production database before applying migrations
- ✅ Use transactions for complex migrations
- ✅ Document breaking changes

## Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Better Auth Documentation](https://www.better-auth.com/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
