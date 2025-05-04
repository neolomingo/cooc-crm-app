import React, { useState } from 'react';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { toast } from 'react-hot-toast';

const AccessCodeGeneratorPanel: React.FC = () => {
  const [role, setRole] = useState<'admin' | 'manager'>('manager');
  const [generatedCode, setGeneratedCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const generateCode = async () => {
    setIsGenerating(true);

    try {
      const plainCode = `${role.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      setGeneratedCode(plainCode);

      // Ideally: send to server to hash + store in DB
      // await supabase.functions.invoke('hash-code', { body: { role, code: plainCode } });

      toast.success('Access code generated');
    } catch (error) {
      toast.error('Failed to generate access code');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-6 bg-background-card rounded-lg shadow border border-gray-700 text-white">
      <h2 className="text-xl font-bold mb-4">🔐 Generate Access Code</h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-gray-300 mb-1">Select Role</label>
          <select
            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            value={role}
            onChange={(e) => setRole(e.target.value as 'admin' | 'manager')}
          >
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Optional Expiry input in future
        <Input
          label="Expiration (minutes)"
          type="number"
          placeholder="e.g., 60"
        />
        */}

        <Button
          onClick={generateCode}
          isLoading={isGenerating}
          fullWidth
        >
          Generate Code
        </Button>

        {generatedCode && (
          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-1">Generated Code</label>
            <div className="bg-gray-800 p-2 rounded border border-gray-600 text-green-400 font-mono">
              {generatedCode}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessCodeGeneratorPanel;
