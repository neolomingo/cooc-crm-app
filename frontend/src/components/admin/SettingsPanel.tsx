import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';

const SettingsPanel: React.FC = () => {
  const [branding, setBranding] = useState('COOC Members Club');
  const [checkInFlow, setCheckInFlow] = useState(true);
  const [notificationPing, setNotificationPing] = useState(true);
  const [maxCheckIns, setMaxCheckIns] = useState(20);

  const handleSave = () => {
    // Future: Save settings to Supabase or local config
    console.log({
      branding,
      checkInFlow,
      notificationPing,
      maxCheckIns,
    });
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold text-white">⚙️ Settings & Configuration</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Club Branding</label>
          <Input
            value={branding}
            onChange={(e) => setBranding(e.target.value)}
            placeholder="App title or display name"
            fullWidth
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Enable Check-In Flow
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={checkInFlow}
              onChange={(e) => setCheckInFlow(e.target.checked)}
              className="h-5 w-5 text-primary-500 focus:ring-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-400 text-sm">
              Toggle full check-in process on/off
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Manager Notification Ping
          </label>
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              checked={notificationPing}
              onChange={(e) => setNotificationPing(e.target.checked)}
              className="h-5 w-5 text-primary-500 focus:ring-primary-600 border-gray-300 rounded"
            />
            <span className="text-gray-400 text-sm">
              Alert managers on check-in events
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Max Check-Ins per Hour
          </label>
          <Input
            type="number"
            value={maxCheckIns}
            onChange={(e) => setMaxCheckIns(Number(e.target.value))}
            min={1}
            fullWidth
          />
        </div>

        <div className="pt-4">
          <Button onClick={handleSave} variant="accent" size="md">
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
