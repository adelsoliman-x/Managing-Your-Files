import express from 'express';
import authRoutes from '../server/routes/auth.js';
import fileRoutes from '../server/routes/files.js';
import folderRoutes from '../server/routes/folders.js';
import userRoutes from '../server/routes/users.js';
import statsRoutes from '../server/routes/stats.js';
import auditRoutes from '../server/routes/audit.js';
import codeExportRoutes from '../server/routes/codeExport.js';

const app = express();

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Mount All REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use('/api/code-export', codeExportRoutes);

export default app;
