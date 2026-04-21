import React, { useState } from 'react';
import { User, LicenseRequest } from '../../types';
import { Department } from '../../constants';
import Button from '../common/Button';
import { ArrowLeftIcon, BuildingOfficeIcon, LocationIcon, DocumentTextIcon, ClipboardDocumentListIcon } from '../icons';

interface LicenseRequestFormProps {
  user: User;
  onBack: () => void;
  onSubmit: (request: { department: string; address: string; licenseType: string; description: string }) => Promise<void>;
}

const LicenseRequestForm: React.FC<LicenseRequestFormProps> = ({ 
  user, 
  onBack, 
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    department: Department.Health,
    address: '',
    licenseType: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const licenseTypes = {
    [Department.Health]: [
      { value: 'Food Service License', label: 'Food Service License', icon: '🍽️' },
      { value: 'Health Facility License', label: 'Health Facility License', icon: '🏥' },
      { value: 'Water Supply License', label: 'Water Supply License', icon: '💧' },
      { value: 'Waste Management License', label: 'Waste Management License', icon: '🗑️' },
      { value: 'Pest Control License', label: 'Pest Control License', icon: '🐛' }
    ],
    [Department.Engineering]: [
      { value: 'Building Construction License', label: 'Building Construction License', icon: '🏗️' },
      { value: 'Electrical Installation License', label: 'Electrical Installation License', icon: '⚡' },
      { value: 'Plumbing License', label: 'Plumbing License', icon: '🔧' },
      { value: 'Construction Permit', label: 'Construction Permit', icon: '👷' },
      { value: 'Structural Engineering License', label: 'Structural Engineering License', icon: '🏢' }
    ]
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.licenseType) newErrors.licenseType = 'Please select a license type';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 20) newErrors.description = 'Description must be at least 20 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to submit license request:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeftIcon className="w-4 h-4 mr-1" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-cyan-100">Apply for License</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Department Selection */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              Department
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {Object.values(Department).map((dept) => (
                <button
                  key={dept}
                  type="button"
                  onClick={() => handleInputChange('department', dept)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    formData.department === dept
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                      : 'border-dark-600 text-dark-300 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="text-lg mb-1">
                    {dept === Department.Health ? '🏥' : '🏗️'}
                  </div>
                  <div className="font-medium">{dept}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Address */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <LocationIcon className="w-5 h-5" />
              Address
            </h2>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter the complete address where the license will be applicable..."
              className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-cyan-100 placeholder-dark-400 focus:outline-none focus:border-cyan-500 resize-none ${
                errors.address ? 'border-red-500' : 'border-dark-600'
              }`}
              rows={3}
            />
            {errors.address && (
              <p className="mt-2 text-sm text-red-400">{errors.address}</p>
            )}
          </div>

          {/* License Type */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <ClipboardDocumentListIcon className="w-5 h-5" />
              License Type
            </h2>
            <div className="grid grid-cols-1 gap-3">
              {licenseTypes[formData.department].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleInputChange('licenseType', type.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.licenseType === type.value
                      ? 'border-cyan-500 bg-cyan-500/10 text-cyan-100'
                      : 'border-dark-600 text-dark-300 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{type.icon}</span>
                    <div>
                      <div className="font-medium">{type.label}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
            {errors.licenseType && (
              <p className="mt-2 text-sm text-red-400">{errors.licenseType}</p>
            )}
          </div>

          {/* Description */}
          <div className="bg-dark-800/50 border border-dark-700 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-cyan-100 mb-4 flex items-center gap-2">
              <DocumentTextIcon className="w-5 h-5" />
              Description
            </h2>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Provide detailed information about your license application..."
              className={`w-full px-4 py-3 bg-dark-700 border rounded-lg text-cyan-100 placeholder-dark-400 focus:outline-none focus:border-cyan-500 resize-none ${
                errors.description ? 'border-red-500' : 'border-dark-600'
              }`}
              rows={5}
            />
            {errors.description && (
              <p className="mt-2 text-sm text-red-400">{errors.description}</p>
            )}
            <p className="mt-2 text-sm text-dark-400">
              {formData.description.length}/20 characters minimum
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onBack}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              loading={loading}
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LicenseRequestForm;
