
import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

let db: Database;

export const initDb = async () => {
  db = await open({
    filename: path.join(__dirname, '../../database.sqlite'),
    driver: sqlite3.Database
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
      gps_location TEXT,
      photos TEXT,
      signature TEXT,
      resolution_data TEXT,
      customer_feedback TEXT,
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
      gps_location TEXT,
      photos TEXT,
      FOREIGN KEY(customer_id) REFERENCES users(id),
      FOREIGN KEY(assigned_technician_id) REFERENCES users(id)
    );

    `);

  const bcrypt = await import('bcryptjs');
  const admin = await db.get("SELECT * FROM users WHERE email = ?", ['admin@zesa.co.zw']);
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await db.run(
      'INSERT INTO users (name, email, password, role, area, status) VALUES (?, ?, ?, ?, ?, ?)',
      ['System Admin', 'admin@zesa.co.zw', hashedPassword, 'Admin', 'Avenues', 'active']
    );
    console.log('Default admin user created: admin@zesa.co.zw / admin123');
  }

  
  return db;
};

export const getDb = () => db;
