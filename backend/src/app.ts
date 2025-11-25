// src/app.ts
import express from 'express';
import cors from 'cors';

// IMPORT ROUTER KITA
import alertRoutes from './routes/alert.routes';
import machineRoutes from './routes/machine.routes'; // (Nyalakan ini nanti)
// import dashboardRoutes from './routes/dashboard.routes'; // (Nyalakan ini nanti)

// BUAT APLIKASI
const app = express();

// PASANG MIDDLEWARE
app.use(cors()); // Izinkan CORS untuk Frontend
app.use(express.json()); // Izinkan server membaca JSON

// PASANG ROUTER
// Setiap request ke /api/alerts akan ditangani oleh alertRoutes
app.use('/api/alerts', alertRoutes);
app.use('/api/machines', machineRoutes);
// app.Gunakan('/api/dashboard', dashboardRoutes);

// EKSPOR APP (TANPA .listen())
export default app;