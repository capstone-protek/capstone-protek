import { PrismaClient } from '@prisma/client';
import { SYNTHETIC_DATA } from '../src/data/syntheticData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Bersihkan Data Lama (Biar tidak duplikat/error)
  await prisma.alerts.deleteMany();
  await prisma.machines.deleteMany();

  console.log('🧹 Old data cleared.');

  // ==========================================
  // 2. DATA UTAMA (WAJIB untuk SIMULASI ML)
  // ==========================================
  const mainMachine = await prisma.machine.create({
    data: {
      id: 1, // ✨ WAJIB ID 1 agar sinkron dengan Python script
      asetId: 'M-14850',
      name: 'CNC Milling Machine - Main Simulation',
      status: 'HEALTHY',
    },
  });
  console.log(`✅ Created Main Simulation Machine: ${mainMachine.asetId} (ID: 1)`);

  // Seeding History untuk Mesin Utama (Pakai Data Pintar/Sintetis)
  console.log('⏳ Seeding sensor history for Main Machine...');
  for (const row of SYNTHETIC_DATA) {
    await prisma.sensorHistory.createMany({
      data: [
        { machineId: mainMachine.id, type: 'Air_Temp', value: row.Air_Temp },
        { machineId: mainMachine.id, type: 'Process_Temp', value: row.Process_Temp },
        { machineId: mainMachine.id, type: 'RPM', value: row.RPM },
        { machineId: mainMachine.id, type: 'Torque', value: row.Torque },
        { machineId: mainMachine.id, type: 'Tool_Wear', value: row.Tool_Wear },
      ],
    });
  }

  // ==========================================
  // 3. DATA TAMBAHAN (Untuk Pemanis Dashboard)
  // ==========================================
  const otherMachines = [
    { asetId: "M-33011", name: "Grinding Station 04", status: "HEALTHY" },
    { asetId: "M-18096", name: "Hydraulic Press B2", status: "WARNING" },
    { asetId: "M-20232", name: "Drill Press X1", status: "HEALTHY" }
  ];

  // 3. Masukkan ke Database
  for (const m of machinesData) {
    const machine = await prisma.machines.create({
      data: {
        aset_id: m.asetId,
        name: m.name,
        // @ts-ignore
        status: m.status
      }
    });
    console.log(`✅ Created machine: ${machine.aset_id}`);

    // Sensor history dihapus (tidak digunakan)
  }

  console.log('✅ Seeding finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });