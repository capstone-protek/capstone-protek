// backend/prisma/seed.ts
import 'dotenv/config';
import { PrismaClient, MachineStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Start seeding...');

  // 1. Clean Slate (Hapus data lama biar gak duplikat)
  await prisma.sensorHistory.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.machine.deleteMany();
  
  console.log('🗑️ Deleted old data.');

  // 2. Definisi Mesin Dummy
  const machinesData = [
    { asetId: 'M-18096', name: 'CNC Milling A1', status: MachineStatus.CRITICAL },
    { asetId: 'M-20231', name: 'Lathe Machine X1', status: MachineStatus.HEALTHY },
    { asetId: 'M-20232', name: 'Drill Press B2', status: MachineStatus.WARNING },
    { asetId: 'M-33011', name: 'Grinding Stn 04', status: MachineStatus.OFFLINE },
  ];

  for (const m of machinesData) {
    // Create Machine
    const machine = await prisma.machine.create({
      data: {
        asetId: m.asetId,
        name: m.name,
        status: m.status,
      },
    });

    console.log(`✅ Created machine: ${m.name} (ID: ${machine.id})`);

    // Jika Offline, skip generate data sensor
    if (m.status === MachineStatus.OFFLINE) continue;

    // 3. Generate History (Loop Mundur 24 Jam terakhir)
    const historyData: Prisma.SensorHistoryCreateManyInput[] = [];
    const now = new Date();
    
    // Kita buat 50 titik data ke belakang (interval random)
    for (let i = 0; i < 50; i++) {
      const timePoint = new Date(now.getTime() - i * 15 * 60 * 1000); // Mundur i * 15 menit
      const isCritical = m.status === MachineStatus.CRITICAL;
      
      // Karena Schema pakai model EAV (Type & Value), kita push per tipe sensor
      // 1. RPM
      historyData.push({
        machineId: machine.id,
        timestamp: timePoint,
        type: 'RPM',
        value: isCritical ? (1200 + Math.random() * 500) : (1500 + Math.random() * 100),
      });

      // 2. Temperature
      historyData.push({
        machineId: machine.id,
        timestamp: timePoint,
        type: 'Temperature',
        value: isCritical ? (80 + Math.random() * 20) : (60 + Math.random() * 5),
      });
    }

    // Bulk Insert biar cepat
    await prisma.sensorHistory.createMany({ data: historyData });
  }

  console.log('🏁 Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });