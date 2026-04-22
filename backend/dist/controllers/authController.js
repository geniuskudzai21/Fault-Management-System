"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.register = exports.login = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sqlite_1 = require("../db/sqlite");
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
// Helper to format user for frontend (id must be string, area must not be null)
const formatUser = (user) => ({
    id: String(user.id),
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.area || 'Avenues',
    status: user.status || 'active',
    area: user.area,
});
const login = async (req, res) => {
    const { email, password } = req.body;
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
        if (!user) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, error: 'Invalid email or password' });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            success: true,
            data: {
                token,
                user: formatUser(user),
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.login = login;
const register = async (req, res) => {
    const { name, email, password, role, area } = req.body;
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const existingUser = await db.get('SELECT email FROM users WHERE email = ?', [email]);
        if (existingUser) {
            return res.status(400).json({ success: false, error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const result = await db.run('INSERT INTO users (name, email, password, role, area) VALUES (?, ?, ?, ?, ?)', [name, email, hashedPassword, role, area || 'Avenues']);
        res.status(201).json({ success: true, message: 'User registered successfully' });
    }
    catch (error) {
        console.error('Register error:', error);
        res.status(500).json({ success: false, error: 'Failed to register user' });
    }
};
exports.register = register;
const getMe = async (req, res) => {
    const userId = req.user.id;
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const user = await db.get('SELECT id, name, email, role, area, status FROM users WHERE id = ?', [userId]);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        res.json({ success: true, data: formatUser(user) });
    }
    catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({ success: false, error: 'Internal server error' });
    }
};
exports.getMe = getMe;
