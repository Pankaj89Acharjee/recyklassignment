import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { authMiddleware } from './middleware/auth';
import {connectDB} from './config/dbConnection';
import deviceRoutes from './routes/devices';
import authRoutes from './routes/auth';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import cookieParser from 'cookie-parser';


dotenv.config();

const app = express();

app.use(cors(
    {
        origin: 'http://localhost:5173',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    }
));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

connectDB().then(() => {
    console.log("Database connected and synced.");
}).catch(err => {
    console.error("Database connection error:", err);
});


const swaggerDocument = YAML.load('./swagger.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/auth', authRoutes);
app.use('/devices', authMiddleware, deviceRoutes);

export default app;