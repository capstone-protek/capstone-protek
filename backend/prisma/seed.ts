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
  // 2. DATA MESIN (Sesuai dengan Mapping di ML API)
  // ==========================================
  const machinesData = [
    { id: 1, asetId: "M-14850", name: "CNC Milling Machine - Main Simulation", status: "HEALTHY" },
    { id: 2, asetId: "M-33011", name: "Grinding Station 04", status: "HEALTHY" },
    { id: 3, asetId: "M-18096", name: "Hydraulic Press B2", status: "WARNING" },
    { id: 4, asetId: "M-20232", name: "Drill Press X1", status: "HEALTHY" }
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