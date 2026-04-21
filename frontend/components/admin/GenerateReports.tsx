import React, { useState } from 'react';
import { User, Fault } from '../../types';
import { FaultStatus } from '../../constants';
import Button from '../common/Button';
import { ArrowLeftIcon, DocumentTextIcon, Squares2X2Icon, ArrowRightOnRectangleIcon } from '../icons';

interface GenerateReportsProps {
  user: User;
  faults: Fault[];
  onBack: () => void;
}

const GenerateReports: React.FC<GenerateReportsProps> = ({ user, faults, onBack }) => {
  const [selectedReport, setSelectedReport] = useState<string>('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const reportTypes = [
    { id: 'fault-summary', name: 'Fault Summary Report', description: 'Overview of all faults within date range with status breakdown' },
    { id: 'performance-analysis', name: 'Performance Analysis', description: 'Detailed performance metrics and resolution rates' },
    { id: 'technician-performance', name: 'Technician Performance', description: 'Individual technician performance and workload analysis' },
    { id: 'area-analysis', name: 'Area Analysis', description: 'Fault distribution and patterns by geographical area' },
    { id: 'priority-report', name: 'Priority Report', description: 'High-priority faults and critical issues requiring attention' },
    { id: 'category-breakdown', name: 'Category Breakdown', description: 'Fault analysis by category and type' }
  ];

  // Filter faults based on date range
  const getFilteredFaults = () => {
    if (!dateRange.start && !dateRange.end) return faults;
    
    return faults.filter(fault => {
      const faultDate = new Date(fault.reportedDate);
      const startDate = dateRange.start ? new Date(dateRange.start) : new Date('1900-01-01');
      const endDate = dateRange.end ? new Date(dateRange.end) : new Date('2100-12-31');
      
      return faultDate >= startDate && faultDate <= endDate;
    });
  };

  const generateFaultSummaryCSV = () => {
    const filteredFaults = getFilteredFaults();
    const stats = {
      total: filteredFaults.length,
      reported: filteredFaults.filter(f => f.status === FaultStatus.Reported).length,
      inProgress: filteredFaults.filter(f => f.status === FaultStatus.InProgress).length,
      resolved: filteredFaults.filter(f => f.status === FaultStatus.Resolved).length,
      highPriority: filteredFaults.filter(f => f.priority === 'High').length,
      mediumPriority: filteredFaults.filter(f => f.priority === 'Medium').length,
      lowPriority: filteredFaults.filter(f => f.priority === 'Low').length
    };

    const csvContent = [
      ['Fault Summary Report', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Summary Statistics', '', '', '', '', '', '', '', ''],
      ['Total Faults', stats.total, '', '', '', '', '', '', ''],
      ['Reported Faults', stats.reported, '', '', '', '', '', '', ''],
      ['In Progress Faults', stats.inProgress, '', '', '', '', '', '', ''],
      ['Resolved Faults', stats.resolved, '', '', '', '', '', '', ''],
      ['High Priority Faults', stats.highPriority, '', '', '', '', '', '', ''],
      ['Medium Priority Faults', stats.mediumPriority, '', '', '', '', '', '', ''],
      ['Low Priority Faults', stats.lowPriority, '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Detailed Fault List', '', '', '', '', '', '', '', ''],
      ['Fault ID', 'Address', 'Area', 'Category', 'Priority', 'Status', 'Reported Date', 'Assigned Technician', 'Resolution Date'],
      ...filteredFaults.map(fault => [
        fault.fault_number || fault.id,
        fault.address,
        fault.area,
        fault.category,
        fault.priority,
        fault.status,
        new Date(fault.reportedDate).toLocaleDateString(),
        fault.technician || 'Unassigned',
        fault.resolvedDate ? new Date(fault.resolvedDate).toLocaleDateString() : 'Not Resolved'
      ])
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'fault-summary-report.csv');
  };

  const generatePerformanceAnalysisCSV = () => {
    const filteredFaults = getFilteredFaults();
    const totalFaults = filteredFaults.length;
    const resolvedFaults = filteredFaults.filter(f => f.status === FaultStatus.Resolved).length;
    const resolutionRate = totalFaults > 0 ? Math.round((resolvedFaults / totalFaults) * 100) : 0;

    const avgResolutionTime = resolvedFaults.reduce((acc, fault) => {
      if (fault.resolvedDate) {
        const days = Math.ceil((new Date(fault.resolvedDate).getTime() - new Date(fault.reportedDate).getTime()) / (1000 * 60 * 60 * 24));
        return acc + days;
      }
      return acc;
    }, 0) / Math.max(resolvedFaults, 1);

    const csvContent = [
      ['Performance Analysis Report', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Performance Metrics', '', '', '', '', '', '', '', ''],
      ['Total Faults', totalFaults, '', '', '', '', '', '', ''],
      ['Resolved Faults', resolvedFaults, '', '', '', '', '', '', ''],
      ['Resolution Rate', `${resolutionRate}%`, '', '', '', '', '', '', ''],
      ['Average Resolution Time', `${Math.round(avgResolutionTime)} days`, '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Priority Performance', '', '', '', '', '', '', '', ''],
      ['High Priority', filteredFaults.filter(f => f.priority === 'High').length, '', '', '', '', '', '', ''],
      ['Medium Priority', filteredFaults.filter(f => f.priority === 'Medium').length, '', '', '', '', '', '', ''],
      ['Low Priority', filteredFaults.filter(f => f.priority === 'Low').length, '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Status Performance', '', '', '', '', '', '', '', ''],
      ['Reported', filteredFaults.filter(f => f.status === FaultStatus.Reported).length, '', '', '', '', '', '', ''],
      ['In Progress', filteredFaults.filter(f => f.status === FaultStatus.InProgress).length, '', '', '', '', '', '', ''],
      ['Resolved', filteredFaults.filter(f => f.status === FaultStatus.Resolved).length, '', '', '', '', '', '', '']
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'performance-analysis-report.csv');
  };

  const generateTechnicianPerformanceCSV = () => {
    const filteredFaults = getFilteredFaults();
    const technicians = [...new Set(filteredFaults.map(f => f.technician).filter(Boolean))];
    
    const csvContent = [
      ['Technician Performance Report', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Technician Performance', '', '', '', '', '', '', '', ''],
      ['Technician', 'Total Assigned', 'Resolved', 'In Progress', 'Resolution Rate (%)', 'Avg Resolution Time (days)', '', '', ''],
      ...technicians.map(technician => {
        const techFaults = filteredFaults.filter(f => f.technician === technician);
        const resolved = techFaults.filter(f => f.status === FaultStatus.Resolved).length;
        const inProgress = techFaults.filter(f => f.status === FaultStatus.InProgress).length;
        const resolutionRate = techFaults.length > 0 ? Math.round((resolved / techFaults.length) * 100) : 0;
        
        const avgTime = resolved > 0 ? 
          Math.round(
            techFaults
              .filter(f => f.status === FaultStatus.Resolved && f.resolvedDate)
              .reduce((acc, fault) => {
                const days = Math.ceil((new Date(fault.resolvedDate!).getTime() - new Date(fault.reportedDate).getTime()) / (1000 * 60 * 60 * 24));
                return acc + days;
              }, 0) / resolved
          ) : 0;

        return [technician, techFaults.length, resolved, inProgress, resolutionRate, avgTime];
      }),
      ['', '', '', '', '', '', '', '', ''],
      ['Unassigned Faults', filteredFaults.filter(f => !f.technician).length, '', '', '', '', '', '', '']
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'technician-performance-report.csv');
  };

  const generateAreaAnalysisCSV = () => {
    const filteredFaults = getFilteredFaults();
    const areas = [...new Set(filteredFaults.map(f => f.area))];
    
    const csvContent = [
      ['Area Analysis Report', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Area Performance', '', '', '', '', '', '', '', ''],
      ['Area', 'Total Faults', 'Resolved', 'In Progress', 'Resolution Rate (%)', 'High Priority', 'Avg Resolution Time (days)', '', ''],
      ...areas.map(area => {
        const areaFaults = filteredFaults.filter(f => f.area === area);
        const resolved = areaFaults.filter(f => f.status === FaultStatus.Resolved).length;
        const inProgress = areaFaults.filter(f => f.status === FaultStatus.InProgress).length;
        const resolutionRate = areaFaults.length > 0 ? Math.round((resolved / areaFaults.length) * 100) : 0;
        const highPriority = areaFaults.filter(f => f.priority === 'High').length;
        
        const avgTime = resolved > 0 ? 
          Math.round(
            areaFaults
              .filter(f => f.status === FaultStatus.Resolved && f.resolvedDate)
              .reduce((acc, fault) => {
                const days = Math.ceil((new Date(fault.resolvedDate!).getTime() - new Date(fault.reportedDate).getTime()) / (1000 * 60 * 60 * 24));
                return acc + days;
              }, 0) / resolved
          ) : 0;

        return [area, areaFaults.length, resolved, inProgress, resolutionRate, highPriority, avgTime];
      })
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'area-analysis-report.csv');
  };

  const generatePriorityReportCSV = () => {
    const filteredFaults = getFilteredFaults();
    const highPriorityFaults = filteredFaults.filter(f => f.priority === 'High' || f.priority === 'Critical');
    
    const csvContent = [
      ['Priority Report - High & Critical Faults', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Priority Summary', '', '', '', '', '', '', '', ''],
      ['High/Critical Faults', highPriorityFaults.length, '', '', '', '', '', '', ''],
      ['Total Faults', filteredFaults.length, '', '', '', '', '', '', ''],
      ['Percentage', `${Math.round((highPriorityFaults.length / Math.max(filteredFaults.length, 1)) * 100)}%`, '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['High Priority Fault Details', '', '', '', '', '', '', '', ''],
      ['Fault ID', 'Address', 'Area', 'Category', 'Priority', 'Status', 'Reported Date', 'Assigned Technician', 'Days Open'],
      ...highPriorityFaults.map(fault => {
        const daysOpen = Math.ceil((new Date().getTime() - new Date(fault.reportedDate).getTime()) / (1000 * 60 * 60 * 24));
        return [
          fault.fault_number || fault.id,
          fault.address,
          fault.area,
          fault.category,
          fault.priority,
          fault.status,
          new Date(fault.reportedDate).toLocaleDateString(),
          fault.technician || 'Unassigned',
          daysOpen
        ];
      })
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'priority-report.csv');
  };

  const generateCategoryBreakdownCSV = () => {
    const filteredFaults = getFilteredFaults();
    const categories = [...new Set(filteredFaults.map(f => f.category))];
    
    const csvContent = [
      ['Category Breakdown Report', '', '', '', '', '', '', '', ''],
      ['Date Range', dateRange.start || 'All Time', dateRange.end || 'Present', '', '', '', '', '', ''],
      ['Generated Date', new Date().toLocaleDateString(), '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', '', ''],
      ['Category Analysis', '', '', '', '', '', '', '', ''],
      ['Category', 'Total Faults', 'Resolved', 'In Progress', 'Resolution Rate (%)', 'High Priority', 'Avg Resolution Time (days)', '', ''],
      ...categories.map(category => {
        const categoryFaults = filteredFaults.filter(f => f.category === category);
        const resolved = categoryFaults.filter(f => f.status === FaultStatus.Resolved).length;
        const inProgress = categoryFaults.filter(f => f.status === FaultStatus.InProgress).length;
        const resolutionRate = categoryFaults.length > 0 ? Math.round((resolved / categoryFaults.length) * 100) : 0;
        const highPriority = categoryFaults.filter(f => f.priority === 'High').length;
        
        const avgTime = resolved > 0 ? 
          Math.round(
            categoryFaults
              .filter(f => f.status === FaultStatus.Resolved && f.resolvedDate)
              .reduce((acc, fault) => {
                const days = Math.ceil((new Date(fault.resolvedDate!).getTime() - new Date(fault.reportedDate).getTime()) / (1000 * 60 * 60 * 24));
                return acc + days;
              }, 0) / resolved
          ) : 0;

        return [category, categoryFaults.length, resolved, inProgress, resolutionRate, highPriority, avgTime];
      })
    ];

    const csvString = csvContent.map(row => row.join(',')).join('\n');
    downloadCSV(csvString, 'category-breakdown-report.csv');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleGenerateReport = () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      switch(selectedReport) {
        case 'fault-summary':
          generateFaultSummaryCSV();
          break;
        case 'performance-analysis':
          generatePerformanceAnalysisCSV();
          break;
        case 'technician-performance':
          generateTechnicianPerformanceCSV();
          break;
        case 'area-analysis':
          generateAreaAnalysisCSV();
          break;
        case 'priority-report':
          generatePriorityReportCSV();
          break;
        case 'category-breakdown':
          generateCategoryBreakdownCSV();
          break;
        default:
          console.log('No report type selected');
      }
      setIsGenerating(false);
    }, 1000);
  };

  const handleExportCSV = () => {
    handleGenerateReport();
  };

  return (
    <div className="flex" style={{ backgroundColor: 'rgba(10,10,15,0.95)', minHeight: '100vh' }}>
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      )}

      <aside 
        className={`w-64 flex-shrink-0 fixed inset-y-0 left-0 z-40 overflow-hidden transition-transform duration-300 -translate-x-full lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : ''}`}
        style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}
      >
        <div className="flex flex-col h-full">
          <div className="h-20 flex items-center px-6 border-b" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-hidden">
            <button
              onClick={onBack}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-white transition-all cursor-pointer font-medium"
              style={{ backgroundColor: '#0033a0' }}
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer font-medium"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <DocumentTextIcon className="w-5 h-5" />
              <span>Generate Reports</span>
            </button>
          </nav>
          <div className="p-4 border-t" style={{ borderColor: 'rgba(0,51,160,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold" style={{ backgroundColor: '#0033a0', color: '#fed000' }}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user.name}</p>
                <p className="text-xs" style={{ color: '#fed000' }}>Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-y-auto transition-all duration-300 lg:ml-64">
        <div className="p-4 lg:p-8 pt-16 lg:pt-8">
          <div className="flex items-center gap-4 mb-6 lg:mb-8">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: '#fed000' }}
            >
              <Squares2X2Icon className="w-6 h-6" />
            </button>
            <h1 className="text-2xl lg:text-3xl font-bold text-white">Generate Reports</h1>
          </div>

          <div className="rounded-2xl p-6 mb-6" style={{ backgroundColor: 'rgba(2, 9, 29, 1)' }}>
            <h3 className="text-lg font-semibold text-white mb-4">Report Configuration</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Select Report Type</label>
                <select 
                  value={selectedReport} 
                  onChange={(e) => setSelectedReport(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                  style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                >
                  <option value="">Choose a report...</option>
                  {reportTypes.map(report => (
                    <option key={report.id} value={report.id} style={{ color: 'white' }}>
                      {report.name}
                    </option>
                  ))}
                </select>
                {selectedReport && (
                  <p className="text-xs mt-2" style={{ color: '#9ca3af' }}>
                    {reportTypes.find(r => r.id === selectedReport)?.description}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: '#9ca3af' }}>End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border focus:outline-none"
                    style={{ backgroundColor: 'rgba(10,10,15,0.95)', borderColor: 'rgba(0,51,160,0.2)', color: 'white', borderWidth: '1px' }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={!selectedReport || isGenerating}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#0033a0', color: '#fed000' }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <DocumentTextIcon className="w-4 h-4" />
                  Generate Report
                </>
              )}
            </button>
            <button
              onClick={handleExportCSV}
              disabled={!selectedReport || isGenerating}
              className="flex-1 px-4 py-3 rounded-lg font-medium transition-all hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ backgroundColor: '#10b981', color: 'white' }}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GenerateReports;