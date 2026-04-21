
import { Inspection } from './types';
import { Department, InspectionStatus, ComplianceRating, EngineeringPhase } from './constants';

export const mockInspections: Inspection[] = [
  {
    id: 'H001',
    department: Department.Health,
    address: '123 Main St, Central Business District',
    inspector: 'Jane Doe',
    date: '2024-07-28',
    status: InspectionStatus.Completed,
    details: {
      establishmentType: 'Restaurant',
      overallCompliance: ComplianceRating.Pass,
      checklists: [
        { id: 'h1', text: 'Food Storage', rating: ComplianceRating.Pass, comment: '' },
        { id: 'h2', text: 'Kitchen Hygiene', rating: ComplianceRating.Pass, comment: 'Excellent standards.' },
        { id: 'h3', text: 'Staff Sanitation', rating: ComplianceRating.Pass, comment: '' },
      ],
    },
    photos: [],
  },
  {
    id: 'H002',
    department: Department.Health,
    address: '456 Oak Ave, Sakubva',
    inspector: 'Jane Doe',
    date: '2024-07-29',
    status: InspectionStatus.FollowUpRequired,
    details: {
      establishmentType: 'Grocery Store',
      overallCompliance: ComplianceRating.Conditional,
      checklists: [
        { id: 'h4', text: 'Pest Control', rating: ComplianceRating.Fail, comment: 'Evidence of rodents found.' },
        { id: 'h5', text: 'Waste Disposal', rating: ComplianceRating.Conditional, comment: 'Bins overflowing.' },
        { id: 'h6', text: 'Refrigeration Temps', rating: ComplianceRating.Pass, comment: '' },
      ],
    },
    photos: [],
  },
  {
    id: 'H003',
    department: Department.Health,
    address: '789 Pine Ln, Dangamvura',
    inspector: 'Jane Doe',
    date: '2024-08-01',
    status: InspectionStatus.Pending,
    details: {
      establishmentType: 'School Cafeteria',
      overallCompliance: ComplianceRating.NotApplicable,
      checklists: [
        { id: 'h7', text: 'Food Preparation Surfaces', rating: ComplianceRating.NotApplicable, comment: '' },
        { id: 'h8', text: 'Dishwashing Facilities', rating: ComplianceRating.NotApplicable, comment: '' },
      ],
    },
    photos: [],
  },
  {
    id: 'E001',
    department: Department.Engineering,
    address: 'Site A, Industrial Park',
    inspector: 'John Smith',
    date: '2024-07-25',
    status: InspectionStatus.Pending,
    details: {
      siteName: 'New Warehouse Construction',
      safetyAssessment: 'Pass',
      progressItems: [
        { phase: EngineeringPhase.Foundation, progress: 100, materialsVerified: true, workmanship: 'Good', comment: 'Curing complete.' },
        { phase: EngineeringPhase.Structural, progress: 60, materialsVerified: true, workmanship: 'Good', comment: 'Steel frame erection ongoing.' },
        { phase: EngineeringPhase.Roof, progress: 0, materialsVerified: false, workmanship: 'Good', comment: '' },
        { phase: EngineeringPhase.Finishing, progress: 0, materialsVerified: false, workmanship: 'Good', comment: '' },
      ],
    },
    photos: [],
  },
  {
    id: 'E002',
    department: Department.Engineering,
    address: 'Lot 24, Greenside Extension',
    inspector: 'John Smith',
    date: '2024-07-30',
    status: InspectionStatus.Completed,
    details: {
      siteName: 'Residential House Finishing',
      safetyAssessment: 'Pass',
      progressItems: [
        { phase: EngineeringPhase.Foundation, progress: 100, materialsVerified: true, workmanship: 'Good', comment: '' },
        { phase: EngineeringPhase.Structural, progress: 100, materialsVerified: true, workmanship: 'Good', comment: '' },
        { phase: EngineeringPhase.Roof, progress: 100, materialsVerified: true, workmanship: 'Good', comment: '' },
        { phase: EngineeringPhase.Finishing, progress: 100, materialsVerified: true, workmanship: 'Good', comment: 'All finishes meet standards. Ready for handover.' },
      ],
    },
    photos: [],
  },
    {
    id: 'E003',
    department: Department.Engineering,
    address: 'Road Repair, Chikanga Phase 2',
    inspector: 'John Smith',
    date: '2024-08-02',
    status: InspectionStatus.Pending,
    details: {
      siteName: 'Asphalt Laying Project',
      safetyAssessment: 'Pass',
      progressItems: [
        { phase: EngineeringPhase.Foundation, progress: 0, materialsVerified: false, workmanship: 'Good', comment: 'Awaiting material delivery.' },
      ],
    },
    photos: [],
  },
];
