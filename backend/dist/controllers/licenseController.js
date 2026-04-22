"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLicense = exports.createLicense = exports.getLicenseById = exports.getLicenseStats = exports.getAllLicenses = void 0;
const sqlite_1 = require("../db/sqlite");
const formatLicense = (license) => ({
    id: String(license.id),
    applicantId: String(license.applicant_id),
    inspectorId: license.inspector_id ? String(license.inspector_id) : undefined,
    inspector: license.inspector_name,
    status: license.status,
    address: license.address,
    licenseType: license.license_type,
    description: license.description,
    department: license.department,
    requestedDate: license.requested_date,
    issuedDate: license.issued_date,
    expiryDate: license.expiry_date,
    licenseNumber: license.license_number,
});
const getAllLicenses = async (req, res) => {
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const user = req.user;
        let query = `
      SELECT l.*, u.name as inspector_name 
      FROM licenses l
      LEFT JOIN users u ON l.inspector_id = u.id
      WHERE 1=1
    `;
        const params = [];
        if (user.role === 'Inspector') {
            query += ' AND l.inspector_id = ?';
            params.push(user.id);
        }
        else if (user.role === 'Applicant') {
            query += ' AND l.applicant_id = ?';
            params.push(user.id);
        }
        const { status } = req.query;
        if (status) {
            query += ' AND l.status = ?';
            params.push(status);
        }
        query += ' ORDER BY l.requested_date DESC';
        const licenses = await db.all(query, params);
        res.json({ success: true, data: licenses.map(formatLicense) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch licenses' });
    }
};
exports.getAllLicenses = getAllLicenses;
const getLicenseStats = async (req, res) => {
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const total = await db.get('SELECT COUNT(*) as count FROM licenses');
        const pending = await db.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'Pending'");
        const issued = await db.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'Issued'");
        const expired = await db.get("SELECT COUNT(*) as count FROM licenses WHERE status = 'Expired'");
        res.json({
            success: true,
            data: {
                total: total.count,
                pending: pending.count,
                issued: issued.count,
                expired: expired.count,
            }
        });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch license stats' });
    }
};
exports.getLicenseStats = getLicenseStats;
const getLicenseById = async (req, res) => {
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const { id } = req.params;
        const license = await db.get('SELECT * FROM licenses WHERE id = ?', [id]);
        if (!license) {
            return res.status(404).json({ success: false, error: 'License not found' });
        }
        res.json({ success: true, data: formatLicense(license) });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Failed to fetch license' });
    }
};
exports.getLicenseById = getLicenseById;
const createLicense = async (req, res) => {
    const { applicantId, inspectorId, status, address, licenseType, description, department, issuedDate, expiryDate, licenseNumber } = req.body;
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const user = req.user;
        console.log('Create license - User:', user);
        console.log('Create license - Body:', req.body);
        // Authorization checks
        if (user.role === 'Inspector') {
            // Inspectors can only create licenses for themselves
            if (inspectorId && String(inspectorId) !== String(user.id)) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
        }
        else if (user.role === 'Applicant') {
            // Applicants cannot create licenses
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        // Admins can create licenses for anyone
        const finalInspectorId = inspectorId || user.id;
        const finalStatus = status || 'Pending';
        console.log('Creating license with:', {
            applicantId,
            inspectorId: finalInspectorId,
            status: finalStatus,
            address,
            licenseType,
            description,
            department,
            issuedDate,
            expiryDate,
            licenseNumber
        });
        await db.run('INSERT INTO licenses (applicant_id, inspector_id, status, address, license_type, description, department, issued_date, expiry_date, license_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [applicantId, finalInspectorId, finalStatus, address, licenseType, description, department, issuedDate, expiryDate, licenseNumber]);
        res.status(201).json({ success: true, message: 'License created successfully' });
    }
    catch (error) {
        console.error('Create license error:', error);
        res.status(500).json({ success: false, error: 'Failed to create license' });
    }
};
exports.createLicense = createLicense;
const updateLicense = async (req, res) => {
    const db = (0, sqlite_1.getDb)();
    if (!db) {
        return res.status(500).json({ success: false, error: 'Database not initialized' });
    }
    try {
        const { id } = req.params;
        const { status, issuedDate, expiryDate, licenseNumber } = req.body;
        // First get the license to check ownership
        const license = await db.get('SELECT * FROM licenses WHERE id = ?', [id]);
        if (!license) {
            return res.status(404).json({ success: false, error: 'License not found' });
        }
        const user = req.user;
        // Authorization checks
        if (user.role === 'Inspector') {
            // Inspectors can only update their own licenses
            if (String(license.inspector_id) !== String(user.id)) {
                return res.status(403).json({ success: false, error: 'Access denied' });
            }
        }
        else if (user.role === 'Applicant') {
            // Applicants cannot update licenses
            return res.status(403).json({ success: false, error: 'Access denied' });
        }
        // Admins can update any license
        const updates = [];
        const params = [];
        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (issuedDate) {
            updates.push('issued_date = ?');
            params.push(issuedDate);
        }
        if (expiryDate) {
            updates.push('expiry_date = ?');
            params.push(expiryDate);
        }
        if (licenseNumber) {
            updates.push('license_number = ?');
            params.push(licenseNumber);
        }
        if (updates.length === 0) {
            return res.status(400).json({ success: false, error: 'No fields to update' });
        }
        params.push(id);
        await db.run(`UPDATE licenses SET ${updates.join(', ')} WHERE id = ?`, params);
        res.json({ success: true, message: 'License updated successfully' });
    }
    catch (error) {
        console.error('Update license error:', error);
        res.status(500).json({ success: false, error: 'Failed to update license' });
    }
};
exports.updateLicense = updateLicense;
