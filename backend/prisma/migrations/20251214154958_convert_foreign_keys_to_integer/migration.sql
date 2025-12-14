/*
  Warnings:

  - Changed the type of `machine_id` on the `prediction_results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `risk_probability` on the `prediction_results` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `machine_id` on the `sensor_data` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "sensor_data" DROP CONSTRAINT "sensor_data_machine_id_fkey";

-- AlterTable
ALTER TABLE "prediction_results" DROP COLUMN "machine_id",
ADD COLUMN     "machine_id" INTEGER NOT NULL,
DROP COLUMN "risk_probability",
ADD COLUMN     "risk_probability" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "sensor_data" DROP COLUMN "machine_id",
ADD COLUMN     "machine_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_results" ADD CONSTRAINT "prediction_results_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE CASCADE ON UPDATE CASCADE;
