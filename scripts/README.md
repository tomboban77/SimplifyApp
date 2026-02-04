# Migration Scripts

This directory contains scripts for database migrations and seeding.

## Seed Templates

Populates Firebase Firestore with initial resume templates.

### Prerequisites

- Node.js installed
- Firebase project configured
- Environment variables set in `.env` file (see `.env.example`)

**Important:** All Firebase configuration must be provided via environment variables. No hardcoded values are allowed.

### Usage

#### Option 1: Using npm script (Recommended)

```bash
npm run seed:templates
```

This is the easiest way - it uses `tsx` automatically via npx.

#### Option 2: Using tsx directly

```bash
# Install tsx globally (optional)
npm install -g tsx

# Run the migration script
tsx scripts/seed-templates.ts
```

#### Option 3: Using ts-node

```bash
# Install ts-node if not already installed
npm install -g ts-node typescript

# Run the migration script
npx ts-node scripts/seed-templates.ts
```

#### Option 4: Compile and Run

```bash
# Compile TypeScript
npx tsc scripts/seed-templates.ts --outDir dist --esModuleInterop --moduleResolution node

# Run compiled JavaScript
node dist/scripts/seed-templates.js
```

### What it does

1. Connects to Firebase Firestore
2. Checks for existing templates
3. Creates new templates or updates existing ones (by ID)
4. Preserves original `createdAt` for existing templates
5. Updates `updatedAt` timestamp

### Template IDs

The script uses these template IDs:
- `template1` - Classic Professional
- `template2` - Modern Executive
- `template3` - Minimalist
- `template4` - Corporate
- `template5` - Bold Professional

### Notes

- The script is idempotent - safe to run multiple times
- Existing templates with matching IDs will be updated
- New templates will be created
- Original `createdAt` dates are preserved for existing templates

