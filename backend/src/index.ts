import 'express-async-errors'; // Must be first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import { errorHandler } from './middlewares/errorHandler';
import { AppError } from './utils/AppError';
import logger from './utils/logger';

import authRoutes from './routes/auth.routes';
import tradeRoutes from './routes/trade.routes';

const app = express();

// 1. GLOBAL MIDDLEWARES
app.use(helmet());
app.use(cors({ origin: '*' })); // Allow all for assignment purposes

// Development logging
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Rate Limiting
const limiter = rateLimit({
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);

// Body parser
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Swagger Docs setup
const swaggerDocument = YAML.load(path.join(__dirname, '../swagger.yaml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// 2. ROUTES
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'PrimeTrade AI Backend is LIVE' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trades', tradeRoutes);

// Unhandled Route Fallback
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404, 'SYS_404'));
});

// 3. GLOBAL ERROR HANDLER
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Server correctly running on port ${PORT}...`);
  logger.info(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});
