import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Bersihkan Data Lama (Biar tidak duplikat/error)
  await prisma.alert.deleteMany();
  await prisma.sensorHistory.deleteMany();
  await prisma.machine.deleteMany();

  console.log('🧹 Old data cleared.');

  // 2. Data Mesin "Real" (Sesuai Dataset ML / Kaggle)
  // Kita siapkan mesin-mesin yang nanti akan kita demo-kan
  const machinesData = [
    {
      asetId: "M-14850", // ID Paling umum di dataset
      name: "CNC Milling Machine A1",
      status: "HEALTHY"
    },
    {
      asetId: "M-33011", // <-- ID YANG KAMU TANYAKAN
      name: "Grinding Station 04",
      status: "HEALTHY"
    },
    {
      asetId: "M-18096", // ID yang tadi kamu tes
      name: "Hydraulic Press B2",
      status: "HEALTHY"
    },
    {
      asetId: "M-20232",
      name: "Drill Press X1",
      status: "HEALTHY"
    }
  ];

  // 3. Masukkan ke Database
  for (const m of machinesData) {
    const machine = await prisma.machine.create({
      data: {
        asetId: m.asetId,
        name: m.name,
        // @ts-ignore (Enum kadang rewel di seeder, kita ignore aman)
        status: m.status 
      }
    });
    console.log(`✅ Created machine: ${machine.asetId}`);

    // 4. Opsional: Buat Dummy History Awal (Biar grafik tidak kosong melompong)
    // Kita buat 10 data sensor palsu untuk masing-masing mesin
    const historyData = Array.from({ length: 10 }).map((_, i) => ({
      machineId: machine.id,
      type: 'RPM',
      value: 1400 + Math.random() * 200, // Random 1400-1600
      timestamp: new Date(Date.now() - i * 3600000) // Mundur per jam
    }));

    await prisma.sensorHistory.createMany({ data: historyData });
  }

  console.log('✅ Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });