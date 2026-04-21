import React, { useState, useEffect } from 'react';
import { License, HealthData, EngineeringData, HealthChecklistItem, EngineeringProgressItem } from '../types';
import { Department, LicenseStatus, ComplianceRating, EngineeringPhase } from '../constants';
import Button from './common/Button';
import HealthChecklist from './health/HealthChecklist';
import EngineeringProgress from './engineering/EngineeringProgress';
import { CameraIcon, LocationIcon, SignatureIcon, ArrowLeftIcon, CheckCircleIcon, CalendarIcon, ExclamationCircleIcon } from './icons';

interface LicenseFormProps {
  license: License;
  onBack: () => void;
  onSave: (license: License) => void;
}

const LicenseForm: React.FC<LicenseFormProps> = ({ license, onBack, onSave }) => {
  const [currentLicense, setCurrentLicense] = useState<License>(license);
  const [location, setLocation] = useState<string>('Fetching location...');
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [licenseNumber, setLicenseNumber] = useState<string>(license.licenseNumber || '');
  const [expiryDate, setExpiryDate] = useState<string>(license.expiryDate || '');

  // Initialize checklist data if not present
  useEffect(() => {
    if (!currentLicense.details) {
      let defaultDetails: HealthData | EngineeringData;
      
      if (currentLicense.department === Department.Health) {
        defaultDetails = {
          establishmentType: 'Restaurant',
          checklists: [
            { id: 'h1', text: 'Food Storage Temperature Control', rating: ComplianceRating.NotApplicable, comment: '' },
            { id: 'h2', text: 'Kitchen Hygiene and Sanitation', rating: ComplianceRating.NotApplicable, comment: '' },
            { id: 'h3', text: 'Staff Personal Hygiene', rating: ComplianceRating.NotApplicable, comment: '' },
            { id: 'h4', text: 'Pest Control Measures', rating: ComplianceRating.NotApplicable, comment: '' },
            { id: 'h5', text: 'Waste Management', rating: ComplianceRating.NotApplicable, comment: '' },
            { id: 'h6', text: 'Food Handling Practices', rating: ComplianceRating.NotApplicable, comment: '' },
          ],
          overallCompliance: ComplianceRating.NotApplicable
        };
      } else {
        defaultDetails = {
          siteName: 'Construction Site',
          progressItems: [
            { phase: EngineeringPhase.Foundation, progress: 0, materialsVerified: false, workmanship: 'Fair', comment: '' },
            { phase: EngineeringPhase.Structural, progress: 0, materialsVerified: false, workmanship: 'Fair', comment: '' },
            { phase: EngineeringPhase.Roof, progress: 0, materialsVerified: false, workmanship: 'Fair', comment: '' },
            { phase: EngineeringPhase.Finishing, progress: 0, materialsVerified: false, workmanship: 'Fair', comment: '' },
          ],
          safetyAssessment: 'Pass'
        };
      }
      
      setCurrentLicense(prev => ({ ...prev, details: defaultDetails }));
    }
  }, [currentLicense.department, currentLicense.details]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(`${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`);
          setCurrentLicense(prev => ({
            ...prev,
            gpsLocation: { lat: position.coords.latitude, lon: position.coords.longitude }
          }));
        },
        (error) => {
          setLocation('Location access denied');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  }, []);

  const handlePhotoCapture = () => {
    // Simulate photo capture
    const newPhoto = `data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=`;
    setPhotos(prev => [...prev, newPhoto]);
  };

  const handleSignature = () => {
    const name = prompt('Please enter your name for signature:');
    if (name) {
      setSignature(name);
      setCurrentLicense(prev => ({
        ...prev,
        signature: { name, timestamp: new Date().toISOString() }
      }));
    }
  };

  const validateAndSave = () => {
    const newErrors: string[] = [];
    
    if (currentLicense.status === LicenseStatus.Issued && !licenseNumber) {
      newErrors.push('License number is required when issuing a license');
    }
    
    if (currentLicense.status === LicenseStatus.Issued && !expiryDate) {
      newErrors.push('Expiry date is required when issuing a license');
    }

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);
    setSaving(true);
    
    const updatedLicense = {
      ...currentLicense,
      licenseNumber,
      expiryDate,
      issuedDate: currentLicense.status === LicenseStatus.Issued ? new Date().toISOString() : currentLicense.issuedDate,
      photos,
      signature: signature ? { name: signature, timestamp: new Date().toISOString() } : currentLicense.signature
    };

    onSave(updatedLicense);
    setSaving(false);
  };

  const getStatusColor = (status: LicenseStatus) => {
    switch (status) {
      case LicenseStatus.Pending: return 'text-amber-400';
      case LicenseStatus.InProgress: return 'text-blue-400';
      case LicenseStatus.Issued: return 'text-green-400';
      case LicenseStatus.Expired: return 'text-red-400';
      case LicenseStatus.Rejected: return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-cyan-100">License Details</h1>
          </div>
          <div className={`px-3 py-1 rounded-full border ${getStatusColor(currentLicense.status)} border-current/20`}>
            {currentLicense.status}
          </div>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/40 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <ExclamationCircleIcon className="w-4 h-4" />
              <span className="font-medium">Please fix the following errors:</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-red-300">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-6">
          {/* License Information */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">License Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">License Type</label>
                <p className="text-cyan-100">{currentLicense.licenseType}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Department</label>
                <p className="text-cyan-100">{currentLicense.department}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Address</label>
                <p className="text-cyan-100">{currentLicense.address}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Location</label>
                <p className="text-cyan-100 font-mono text-sm">{location}</p>
              </div>
            </div>
          </div>

          {/* License Number and Expiry */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">License Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">License Number</label>
                <input
                  type="text"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500"
                  placeholder="Enter license number"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-dark-300 mb-1">Expiry Date</label>
                <input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded-lg text-cyan-100 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Checklist/Progress */}
          {currentLicense.details && (
            <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-cyan-100 mb-4">
                {currentLicense.department === Department.Health ? 'Health Inspection Checklist' : 'Engineering Progress'}
              </h2>
              {currentLicense.department === Department.Health ? (
                <HealthChecklist
                  data={currentLicense.details as HealthData}
                  onChange={(data) => setCurrentLicense(prev => ({ ...prev, details: data }))}
                />
              ) : (
                <EngineeringProgress
                  data={currentLicense.details as EngineeringData}
                  onChange={(data) => setCurrentLicense(prev => ({ ...prev, details: data }))}
                />
              )}
            </div>
          )}

          {/* Photos */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">Photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative group">
                  <img src={photo} alt={`License photo ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                </div>
              ))}
              <button
                onClick={handlePhotoCapture}
                className="w-full h-32 border-2 border-dashed border-dark-600 rounded-lg flex flex-col items-center justify-center hover:border-cyan-500 transition-colors"
              >
                <CameraIcon className="w-6 h-6 text-dark-400 mb-2" />
                <span className="text-sm text-dark-400">Add Photo</span>
              </button>
            </div>
          </div>

          {/* Signature */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4">Signature</h2>
            {signature ? (
              <div className="flex items-center justify-between p-3 bg-dark-700 rounded-lg">
                <div>
                  <p className="text-cyan-100 font-medium">{signature}</p>
                  <p className="text-dark-400 text-sm">Signed electronically</p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignature}>
                  Change
                </Button>
              </div>
            ) : (
              <button
                onClick={handleSignature}
                className="w-full p-4 border-2 border-dashed border-dark-600 rounded-lg flex flex-col items-center justify-center hover:border-cyan-500 transition-colors"
              >
                <SignatureIcon className="w-6 h-6 text-dark-400 mb-2" />
                <span className="text-sm text-dark-400">Add Signature</span>
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={onBack}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={validateAndSave}
              disabled={saving}
              loading={saving}
            >
              {saving ? 'Saving...' : 'Save License'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseForm;
