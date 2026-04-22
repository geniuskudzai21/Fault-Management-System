"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const sqlite_1 = require("./db/sqlite");
const authController_1 = require("./controllers/authController");
const userController_1 = require("./controllers/userController");
const faultController_1 = require("./controllers/faultController");
const scheduleController_1 = require("./controllers/scheduleController");
const auth_1 = require("./middleware/auth");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3002;
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
// Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
// Auth
app.post('/api/auth/login', authController_1.login);
app.post('/api/auth/register', authController_1.register);
app.get('/api/auth/me', auth_1.authMiddleware, authController_1.getMe);
// Users
app.get('/api/users', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.getAllUsers);
app.get('/api/users/stats', auth_1.authMiddleware, userController_1.getStats);
app.get('/api/users/inspectors', auth_1.authMiddleware, userController_1.getInspectors);
app.post('/api/users', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.createUser);
app.put('/api/users/:id', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.updateUser);
app.put('/api/users/:id/status', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.updateUserStatus);
app.delete('/api/users/:id', auth_1.authMiddleware, auth_1.adminMiddleware, userController_1.deleteUser);
// Faults
app.get('/api/faults', auth_1.authMiddleware, faultController_1.getAllFaults);
app.get('/api/faults/stats', auth_1.authMiddleware, faultController_1.getFaultStats);
app.get('/api/faults/:id', auth_1.authMiddleware, faultController_1.getFaultById);
app.post('/api/faults', auth_1.authMiddleware, faultController_1.createFault);
app.put('/api/faults/:id', auth_1.authMiddleware, faultController_1.updateFault);
app.put('/api/faults/:id/assign', auth_1.authMiddleware, auth_1.adminMiddleware, faultController_1.assignFault);
// Load Shedding Schedules
app.get('/api/schedules', auth_1.authMiddleware, scheduleController_1.getAllSchedules);
app.get('/api/schedules/stats', auth_1.authMiddleware, scheduleController_1.getScheduleStats);
app.get('/api/schedules/active', auth_1.authMiddleware, scheduleController_1.getActiveSchedules);
app.get('/api/schedules/:id', auth_1.authMiddleware, scheduleController_1.getScheduleById);
app.post('/api/schedules', auth_1.authMiddleware, auth_1.adminMiddleware, scheduleController_1.createSchedule);
app.put('/api/schedules/:id', auth_1.authMiddleware, auth_1.adminMiddleware, scheduleController_1.updateSchedule);
app.delete('/api/schedules/:id', auth_1.authMiddleware, auth_1.adminMiddleware, scheduleController_1.deleteSchedule);
// Reports (stubs)
app.get('/api/reports/overview', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, data: { totalLicenses: 0, totalRequests: 0, totalUsers: 0 } });
});
app.get('/api/reports/licenses', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});
app.get('/api/reports/requests', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});
// Notifications (stubs)
app.get('/api/notifications', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});
app.put('/api/notifications/:id/read', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Notification marked as read' });
});
app.put('/api/notifications/read-all', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, message: 'All notifications marked as read' });
});
app.delete('/api/notifications/:id', auth_1.authMiddleware, (req, res) => {
    res.json({ success: true, message: 'Notification deleted' });
});
// Audit logs (stub)
app.get('/api/audit-logs', auth_1.authMiddleware, auth_1.adminMiddleware, (req, res) => {
    res.json({ success: true, data: [] });
});
// Home route
app.get('/', (req, res) => {
    res.send('ZESA Fault Reporting and Load Shedding Management API');
});
(0, sqlite_1.initDb)().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}).catch(err => {
    console.error('Failed to initialize database:', err);
});
