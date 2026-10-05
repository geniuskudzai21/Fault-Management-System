
import { Request, Response } from 'express';
import { getDb } from '../db/postgres';

const formatRequest = (req: any) => ({
  id: String(req.id),
  applicantId: String(req.applicant_id),
  applicantName: req.applicant_name,
  applicantEmail: req.applicant_email,
  department: req.department,
  address: req.address,
  licenseType: req.license_type,
  description: req.description,
  requestedDate: req.requested_date,
  status: req.status,
  assignedInspectorId: req.assigned_inspector_id ? String(req.assigned_inspector_id) : undefined,
  assignedInspectorName: req.inspector_name,
  adminNotes: req.admin_notes,
});

export const getAllRequests = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    const { status, department } = req.query;

    let query = `
      SELECT r.*, u.name as applicant_name, u.email as applicant_email, i.name as inspector_name
      FROM requests r
      JOIN users u ON r.applicant_id = u.id
      LEFT JOIN users i ON r.assigned_inspector_id = i.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (user.role === 'Applicant') {
      query += ' AND r.applicant_id = ?';
      params.push(user.id);
    } else if (user.role === 'Inspector') {
      query += ' AND r.assigned_inspector_id = ?';
      params.push(user.id);
    }

    if (status) {
      query += ' AND r.status = ?';
      params.push(status);
    }

    if (department) {
      query += ' AND r.department = ?';
      params.push(department);
    }

    query += ' ORDER BY r.requested_date DESC';

    const requests = await db.all(query, params);
    res.json({ success: true, data: requests.map(formatRequest) });
  } catch (error) {
    console.error('GetAllRequests error:', error);
    res.status(500).json({ success: false, error: 'Failed to retrieve requests' });
  }
};

export const getRequestStats = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    let whereClause = '';
    const params: any[] = [];

    if (user.role === 'Applicant') {
      whereClause = 'WHERE applicant_id = ?';
      params.push(user.id);
    } else if (user.role === 'Inspector') {
      whereClause = 'WHERE assigned_inspector_id = ?';
      params.push(user.id);
    }

    const total = await db.get(`SELECT COUNT(*)::int as count FROM requests ${whereClause}`, params);
    const pending = await db.get(`SELECT COUNT(*)::int as count FROM requests ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'Pending' ${whereClause ? '' : ''}`, params);
    const approved = await db.get(`SELECT COUNT(*)::int as count FROM requests ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'Approved' ${whereClause ? '' : ''}`, params);
    const rejected = await db.get(`SELECT COUNT(*)::int as count FROM requests ${whereClause ? whereClause + ' AND' : 'WHERE'} status = 'Rejected' ${whereClause ? '' : ''}`, params);

    const pendingCount = await db.get("SELECT COUNT(*)::int as count FROM requests WHERE status = 'Pending'");
    const approvedCount = await db.get("SELECT COUNT(*)::int as count FROM requests WHERE status = 'Approved'");
    const rejectedCount = await db.get("SELECT COUNT(*)::int as count FROM requests WHERE status = 'Rejected'");
    const assignedCount = await db.get("SELECT COUNT(*)::int as count FROM requests WHERE status = 'Assigned'");

    res.json({
      success: true,
      data: {
        total: total.count,
        pending: pendingCount.count,
        approved: approvedCount.count,
        rejected: rejectedCount.count,
        assigned: assignedCount.count,
      }
    });
  } catch (error) {
    console.error('GetRequestStats error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch statistics' });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const user = (req as any).user;
    const { department, address, licenseType, description, requestedDate } = req.body;

    if (!department || !address || !licenseType) {
      return res.status(400).json({ success: false, error: 'Department, address and license type are required' });
    }

    await db.run(
      'INSERT INTO requests (applicant_id, department, address, license_type, description, requested_date, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user.id, department, address, licenseType, description, requestedDate || new Date().toISOString(), 'Pending']
    );

    res.status(201).json({ success: true, message: 'Request created successfully' });
  } catch (error) {
    console.error('CreateRequest error:', error);
    res.status(500).json({ success: false, error: 'Failed to create request' });
  }
};

export const approveRequest = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    await db.run("UPDATE requests SET status = 'Approved' WHERE id = ?", [id]);
    res.json({ success: true, message: 'Request approved' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to approve request' });
  }
};

export const rejectRequest = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { reason } = req.body;
    await db.run('UPDATE requests SET status = ?, admin_notes = ? WHERE id = ?', ['Rejected', reason || '', id]);
    res.json({ success: true, message: 'Request rejected' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to reject request' });
  }
};

export const assignRequest = async (req: Request, res: Response) => {
  const db = getDb();
  if (!db) {
    return res.status(500).json({ success: false, error: 'Database not initialized' });
  }

  try {
    const { id } = req.params;
    const { inspectorId } = req.body;
    
    await db.run("UPDATE requests SET status = 'Assigned', assigned_inspector_id = ? WHERE id = ?", [inspectorId, id]);
    
    const request = await db.get('SELECT * FROM requests WHERE id = ?', [id]);
    if (request) {
      await db.run(
        'INSERT INTO licenses (applicant_id, inspector_id, status, address, license_type, description, department) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [request.applicant_id, inspectorId, 'Pending', request.address, request.license_type, request.description, request.department]
      );
    }
    
    res.json({ success: true, message: 'Request assigned to inspector and license created' });
  } catch (error) {
    console.error('Assign error:', error);
    res.status(500).json({ success: false, error: 'Failed to assign request' });
  }
};
