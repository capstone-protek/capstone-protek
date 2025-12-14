-- Drop old foreign keys first
ALTER TABLE "sensor_data" DROP CONSTRAINT "sensor_data_machine_id_fkey";
ALTER TABLE "prediction_results" DROP CONSTRAINT "prediction_results_machine_id_fkey";

-- Convert machine_id from TEXT to INTEGER
ALTER TABLE "sensor_data" ALTER COLUMN "machine_id" TYPE INTEGER USING NULL;
ALTER TABLE "prediction_results" ALTER COLUMN "machine_id" TYPE INTEGER USING NULL;

-- Recreate foreign keys with onDelete Cascade
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;