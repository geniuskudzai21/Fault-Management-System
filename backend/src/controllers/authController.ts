
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDb } from '../db/sqlite';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const formatUser = (user: any) => ({
  id: String(user.id),
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.area || 'Avenues',
  status: user.status || 'active',
  area: user.area,
});

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: formatUser(user),
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role, area } = req.body;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const existingUser = await db.get('SELECT email FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run(
      'INSERT INTO users (name, email, password, role, area) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, area || 'Avenues']
    );

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, error: 'Failed to register user' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  const userId = (req as any).user.id;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = await db.get('SELECT id, name, email, role, area, status FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({ success: true, data: formatUser(user) });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};
