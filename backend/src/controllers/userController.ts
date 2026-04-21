
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db/sqlite';

// Helper to format user for frontend
const formatUser = (user: any) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.area || 'Avenues',
  status: user.status || 'active',
  created_at: user.created_at,
  area: user.area,
  phone: user.phone,
  address: user.address,
  employee_id: user.employee_id,
});

export const getAllUsers = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const users = await db.all('SELECT id, name, email, role, area, status, created_at, phone, address, employee_id FROM users');
    const formatted = users.map(formatUser);
    res.json({ success: true, data: formatted });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve users' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const activeUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE status = 'active'");
    const inactiveUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE status = 'inactive'");
    const pendingUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE status = 'pending'");
    const adminCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'Admin'");
    const technicianCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'Technician'");
    const customerCount = await db.get("SELECT COUNT(*) as count FROM users WHERE role = 'Customer'");

    res.json({
      success: true,
      data: {
        total: totalUsers.count,
        active: activeUsers.count,
        inactive: inactiveUsers.count,
        pending: pendingUsers.count,
        external: 0,
        internal: totalUsers.count,
        admin: adminCount.count,
        inspector: technicianCount.count,
        applicant: customerCount.count,
      }
    });
  } catch (error) {
    console.error('GetStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};

export const getInspectors = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { area } = req.query;
    let query = "SELECT id, name, email, role, area, status, created_at, phone, address, employee_id FROM users WHERE role = 'Technician'";
    const params: any[] = [];
    if (area) {
      query += ' AND area = ?';
      params.push(area);
    }
    const inspectors = await db.all(query, params);
    res.json({ success: true, data: inspectors.map(formatUser) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch technicians' });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { name, email, password, role, area, phone, address, employee_id } = req.body;
    const existingUser = await db.get('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password || 'password123', 10);
    await db.run(
      'INSERT INTO users (name, email, password, role, area, phone, address, employee_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, area || 'Avenues', phone, address, employee_id]
    );
    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('CreateUser error:', error);
    res.status(500).json({ success: false, error: 'Failed to create user' });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { name, email, role, area, status, phone, address, employee_id } = req.body;
    await db.run(
      'UPDATE users SET name = ?, email = ?, role = ?, area = ?, status = ?, phone = ?, address = ?, employee_id = ? WHERE id = ?',
      [name, email, role, area, status, phone, address, employee_id, id]
    );
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
};

export const updateUserStatus = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { status } = req.body;
    await db.run('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: 'User status updated' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update user status' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    await db.run('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
};
