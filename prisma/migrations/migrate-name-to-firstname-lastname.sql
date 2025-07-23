-- Migration: Split name field into firstName and lastName
-- This migration splits the existing 'name' field into 'firstName' and 'lastName'

-- Step 1: Add new columns
ALTER TABLE users ADD COLUMN firstName VARCHAR(50);
ALTER TABLE users ADD COLUMN lastName VARCHAR(50);

-- Step 2: Migrate existing data (split name by space)
-- Handle simple names (split on first space)
UPDATE users 
SET 
  firstName = CASE 
    WHEN position(' ' in name) > 0 
    THEN substring(name from 1 for position(' ' in name) - 1)
    ELSE name
  END,
  lastName = CASE 
    WHEN position(' ' in name) > 0 
    THEN substring(name from position(' ' in name) + 1)
    ELSE ''
  END
WHERE name IS NOT NULL;

-- Step 3: Make new columns NOT NULL after data migration
ALTER TABLE users ALTER COLUMN firstName SET NOT NULL;
ALTER TABLE users ALTER COLUMN lastName SET NOT NULL;

-- Step 4: Drop the old name column
ALTER TABLE users DROP COLUMN name;

-- Step 5: Update any remaining empty lastNames to avoid empty strings
UPDATE users SET lastName = 'Unknown' WHERE lastName = '' OR lastName IS NULL;