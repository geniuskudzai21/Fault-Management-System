import { Request, Response } from 'express';
import { getDb } from '../db/sqlite';

const formatSchedule = (schedule: any) => ({
  id: String(schedule.id),
  area: schedule.area,
  startTime: schedule.start_time,
  endTime: schedule.end_time,
  date: schedule.date,
  status: schedule.status,
  reason: schedule.reason,
  affectedCustomers: schedule.affected_customers,
  alternativeSupply: Boolean(schedule.alternative_supply),
  notes: schedule.notes,
  createdAt: schedule.created_at,
  updatedAt: schedule.updated_at,
});

export const getAllSchedules = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    let query = 'SELECT * FROM load_shedding_schedules WHERE 1=1';
    const params: any[] = [];

    const { status, area, date } = req.query;
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    if (area) {
      query += ' AND area = ?';
      params.push(area);
    }
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }

    query += ' ORDER BY date, start_time';

    const schedules = await db.all(query, params);
    res.json({ success: true, data: schedules.map(formatSchedule) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch schedules' });
  }
};

export const getScheduleStats = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const total = await db.get('SELECT COUNT(*) as count FROM load_shedding_schedules');
    const scheduled = await db.get("SELECT COUNT(*) as count FROM load_shedding_schedules WHERE status = 'Scheduled'");
    const active = await db.get("SELECT COUNT(*) as count FROM load_shedding_schedules WHERE status = 'Active'");
    const completed = await db.get("SELECT COUNT(*) as count FROM load_shedding_schedules WHERE status = 'Completed'");
    const cancelled = await db.get("SELECT COUNT(*) as count FROM load_shedding_schedules WHERE status = 'Cancelled'");

    res.json({
      success: true,
      data: {
        total: total.count,
        scheduled: scheduled.count,
        active: active.count,
        completed: completed.count,
        cancelled: cancelled.count,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch schedule stats' });
  }
};

export const getScheduleById = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const schedule = await db.get('SELECT * FROM load_shedding_schedules WHERE id = ?', [id]);
    
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }
    res.json({ success: true, data: formatSchedule(schedule) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch schedule' });
  }
};

export const createSchedule = async (req: Request, res: Response) => {
  const { area, startTime, endTime, date, status, reason, affectedCustomers, alternativeSupply, notes } = req.body;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    
    // Only admins can create schedules
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const finalStatus = status || 'Scheduled';

    await db.run(
      'INSERT INTO load_shedding_schedules (area, start_time, end_time, date, status, reason, affected_customers, alternative_supply, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [area, startTime, endTime, date, finalStatus, reason, affectedCustomers, alternativeSupply ? 1 : 0, notes, new Date().toISOString()]
    );
    res.status(201).json({ success: true, message: 'Schedule created successfully' });
  } catch (error) {
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to create schedule' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { status, startTime, endTime, reason, affectedCustomers, alternativeSupply, notes } = req.body;
    
    // First get the schedule to check ownership
    const schedule = await db.get('SELECT * FROM load_shedding_schedules WHERE id = ?', [id]);
    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    const user = (req as any).user;
    
    // Only admins can update schedules
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    
    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (startTime) {
      updates.push('start_time = ?');
      params.push(startTime);
    }
    if (endTime) {
      updates.push('end_time = ?');
      params.push(endTime);
    }
    if (reason) {
      updates.push('reason = ?');
      params.push(reason);
    }
    if (affectedCustomers !== undefined) {
      updates.push('affected_customers = ?');
      params.push(affectedCustomers);
    }
    if (alternativeSupply !== undefined) {
      updates.push('alternative_supply = ?');
      params.push(alternativeSupply ? 1 : 0);
    }
    if (notes !== undefined) {
      updates.push('notes = ?');
      params.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());

    params.push(id);
    await db.run(`UPDATE load_shedding_schedules SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json({ success: true, message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Update schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to update schedule' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    
    const user = (req as any).user;
    
    // Only admins can delete schedules
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await db.run('DELETE FROM load_shedding_schedules WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Schedule deleted successfully' });
  } catch (error) {
    console.error('Delete schedule error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete schedule' });
  }
};

export const getActiveSchedules = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const now = new Date().toISOString();
    const schedules = await db.all(`
      SELECT * FROM load_shedding_schedules 
      WHERE status = 'Active' 
      OR (status = 'Scheduled' AND date <= ?)
      ORDER BY date, start_time
    `, [now]);

    res.json({ success: true, data: schedules.map(formatSchedule) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch active schedules' });
  }
};
