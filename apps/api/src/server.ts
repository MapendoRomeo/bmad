import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config/index.js';
import logger from './config/logger.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';
import { authMiddleware } from './middleware/auth.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import etablissementsRoutes from './modules/etablissements/etablissements.routes.js';
import utilisateursRoutes from './modules/utilisateurs/utilisateurs.routes.js';
import elevesRoutes from './modules/eleves/eleves.routes.js';
import classesRoutes from './modules/classes/classes.routes.js';
import enseignantsRoutes from './modules/enseignants/enseignants.routes.js';
import evaluationsRoutes from './modules/evaluations/evaluations.routes.js';
import presenceRoutes from './modules/presence/presence.routes.js';
import financierRoutes from './modules/financier/financier.routes.js';
import dashboardRoutes from './modules/dashboard/dashboard.routes.js';
import exportsRoutes from './modules/exports/exports.routes.js';

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan('dev'));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/etablissements', authMiddleware, etablissementsRoutes);
app.use('/api/utilisateurs', authMiddleware, utilisateursRoutes);
app.use('/api/eleves', authMiddleware, elevesRoutes);
app.use('/api/classes', authMiddleware, classesRoutes);
app.use('/api/enseignants', authMiddleware, enseignantsRoutes);
app.use('/api/evaluations', authMiddleware, evaluationsRoutes);
app.use('/api/presences', authMiddleware, presenceRoutes);
app.use('/api/financier', authMiddleware, financierRoutes);
app.use('/api/dashboard', authMiddleware, dashboardRoutes);
app.use('/api/exports', authMiddleware, exportsRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

export default app;
