import React from 'react';
import Button from '../../components/Button';

const DataExportPanel: React.FC = () => {
  const handleExport = (type: string) => {
    // Placeholder logic – replace with actual Supabase data export
    console.log(`Exporting ${type} as CSV`);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white">📤 Export Data</h2>
      <p className="text-gray-400 text-sm">
        Download important data from the system for reports, analysis, or backup.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <Button
          onClick={() => handleExport('users')}
          variant="outline"
          fullWidth
        >
          Export Users
        </Button>
        <Button
          onClick={() => handleExport('guestlists')}
          variant="outline"
          fullWidth
        >
          Export Guestlists
        </Button>
        <Button
          onClick={() => handleExport('checkins')}
          variant="outline"
          fullWidth
        >
          Export Check-Ins
        </Button>
        <Button
          onClick={() => handleExport('access_logs')}
          variant="outline"
          fullWidth
        >
          Export Access Logs
        </Button>
        <Button
          onClick={() => handleExport('coats')}
          variant="outline"
          fullWidth
        >
          Export Coat Check Data
        </Button>
        <Button
          onClick={() => handleExport('feedback')}
          variant="outline"
          fullWidth
        >
          Export Feedback & Ratings
        </Button>
      </div>

      <p className="text-xs text-gray-500 pt-4">
        All data exports are in CSV format by default. Additional formats (e.g., Excel) coming soon.
      </p>
    </div>
  );
};

export default DataExportPanel;
