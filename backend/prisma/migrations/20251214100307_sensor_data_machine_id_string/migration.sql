-- DropForeignKey
ALTER TABLE "sensor_data" DROP CONSTRAINT "sensor_data_machine_id_fkey";

-- AlterTable
ALTER TABLE "sensor_data" ALTER COLUMN "machine_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("aset_id") ON DELETE RESTRICT ON UPDATE CASCADE;
