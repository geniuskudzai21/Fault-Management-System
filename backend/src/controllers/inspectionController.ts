
import { Request, Response } from 'express';
import { getDb } from '../db/sqlite';

const formatInspection = (insp: any) => ({
  id: String(insp.id),
  applicantId: String(insp.applicant_id),
  inspectorId: insp.inspector_id ? String(insp.inspector_id) : undefined,
  inspector: insp.inspector_name,
  status: insp.status,
  address: insp.address,
  requestType: insp.request_type,
  description: insp.description,
  department: insp.department,
  date: insp.inspection_date,
});

export const getAllInspections = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    let query = `
      SELECT i.*, u.name as inspector_name 
      FROM inspections i
      LEFT JOIN users u ON i.inspector_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.role === 'Inspector') {
      query += ' AND i.inspector_id = ?';
      params.push(user.id);
    } else if (user.role === 'Applicant') {
      query += ' AND i.applicant_id = ?';
      params.push(user.id);
    }

    const { status } = req.query;
    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }

    query += ' ORDER BY i.inspection_date DESC';

    const inspections = await db.all(query, params);
    res.json({ success: true, data: inspections.map(formatInspection) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inspections' });
  }
};

export const getInspectionStats = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const total = await db.get('SELECT COUNT(*) as count FROM inspections');
    const pending = await db.get("SELECT COUNT(*) as count FROM inspections WHERE status = 'Pending'");
    const completed = await db.get("SELECT COUNT(*) as count FROM inspections WHERE status = 'Completed'");
    const followUp = await db.get("SELECT COUNT(*) as count FROM inspections WHERE status = 'FollowUpRequired'");

    res.json({
      success: true,
      data: {
        total: total.count,
        pending: pending.count,
        completed: completed.count,
        followUp: followUp.count,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inspection stats' });
  }
};

export const getInspectionById = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const inspection = await db.get('SELECT * FROM inspections WHERE id = ?', [id]);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }
    res.json({ success: true, data: formatInspection(inspection) });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch inspection' });
  }
};

export const createInspection = async (req: Request, res: Response) => {
  const { applicantId, inspectorId, status, address, requestType, description, department, details } = req.body;
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    console.log('Create inspection - User:', user);
    console.log('Create inspection - Body:', req.body);
    
    // Authorization checks
    if (user.role === 'Inspector') {
      // Inspectors can only create inspections for themselves
      if (inspectorId && String(inspectorId) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    } else if (user.role === 'Applicant') {
      // Applicants cannot create inspections
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    // Admins can create inspections for anyone

    const finalInspectorId = inspectorId || user.id;
    const finalStatus = status || 'Pending';
    
    console.log('Creating inspection with:', {
      applicantId,
      inspectorId: finalInspectorId,
      status: finalStatus,
      address,
      requestType,
      description,
      department
    });

    await db.run(
      'INSERT INTO inspections (applicant_id, inspector_id, status, address, request_type, description, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [applicantId, finalInspectorId, finalStatus, address, requestType, description, department]
    );
    res.status(201).json({ success: true, message: 'Inspection created successfully' });
  } catch (error) {
    console.error('Create inspection error:', error);
    res.status(500).json({ success: false, error: 'Failed to create inspection' });
  }
};

export const updateInspection = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { status, inspectionDate } = req.body;
    
    // First get the inspection to check ownership
    const inspection = await db.get('SELECT * FROM inspections WHERE id = ?', [id]);
    if (!inspection) {
      return res.status(404).json({ success: false, error: 'Inspection not found' });
    }

    const user = (req as any).user;
    
    // Authorization checks
    if (user.role === 'Inspector') {
      // Inspectors can only update their own inspections
      if (String(inspection.inspector_id) !== String(user.id)) {
        return res.status(403).json({ success: false, error: 'Access denied' });
      }
    } else if (user.role === 'Applicant') {
      // Applicants cannot update inspections
      return res.status(403).json({ success: false, error: 'Access denied' });
    }
    // Admins can update any inspection
    
    const updates: string[] = [];
    const params: any[] = [];

    if (status) {
      updates.push('status = ?');
      params.push(status);
    }
    if (inspectionDate) {
      updates.push('inspection_date = ?');
      params.push(inspectionDate);
    }

    if (updates.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    params.push(id);
    await db.run(`UPDATE inspections SET ${updates.join(', ')} WHERE id = ?`, params);
    
    res.json({ success: true, message: 'Inspection updated successfully' });
  } catch (error) {
    console.error('Update inspection error:', error);
    res.status(500).json({ success: false, error: 'Failed to update inspection' });
  }
};
