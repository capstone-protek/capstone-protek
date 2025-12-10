import express from 'express';
import cors from 'cors';
// 1. IMPORT LIBRARY SWAGGER
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// Import Router yang sudah ada
import alertRoutes from './routes/alert.routes';
import machineRoutes from './routes/machine.routes';
import predictRoutes from './routes/predict.routes';
import dashboardRoutes from './routes/dashboard.routes';
import simulationRoutes from './routes/simulation.routes';

const app = express();

// 2. LOAD FILE SWAGGER.YAML
// Menggunakan path.join agar lokasinya akurat di folder backend
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

// Middleware standar
app.use(cors());
app.use(express.json());

// 3. PASANG RUTE SWAGGER UI
// Ini artinya: Kalau user buka "/api-docs", tampilkan Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Pasang Router API lainnya
app.use('/api/alerts', alertRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);

export default app;