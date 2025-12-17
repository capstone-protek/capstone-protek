import { PrismaClient, MachineStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Cleaning up database...');

  // Hapus data BERURUTAN (child → parent)
  await prisma.alerts.deleteMany();
  await prisma.sensor_data.deleteMany();
  await prisma.prediction_results.deleteMany();
  await prisma.machines.deleteMany();

  console.log('🌱 Seeding machines...');

  const machinesData: {
    machine_id: string;
    name: string;
    status: MachineStatus;
  }[] = [
    {
      machine_id: 'M-14850',
      name: 'CNC Grinder 01',
      status: MachineStatus.HEALTHY,
    },
  ];

  for (const m of machinesData) {
    // 1️⃣ Create Machine
    const machine = await prisma.machines.create({
      data: {
        machine_id: m.machine_id,
        name: m.name,
        status: m.status,
      },
    });

    console.log(`✅ Created machine: ${machine.name} (${machine.machine_id})`);

    // Helper boolean
    const isCritical = m.status === MachineStatus.CRITICAL;
    const isWarning  = m.status === MachineStatus.WARNING;
    const isHealthy  = m.status === MachineStatus.HEALTHY;
    const isOffline  = m.status === MachineStatus.OFFLINE;

    // 2️⃣ Sensor Data
    await prisma.sensor_data.create({
      data: {
        machine_id: m.machine_id,
        type: 'vibration',
        air_temperature_k: 300.5,
        process_temperature_k: 309.1,
        rotational_speed_rpm: isCritical ? 2800 : 1500,
        torque_nm: 40.5,
        tool_wear_min: 10,
        insertion_time: new Date(),
      },
    });

    // 3️⃣ Prediction Results (skip kalau OFFLINE)
    if (!isOffline) {
      await prisma.prediction_results.create({
        data: {
          machine_id: m.machine_id,
          risk_probability: isCritical ? 0.85 : isWarning ? 0.45 : 0.05,
          rul_estimate: isCritical ? '2 Jam' : '100+ Jam',
          rul_status: isCritical
            ? 'CRITICAL'
            : isWarning
            ? 'WARNING'
            : 'HEALTHY',
          rul_minutes_val: isCritical ? 120 : 6000,
          pred_status: isHealthy ? 'Normal' : 'Potential Failure',
          failure_type: isHealthy ? 'None' : 'Overheating',
          action: isHealthy ? 'Monitor' : 'Check Coolant',
          urgency: isCritical ? 'High' : 'Low',
          prediction_time: new Date(),
        },
      });
    }

    // 4️⃣ Alert (hanya kalau CRITICAL)
    if (isCritical) {
      await prisma.alerts.create({
        data: {
          machine_id: m.machine_id,
          message: 'Mesin berisiko tinggi mengalami kegagalan',
          severity: 'HIGH',
          timestamp: new Date(),
        },
      });
    }
  }

  console.log('🎉 Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error('❌ Seeder error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });