import { PrismaClient } from '@prisma/client';
import { SYNTHETIC_DATA } from '../src/data/syntheticData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // 1. Bersihkan Data Lama (Reset Total)
  // Urutan delete penting karena foreign key constraints
  await prisma.alert.deleteMany();
  await prisma.sensorHistory.deleteMany();
  // Hapus data di tabel prediction_results jika sudah di-pull (kalau error hapus baris ini)
  // await prisma.prediction_results.deleteMany(); 
  await prisma.machine.deleteMany();

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

  let idCounter = 2; // Mulai dari ID 2
  for (const m of otherMachines) {
    const machine = await prisma.machine.create({
      data: {
        id: idCounter++, // Pakai ID urut manual biar rapi
        asetId: m.asetId,
        name: m.name,
        // @ts-ignore
        status: m.status
      }
    });
    console.log(`✅ Created extra machine: ${machine.asetId}`);

    // Generate Dummy History Random (Cukup untuk visualisasi dummy)
    // Kita buat 5 jenis sensor juga biar grafik frontend tidak error
    const sensorTypes = ['Air_Temp', 'Process_Temp', 'RPM', 'Torque', 'Tool_Wear'];
    // PERBAIKAN 1: Tambahkan tipe explicit ': any[]' agar TS tidak bingung
    const dummyHistory: any[] = [];
    
    for (let i = 0; i < 10; i++) { // 10 data points per sensor
      const time = new Date(Date.now() - i * 3600000);
      sensorTypes.forEach(type => {
        dummyHistory.push({
          machineId: machine.id,
          type: type,
          value: 100 + Math.random() * 50, // Nilai random
          timestamp: time
        });
      });
    }

    // @ts-ignore
    await prisma.sensorHistory.createMany({ data: dummyHistory });
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