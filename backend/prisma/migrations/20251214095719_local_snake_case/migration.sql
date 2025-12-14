/*
  Warnings:

  - You are about to drop the column `failure_prob` on the `prediction_results` table. All the data in the column will be lost.
  - You are about to drop the column `rul_minutes` on the `prediction_results` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `prediction_results` table. All the data in the column will be lost.
  - You are about to drop the column `Air temperature [K]` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `Process temperature [K]` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `Rotational speed [rpm]` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `Tool wear [min]` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `Torque [Nm]` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the column `Type` on the `sensor_data` table. All the data in the column will be lost.
  - You are about to drop the `Alert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Machine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SensorHistory` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `action` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `failure_type` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `pred_status` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `risk_probability` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rul_estimate` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rul_minutes_val` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rul_status` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `urgency` to the `prediction_results` table without a default value. This is not possible if the table is not empty.
  - Added the required column `air_temperature_k` to the `sensor_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `process_temperature_k` to the `sensor_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rotational_speed_rpm` to the `sensor_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tool_wear_min` to the `sensor_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `torque_nm` to the `sensor_data` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `sensor_data` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Alert" DROP CONSTRAINT "Alert_machineId_fkey";

-- DropForeignKey
ALTER TABLE "SensorHistory" DROP CONSTRAINT "SensorHistory_machineId_fkey";

-- AlterTable
ALTER TABLE "prediction_results" DROP COLUMN "failure_prob",
DROP COLUMN "rul_minutes",
DROP COLUMN "status",
ADD COLUMN     "action" TEXT NOT NULL,
ADD COLUMN     "failure_type" TEXT NOT NULL,
ADD COLUMN     "pred_status" TEXT NOT NULL,
ADD COLUMN     "risk_probability" TEXT NOT NULL,
ADD COLUMN     "rul_estimate" TEXT NOT NULL,
ADD COLUMN     "rul_minutes_val" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rul_status" TEXT NOT NULL,
ADD COLUMN     "urgency" TEXT NOT NULL,
ALTER COLUMN "machine_id" SET DATA TYPE TEXT,
ALTER COLUMN "prediction_time" SET DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "prediction_time" SET DATA TYPE TIMESTAMP(3);

-- AlterTable
ALTER TABLE "sensor_data" DROP COLUMN "Air temperature [K]",
DROP COLUMN "Process temperature [K]",
DROP COLUMN "Rotational speed [rpm]",
DROP COLUMN "Tool wear [min]",
DROP COLUMN "Torque [Nm]",
DROP COLUMN "Type",
ADD COLUMN     "air_temperature_k" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "process_temperature_k" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "rotational_speed_rpm" INTEGER NOT NULL,
ADD COLUMN     "tool_wear_min" INTEGER NOT NULL,
ADD COLUMN     "torque_nm" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "insertion_time" SET DATA TYPE TIMESTAMP(3);

-- DropTable
DROP TABLE "Alert";

-- DropTable
DROP TABLE "Machine";

-- DropTable
DROP TABLE "SensorHistory";

-- CreateTable
CREATE TABLE "machines" (
    "id" SERIAL NOT NULL,
    "aset_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "MachineStatus" NOT NULL DEFAULT 'OFFLINE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "machines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" SERIAL NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "machine_id" INTEGER NOT NULL,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "machines_aset_id_key" ON "machines"("aset_id");

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sensor_data" ADD CONSTRAINT "sensor_data_machine_id_fkey" FOREIGN KEY ("machine_id") REFERENCES "machines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
