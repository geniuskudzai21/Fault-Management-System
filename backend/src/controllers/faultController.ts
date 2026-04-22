import { Request, Response } from 'express';
import { getDb } from '../db/sqlite';

const formatFault = (fault: any) => ({
  id: String(fault.id),
  customerId: String(fault.customer_id),
  technicianId: fault.technician_id ? String(fault.technician_id) : undefined,
  technician: fault.technician_name,
  status: fault.status,
  address: fault.address,
  category: fault.category,
  priority: fault.priority,
  description: fault.description,
  area: fault.area,
  reportedDate: fault.reported_date,
  assignedDate: fault.assigned_date,
  resolvedDate: fault.resolved_date,
  faultNumber: fault.fault_number,
});

export const getAllFaults = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    let query = `
      SELECT f.*, u.name as technician_name 
      FROM faults f
      LEFT JOIN users u ON f.technician_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.role === 'Technician') {
      query += ' AND f.technician_id = ?';
      params.push(user.id);
    } else if (user.role === 'Customer') {
      query += ' AND f.customer_id = ?';
      params.push(user.id);
    }

    const { status, category, priority } = req.query;
    if (status) {
      query += ' AND f.status = ?';
      params.push(status);
    }
    if (category) {
      query += ' AND f.category = ?';
      params.push(category);
    }
    if (priority) {
      query += ' AND f.priority = ?';
      params.push(priority);
    }

    query += ' ORDER BY f.reported_date DESC';

    const faults = await db.all(query, params);
    res.json({ success: true, data: faults.map(formatFault) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch faults' });
  }
};

export const getFaultStats = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const total = await db.get('SELECT COUNT(*) as count FROM faults');
    const reported = await db.get("SELECT COUNT(*) as count FROM faults WHERE status = 'Reported'");
    const assigned = await db.get("SELECT COUNT(*) as count FROM faults WHERE status = 'Assigned'");
    const inProgress = await db.get("SELECT COUNT(*) as count FROM faults WHERE status = 'InProgress'");
    const resolved = await db.get("SELECT COUNT(*) as count FROM faults WHERE status = 'Resolved'");

    res.json({
      success: true,
      data: {
        total: total.count,
        reported: reported.count,
        assigned: assigned.count,
        inProgress: inProgress.count,
        resolved: resolved.count,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch fault stats' });
  }
};

export const getFaultById = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const fault = await db.get(`
      SELECT f.*, u.name as technician_name 
      FROM faults f
      LEFT JOIN users u ON f.technician_id = u.id
      WHERE f.id = ?
    `, [id]);
    
    if (!fault) {
      return res.status(404).json({ success: false, error: 'Fault not found' });
    }
    res.json({ success: true, data: formatFault(fault) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch fault' });
  }
};

export const createFault = async (req: Request, res: Response) => {
  const { customerId, technicianId, status, address, category, priority, description, area } = req.body;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    
    // Authorization checks
    if (user.role === 'Technician') {
      // Technicians can only create faults for themselves
      if (technicianId && String(technicianId) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    } else if (user.role === 'Customer') {
      // Customers can only create faults for themselves
      if (customerId && String(customerId) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }
    // Admins can create faults for anyone

    const finalTechnicianId = technicianId || null;
    const finalStatus = status || 'Reported';
    const finalCustomerId = customerId || user.id;
    
    // Generate fault number
    const faultNumber = `FLT-${Date.now()}`;

    await db.run(
      'INSERT INTO faults (customer_id, technician_id, status, address, category, priority, description, area, reported_date, fault_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [finalCustomerId, finalTechnicianId, finalStatus, address, category, priority, description, area, new Date().toISOString(), faultNumber]
    );
    res.status(201).json({ success: true, message: 'Fault created successfully' });
  } catch (error) {
    console.error('Create fault error:', error);
    res.status(500).json({ success: false, error: 'Failed to create fault' });
  }
};

export const updateFault = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { status, technicianId, assignedDate, resolvedDate } = req.body;
    
    // First get the fault to check ownership
    const fault = await db.get('SELECT * FROM faults WHERE id = ?', [id]);
    if (!fault) {
      return res.status(404).json({ success: false, error: 'Fault not found' });
    }

    const user = (req as any).user;
    
    // Authorization checks
    if (user.role === 'Technician') {
      // Technicians can only update their own faults
      if (String(fault.technician_id) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    } else if (user.role === 'Customer') {
      // Customers can only update their own faults
      if (String(fault.customer_id) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    }
    // Admins can update any fault
    
    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
      
      // Auto-set dates based on status
      if (status === 'Assigned' && !assignedDate) {
        updates.push('assigned_date = ?');
        params.push(new Date().toISOString());
      } else if (status === 'Resolved' && !resolvedDate) {
        updates.push('resolved_date = ?');
        params.push(new Date().toISOString());
      }
    }
    
    if (technicianId) {
      updates.push('technician_id = ?');
      params.push(technicianId);
    }
    
    if (assignedDate) {
      updates.push('assigned_date = ?');
      params.push(assignedDate);
    }
    
    if (resolvedDate) {
      updates.push('resolved_date = ?');
      params.push(resolvedDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(id);
    await db.run(`UPDATE faults SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json({ success: true, message: 'Fault updated successfully' });
  } catch (error) {
    console.error('Update fault error:', error);
    res.status(500).json({ success: false, error: 'Failed to update fault' });
  }
};

export const assignFault = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { technicianId } = req.body;
    
    const user = (req as any).user;
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only admins can assign faults' });
    }

    await db.run(
      'UPDATE faults SET technician_id = ?, status = ?, assigned_date = ? WHERE id = ?',
      [technicianId, 'Assigned', new Date().toISOString(), id]
    );
    
    res.json({ success: true, message: 'Fault assigned successfully' });
  } catch (error) {
    console.error('Assign fault error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign fault' });
  }
};

export const deleteFault = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    
    const user = (req as any).user;
    if (user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Only admins can delete faults' });
    }

    await db.run('DELETE FROM faults WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Fault deleted successfully' });
  } catch (error) {
    console.error('Delete fault error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete fault' });
  }
};
