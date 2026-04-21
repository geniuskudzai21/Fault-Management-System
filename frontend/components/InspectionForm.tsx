
import React, { useState, useEffect } from 'react';
import { Inspection, HealthData, EngineeringData, HealthChecklistItem, EngineeringProgressItem } from '../types';
import { Department, InspectionStatus, ComplianceRating, EngineeringPhase } from '../constants';
import Button from './common/Button';
import HealthChecklist from './health/HealthChecklist';
import EngineeringProgress from './engineering/EngineeringProgress';
import { CameraIcon, LocationIcon, SignatureIcon, ArrowLeftIcon, CheckCircleIcon, CalendarIcon, ExclamationCircleIcon } from './icons';

interface InspectionFormProps {
  inspection: Inspection;
  onBack: () => void;
  onSave: (inspection: Inspection) => void;
}

const InspectionForm: React.FC<InspectionFormProps> = ({ inspection, onBack, onSave }) => {
  const [currentInspection, setCurrentInspection] = useState<Inspection>(inspection);
  const [location, setLocation] = useState<string>('Fetching location...');
  const [saving, setSaving] = useState(false);
  const [signature, setSignature] = useState<string>('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  // Initialize checklist data if not present
  useEffect(() => {
    if (!currentInspection.details) {
      let defaultDetails: HealthData | EngineeringData;
      
      if (currentInspection.department === Department.Health) {
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
      
      setCurrentInspection(prev => ({ ...prev, details: defaultDetails }));
    }
  }, [currentInspection.department, currentInspection.details]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lon: longitude };
        setLocation(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
        setCurrentInspection(prev => ({...prev, gpsLocation: newLocation }));
      },
      () => {
        setLocation('Could not get location.');
      }
    );
  }, []);
  
  const handleDetailsChange = (details: HealthData | EngineeringData) => {
    setCurrentInspection(prev => ({...prev, details}));
  };
  
  const handleSave = async () => {
    const newErrors: string[] = [];
    
    // Validate signature
    if (!signature.trim()) {
      newErrors.push('Digital signature is required to complete the inspection.');
    }
    
    // Validate checklist completion
    if (currentInspection.details) {
      if (currentInspection.department === Department.Health) {
        const healthData = currentInspection.details as HealthData;
        const incompleteItems = healthData.checklists.filter(item => 
          item.rating === ComplianceRating.NotApplicable && !item.comment.trim()
        );
        
        if (incompleteItems.length > 0) {
          newErrors.push('Please complete all checklist items or add comments for N/A items.');
        }
        
        // Calculate overall compliance
        const ratings = healthData.checklists.filter(item => item.rating !== ComplianceRating.NotApplicable);
        if (ratings.length > 0) {
          const passCount = ratings.filter(item => item.rating === ComplianceRating.Pass).length;
          const failCount = ratings.filter(item => item.rating === ComplianceRating.Fail).length;
          
          let overallCompliance: ComplianceRating;
          if (failCount > 0) {
            overallCompliance = ComplianceRating.Fail;
          } else if (passCount === ratings.length) {
            overallCompliance = ComplianceRating.Pass;
          } else {
            overallCompliance = ComplianceRating.Conditional;
          }
          
          healthData.overallCompliance = overallCompliance;
        }
      } else {
        const engineeringData = currentInspection.details as EngineeringData;
        const incompleteItems = engineeringData.progressItems.filter(item => 
          item.progress === 0 && !item.comment.trim()
        );
        
        if (incompleteItems.length > 0) {
          newErrors.push('Please provide progress assessment or add comments for each phase.');
        }
      }
    }
    
    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    setErrors([]);
    try {
      const updatedInspection = {
        ...currentInspection,
        status: InspectionStatus.Completed,
        signature: {
          name: signature,
          timestamp: new Date().toISOString()
        },
        photos: photos,
        inspectionDate: new Date().toISOString()
      };
      await onSave(updatedInspection);
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file: File) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result && typeof event.target.result === 'string') {
            setPhotos(prev => [...prev, event.target.result]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const getCompletionProgress = () => {
    if (!currentInspection.details) return 0;
    
    if (currentInspection.department === Department.Health) {
      const healthData = currentInspection.details as HealthData;
      const completedItems = healthData.checklists.filter(item => 
        item.rating !== ComplianceRating.NotApplicable || item.comment.trim()
      );
      return Math.round((completedItems.length / healthData.checklists.length) * 100);
    } else {
      const engineeringData = currentInspection.details as EngineeringData;
      const completedItems = engineeringData.progressItems.filter(item => 
        item.progress > 0 || item.comment.trim()
      );
      return Math.round((completedItems.length / engineeringData.progressItems.length) * 100);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to list
        </button>
      </div>

      <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-900/30 to-transparent p-3 sm:p-4 border-b border-cyan-500/20">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-cyan-100 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5 text-cyan-400" />
                Inspection Details
              </h2>
              <p className="text-dark-500 text-xs sm:text-sm mt-1 font-mono">ID: #{inspection.id.slice(0, 8)}</p>
            </div>
            <div className="text-right">
              <span className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded border ${
                inspection.status === InspectionStatus.Pending 
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                  : inspection.status === InspectionStatus.Completed
                  ? 'bg-green-500/10 border-green-500/40 text-green-400'
                  : 'bg-red-500/10 border-red-500/40 text-red-400'
              }`}>
                {inspection.status}
              </span>
              <div className="mt-2">
                <div className="text-xs text-dark-500 mb-1">Completion Progress</div>
                <div className="w-24 sm:w-32 h-2 bg-dark-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-green-500 transition-all duration-300"
                    style={{ width: `${getCompletionProgress()}%` }}
                  />
                </div>
                <div className="text-xs text-cyan-400 mt-1">{getCompletionProgress()}%</div>
              </div>
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-3 mx-3 sm:mx-4 mt-4">
            <div className="flex items-start gap-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-400 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 font-medium text-sm">Please complete the following:</p>
                <ul className="list-disc list-inside text-red-300 text-xs mt-1 space-y-1">
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="p-3 sm:p-4 space-y-4">
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <LocationIcon className="w-5 h-5 text-cyan-400 mt-0.5" />
              <div>
                <p className="text-cyan-100 font-medium">{inspection.address}</p>
                <div className="flex items-center gap-4 mt-2 text-dark-500 text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {inspection.date || 'No date set'}
                  </span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 border border-cyan-500/30 rounded text-cyan-400 text-xs">
                    {inspection.department}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {inspection.department === Department.Health && (
            <HealthChecklist 
                data={currentInspection.details as HealthData} 
                onChange={(newData) => handleDetailsChange(newData)}
            />
          )}
          {inspection.department === Department.Engineering && (
            <EngineeringProgress 
                data={currentInspection.details as EngineeringData} 
                onChange={(newData) => handleDetailsChange(newData)}
            />
          )}

          <div className="bg-dark-800/30 border border-cyan-500/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-cyan-400 mb-4 tracking-wider">FIELD TOOLS</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-dark-800/50 border border-dark-700 rounded-lg">
                <LocationIcon className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-cyan-100">GPS Location Tag</p>
                  <p className="text-sm text-dark-500">{location}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dark-800/50 border border-dark-700 rounded-lg">
                <CameraIcon className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-cyan-100">Photo Documentation</p>
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handlePhotoUpload}
                    className="mt-2 block w-full text-sm text-dark-500
                      file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                      file:text-xs file:font-semibold
                      file:bg-cyan-600 file:text-dark-950
                      hover:file:bg-cyan-500
                      cursor-pointer"
                  />
                  {photos.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs text-cyan-400 mb-2">{photos.length} photo(s) uploaded</p>
                      <div className="grid grid-cols-3 gap-2">
                        {photos.map((photo, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={photo} 
                              alt={`Inspection photo ${index + 1}`}
                              className="w-full h-20 object-cover rounded border border-dark-600"
                            />
                            <button
                              onClick={() => handleRemovePhoto(index)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-dark-800/50 border border-dark-700 rounded-lg">
                <SignatureIcon className="w-5 h-5 text-cyan-400 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-cyan-100">Digital Signature</p>
                  <input 
                    type="text" 
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Enter your full name to sign" 
                    className={`mt-2 block w-full px-3 py-2 bg-dark-800/50 border rounded-lg text-cyan-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 ${
                      errors.some(error => error.includes('signature')) 
                        ? 'border-red-500 focus:ring-red-500/50' 
                        : 'border-dark-700'
                    }`}
                  />
                  {signature && (
                    <p className="text-xs text-green-400 mt-1 flex items-center gap-1">
                      <CheckCircleIcon className="w-3 h-3" />
                      Signature captured: {signature}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1 bg-green-600 hover:bg-green-500 text-dark-950 font-semibold"
            >
              {saving ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                'Complete & Save Inspection'
              )}
            </Button>
            <Button onClick={onBack} variant="secondary" className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionForm;
