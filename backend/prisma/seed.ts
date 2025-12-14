import { PrismaClient, MachineStatus } from '@prisma/client';
import { SYNTHETIC_DATA } from '../src/data/syntheticData';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Start seeding...');

  // Hapus data terkait dulu (hindari constraint FK)
  await prisma.sensor_data.deleteMany();
  await prisma.alerts.deleteMany();
  await prisma.machines.deleteMany();

  console.log('🧹 Old data cleared.');

  // ==========================================
  // 2. DATA UTAMA (WAJIB untuk SIMULASI ML)
  // ==========================================
  const mainMachine = await prisma.machines.create({
    data: {
      // ID auto, tapi kita pastikan aset_id sama dengan yang dipakai di ML
      aset_id: 'M-14850',
      name: 'CNC Milling Machine - Main Simulation',
      status: 'HEALTHY',
    },
  });
  console.log(`✅ Created Main Simulation Machine: ${mainMachine.aset_id}`);

  // Seeding sensor_data untuk Mesin Utama menggunakan SYNTHETIC_DATA
  console.log('⏳ Seeding sensor_data for Main Machine...');
  for (const row of SYNTHETIC_DATA) {
    await prisma.sensor_data.create({
      data: {
        machine_id: mainMachine.aset_id,
        type: 'synthetic',
        air_temperature_k: Number(row.Air_Temp),
        process_temperature_k: Number(row.Process_Temp),
        rotational_speed_rpm: Number(row.RPM),
        torque_nm: Number(row.Torque),
        tool_wear_min: Number(row.Tool_Wear),
      },
    });
  }

  // ==========================================
  // 3. DATA TAMBAHAN (Untuk Pemanis Dashboard)
  // ==========================================
  const otherMachines: { asetId: string; name: string; status: MachineStatus }[] = [
    { asetId: 'M-33011', name: 'Grinding Station 04', status: 'HEALTHY' },
    { asetId: 'M-18096', name: 'Hydraulic Press B2', status: 'WARNING' },
    { asetId: 'M-20232', name: 'Drill Press X1', status: 'HEALTHY' },
  ];

  for (const m of otherMachines) {
    const machine = await prisma.machines.create({
      data: {
        aset_id: m.asetId,
        name: m.name,
        status: m.status,
      },
    });
    console.log(`✅ Created machine: ${machine.aset_id}`);
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