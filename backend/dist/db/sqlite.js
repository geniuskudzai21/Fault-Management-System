"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDb = exports.initDb = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const sqlite_1 = require("sqlite");
const path_1 = __importDefault(require("path"));
let db;
const initDb = async () => {
    db = await (0, sqlite_1.open)({
        filename: path_1.default.join(__dirname, '../../database.sqlite'),
        driver: sqlite3_1.default.Database
    });
    await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'active',
      area TEXT DEFAULT 'Avenues',
      phone TEXT,
      address TEXT,
      employee_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS faults (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      technician_id INTEGER,
      status TEXT NOT NULL DEFAULT 'Reported',
      address TEXT NOT NULL,
      category TEXT NOT NULL,
      priority TEXT NOT NULL DEFAULT 'Medium',
      description TEXT,
      area TEXT,
      reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      assigned_date DATETIME,
      resolved_date DATETIME,
      fault_number TEXT UNIQUE,
      gps_location TEXT, -- JSON string {lat, lon}
      photos TEXT, -- JSON array of photo URLs
      signature TEXT, -- JSON string {name, timestamp}
      resolution_data TEXT, -- JSON string with resolution steps
      customer_feedback TEXT, -- JSON string with rating and comment
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(technician_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS load_shedding_schedules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      area TEXT NOT NULL,
      start_time TEXT NOT NULL,
      end_time TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Scheduled',
      reason TEXT,
      affected_customers INTEGER DEFAULT 0,
      alternative_supply INTEGER DEFAULT 0,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME
    );

    CREATE TABLE IF NOT EXISTS fault_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      customer_name TEXT,
      customer_email TEXT,
      customer_phone TEXT,
      area TEXT,
      address TEXT,
      category TEXT,
      priority TEXT,
      description TEXT,
      reported_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'Reported',
      assigned_technician_id INTEGER,
      assigned_technician_name TEXT,
      admin_notes TEXT,
      estimated_resolution_time TEXT,
      actual_resolution_time TEXT,
      gps_location TEXT, -- JSON string {lat, lon}
      photos TEXT, -- JSON array of photo URLs
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(assigned_technician_id) REFERENCES users(id)
    );

    `);
    // Seed sample users if not exists
    const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
    // Admin user
    const admin = await db.get("SELECT * FROM users WHERE email = ?", ['admin@zesa.co.zw']);
    if (!admin) {
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await db.run('INSERT INTO users (name, email, password, role, area, status) VALUES (?, ?, ?, ?, ?, ?)', ['System Admin', 'admin@zesa.co.zw', hashedPassword, 'Admin', 'Avenues', 'active']);
        console.log('Default admin user created: admin@zesa.co.zw / admin123');
    }
    // Technician user
    const technician = await db.get("SELECT * FROM users WHERE email = ?", ['tech@zesa.co.zw']);
    if (!technician) {
        const hashedPassword = await bcrypt.hash('tech123', 10);
        await db.run('INSERT INTO users (name, email, password, role, area, status, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?)', ['John Technician', 'tech@zesa.co.zw', hashedPassword, 'Technician', 'Avenues', 'active', 'TECH001']);
        console.log('Default technician user created: tech@zesa.co.zw / tech123');
    }
    // Customer user
    const customer = await db.get("SELECT * FROM users WHERE email = ?", ['customer@gmail.com']);
    if (!customer) {
        const hashedPassword = await bcrypt.hash('customer123', 10);
        await db.run('INSERT INTO users (name, email, password, role, area, status, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', ['Jane Customer', 'customer@gmail.com', hashedPassword, 'Customer', 'Avenues', 'active', '+263 77 123 4567', '123 Samora Machel Ave, Harare']);
        console.log('Default customer user created: customer@gmail.com / customer123');
    }
    return db;
};
exports.initDb = initDb;
const getDb = () => db;
exports.getDb = getDb;
