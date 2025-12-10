import express from 'express';
import cors from 'cors';

// 1. IMPORT LIBRARY SWAGGER & UTILS
import 'dotenv/config';

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

import alertRoutes from './routes/alert.routes';
import machineRoutes from './routes/machine.routes';
import predictRoutes from './routes/predict.routes';
import dashboardRoutes from './routes/dashboard.routes';
import chatRoutes from "./routes/chat.routes";
import simulationRoutes from './routes/simulation.routes';

const app = express();

const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 4. PASANG ROUTER API
app.use('/api/alerts', alertRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/predict', predictRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/simulation', simulationRoutes);
app.use('/api/chat', chatRoutes);


// EKSPOR APP
export default app;