
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDb } from './db/postgres';
import { login, register, getMe } from './controllers/authController';
import { getAllUsers, getStats, getInspectors, createUser, updateUser, updateUserStatus, deleteUser } from './controllers/userController';
import { getAllFaults, getFaultStats, getFaultById, createFault, updateFault, assignFault, deleteFault } from './controllers/faultController';
import { getAllSchedules, getScheduleStats, getScheduleById, createSchedule, updateSchedule, deleteSchedule, getActiveSchedules } from './controllers/scheduleController';
import { authMiddleware, adminMiddleware } from './middleware/auth';

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3002;

const allowedOrigins = (process.env.CORS_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.post('/api/auth/login', login);
app.post('/api/auth/register', register);
app.get('/api/auth/me', authMiddleware, getMe);

app.get('/api/users', authMiddleware, adminMiddleware, getAllUsers);
app.get('/api/users/stats', authMiddleware, getStats);
app.get('/api/users/inspectors', authMiddleware, getInspectors);
app.post('/api/users', authMiddleware, adminMiddleware, createUser);
app.put('/api/users/:id', authMiddleware, adminMiddleware, updateUser);
app.put('/api/users/:id/status', authMiddleware, adminMiddleware, updateUserStatus);
app.delete('/api/users/:id', authMiddleware, adminMiddleware, deleteUser);

app.get('/api/faults', authMiddleware, getAllFaults);
app.get('/api/faults/stats', authMiddleware, getFaultStats);
app.get('/api/faults/:id', authMiddleware, getFaultById);
app.post('/api/faults', authMiddleware, createFault);
app.put('/api/faults/:id', authMiddleware, updateFault);
app.put('/api/faults/:id/assign', authMiddleware, adminMiddleware, assignFault);
app.delete('/api/faults/:id', authMiddleware, adminMiddleware, deleteFault);

app.get('/api/schedules', authMiddleware, getAllSchedules);
app.get('/api/schedules/stats', authMiddleware, getScheduleStats);
app.get('/api/schedules/active', authMiddleware, getActiveSchedules);
app.get('/api/schedules/:id', authMiddleware, getScheduleById);
app.post('/api/schedules', authMiddleware, adminMiddleware, createSchedule);
app.put('/api/schedules/:id', authMiddleware, adminMiddleware, updateSchedule);
app.delete('/api/schedules/:id', authMiddleware, adminMiddleware, deleteSchedule);

app.get('/api/reports/overview', authMiddleware, (req, res) => {
  res.json({ success: true, data: { totalLicenses: 0, totalRequests: 0, totalUsers: 0 } });
});
app.get('/api/reports/licenses', authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});
app.get('/api/reports/requests', authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/api/notifications', authMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});
app.put('/api/notifications/:id/read', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Notification marked as read' });
});
app.put('/api/notifications/read-all', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'All notifications marked as read' });
});
app.delete('/api/notifications/:id', authMiddleware, (req, res) => {
  res.json({ success: true, message: 'Notification deleted' });
});

app.get('/api/audit-logs', authMiddleware, adminMiddleware, (req, res) => {
  res.json({ success: true, data: [] });
});

app.get('/', (req, res) => {
  res.send('ZESA Fault Reporting and Load Shedding Management API');
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', database: 'neon-postgres' });
});

initDb()
  .then(() => {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    const shutdown = () => {
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  })
  .catch(err => {
    console.error('Failed to initialize database:', err);
    process.exit(1);
  });
