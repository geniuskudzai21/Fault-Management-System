import React, { useState } from 'react';
import { User, InspectionRequest } from '../../types';
import { Department } from '../../constants';
import Button from '../common/Button';
import { ArrowLeftIcon, BuildingOfficeIcon, LocationIcon, DocumentTextIcon, ClipboardDocumentListIcon } from '../icons';

interface InspectionRequestFormProps {
  user: User;
  onBack: () => void;
  onSubmit: (request: { department: string; address: string; requestType: string; description: string }) => Promise<void>;
}

const InspectionRequestForm: React.FC<InspectionRequestFormProps> = ({ 
  user, 
  onBack, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    department: Department.Health,
    address: '',
    requestType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const requestTypes = {
    [Department.Health]: [
      { value: 'Health Inspection', label: 'Health Inspection', icon: '🏥' },
      { value: 'Food Safety Inspection', label: 'Food Safety Inspection', icon: '🍽️' },
      { value: 'Water Quality Test', label: 'Water Quality Test', icon: '💧' },
      { value: 'Waste Management Inspection', label: 'Waste Management', icon: '🗑️' },
      { value: 'Pest Control Inspection', label: 'Pest Control', icon: '🐛' }
    ],
    [Department.Engineering]: [
      { value: 'Building Inspection', label: 'Building Inspection', icon: '🏗️' },
      { value: 'Electrical Inspection', label: 'Electrical Inspection', icon: '⚡' },
      { value: 'Plumbing Inspection', label: 'Plumbing Inspection', icon: '🔧' },
      { value: 'Construction Site Inspection', label: 'Construction Site', icon: '👷' },
      { value: 'Structural Inspection', label: 'Structural Inspection', icon: '🏢' }
    ]
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.requestType) newErrors.requestType = 'Please select an inspection type';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        department: formData.department as string,
        address: formData.address,
        requestType: formData.requestType,
        description: formData.description
      });
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setLoading(false);
    }
  };

  const currentTypes = requestTypes[formData.department as Department] || [];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="bg-dark-900/80 border border-cyan-500/20 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.05)] overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-900/30 to-transparent p-3 sm:p-4 border-b border-cyan-500/20">
          <h2 className="text-lg sm:text-xl font-bold text-cyan-100 flex items-center gap-2 sm:gap-3">
            <ClipboardDocumentListIcon className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            New Inspection Request
          </h2>
          <p className="text-dark-500 text-xs sm:text-sm mt-1">Fill in the details below to submit your inspection request</p>
        </div>

        <div className="p-3 sm:p-4 space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-3 tracking-wider">
              SELECT DEPARTMENT
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.values(Department).map((dept) => (
                <button
                  key={dept}
                  onClick={() => setFormData(prev => ({ 
                    ...prev, 
                    department: dept,
                    requestType: '' 
                  }))}
                  className={`p-3 rounded-lg border transition-all duration-200 flex items-center gap-2 sm:gap-3 ${
                    formData.department === dept
                      ? 'bg-cyan-600/20 border-cyan-400 text-cyan-100'
                      : 'bg-dark-800/50 border-dark-700 text-dark-400 hover:border-cyan-500/30 hover:text-dark-300'
                  }`}
                >
                  <BuildingOfficeIcon className={`w-4 h-4 sm:w-5 sm:h-5 ${formData.department === dept ? 'text-cyan-400' : ''}`} />
                  <span className="font-medium text-sm">{dept} Department</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2 tracking-wider">
              INSPECTION ADDRESS
            </label>
            <div className="relative">
              <LocationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border rounded-lg text-cyan-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all ${
                  errors.address ? 'border-red-500/50' : 'border-dark-700'
                }`}
                placeholder="Enter the full inspection address"
              />
            </div>
            {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2 tracking-wider">
              INSPECTION TYPE
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFormData(prev => ({ ...prev, requestType: type.value }))}
                  className={`p-3 rounded-lg border text-left transition-all duration-200 flex items-center gap-3 ${
                    formData.requestType === type.value
                      ? 'bg-cyan-600/20 border-cyan-400 text-cyan-100'
                      : 'bg-dark-800/50 border-dark-700 text-dark-400 hover:border-cyan-500/30 hover:text-dark-300'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span className="text-sm font-medium">{type.label}</span>
                </button>
              ))}
            </div>
            {errors.requestType && <p className="text-red-400 text-xs mt-1">{errors.requestType}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-cyan-400 mb-2 tracking-wider">
              DESCRIPTION
            </label>
            <div className="relative">
              <DocumentTextIcon className="absolute left-3 top-3 w-5 h-5 text-dark-500" />
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className={`w-full pl-10 pr-4 py-2.5 bg-dark-800/50 border rounded-lg text-cyan-100 placeholder-dark-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all resize-none ${
                  errors.description ? 'border-red-500/50' : 'border-dark-700'
                }`}
                placeholder="Provide detailed information about what needs to be inspected..."
              />
            </div>
            <div className="flex justify-between mt-1">
              {errors.description ? (
                <p className="text-red-400 text-xs">{errors.description}</p>
              ) : (
                <span></span>
              )}
              <span className="text-dark-600 text-xs">{formData.description.length} characters</span>
            </div>
          </div>

          <div className="bg-dark-800/30 border border-cyan-500/20 rounded-lg p-4">
            <h4 className="font-semibold text-cyan-300 mb-3 flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4" />
              Request Process
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2 text-dark-400">
                <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">1</span>
                Your request will be reviewed by admin
              </div>
              <div className="flex items-center gap-2 text-dark-400">
                <span className="w-5 h-5 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs">2</span>
                An inspector will be assigned
              </div>
              <div className="flex items-center gap-2 text-dark-400">
                <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs">3</span>
                You'll receive status notifications
              </div>
              <div className="flex items-center gap-2 text-dark-400">
                <span className="w-5 h-5 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center text-xs">4</span>
                Inspection will be scheduled
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-dark-950 font-semibold"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Submitting...
                </span>
              ) : (
                'Submit Request'
              )}
            </Button>
            <Button 
              onClick={onBack} 
              variant="secondary" 
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InspectionRequestForm;
