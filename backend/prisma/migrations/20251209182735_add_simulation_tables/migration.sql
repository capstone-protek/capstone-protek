-- CreateTable
CREATE TABLE "sensor_data" (
    "id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "Type" VARCHAR(1) NOT NULL,
    "Air temperature [K]" DOUBLE PRECISION NOT NULL,
    "Process temperature [K]" DOUBLE PRECISION NOT NULL,
    "Rotational speed [rpm]" DOUBLE PRECISION NOT NULL,
    "Torque [Nm]" DOUBLE PRECISION NOT NULL,
    "Tool wear [min]" DOUBLE PRECISION NOT NULL,
    "vibration" DOUBLE PRECISION NOT NULL,
    "insertion_time" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sensor_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_results" (
    "id" SERIAL NOT NULL,
    "machine_id" INTEGER NOT NULL,
    "rul_minutes" DOUBLE PRECISION NOT NULL,
    "failure_prob" DOUBLE PRECISION NOT NULL,
    "prediction_time" TIMESTAMP(6) NOT NULL,
    "status" TEXT,

    CONSTRAINT "prediction_results_pkey" PRIMARY KEY ("id")
);
