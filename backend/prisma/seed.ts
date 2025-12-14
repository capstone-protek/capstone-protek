import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Bersihkan Data Lama (Biar tidak duplikat/error)
  await prisma.alerts.deleteMany();
  await prisma.machines.deleteMany();

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
    const machine = await prisma.machines.create({
      data: {
        aset_id: m.asetId,
        name: m.name,
        // @ts-ignore (Enum kadang rewel di seeder, kita ignore aman)
        status: m.status 
      }
    });
    console.log(`✅ Created machine: ${machine.aset_id}`);

    // Sensor history dihapus (tidak digunakan)
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