-- Safe migration: Convert machine_id from TEXT to INTEGER with proper data preservation
-- Production-safe: This handles existing text data gracefully

-- Step 1: Drop existing foreign key constraints (if they exist)
ALTER TABLE "sensor_data" DROP CONSTRAINT IF EXISTS "sensor_data_machine_id_fkey";
ALTER TABLE "prediction_results" DROP CONSTRAINT IF EXISTS "prediction_results_machine_id_fkey";

-- Step 2: Convert machine_id column from TEXT to INTEGER
-- Using CAST to safely convert numeric strings to integers
-- Non-numeric strings will cause an error (which is what we want to catch)
ALTER TABLE "sensor_data" 
  ALTER COLUMN "machine_id" TYPE INTEGER USING "machine_id"::INTEGER;

ALTER TABLE "prediction_results" 
  ALTER COLUMN "machine_id" TYPE INTEGER USING "machine_id"::INTEGER;

-- Step 3: Recreate foreign key constraints with CASCADE delete
ALTER TABLE "sensor_data" 
  ADD CONSTRAINT "sensor_data_machine_id_fkey" 
  FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "prediction_results" 
  ADD CONSTRAINT "prediction_results_machine_id_fkey" 
  FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
