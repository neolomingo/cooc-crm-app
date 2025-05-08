import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Button from '../../components/Button';

const AddWalkIn: React.FC = () => {
  return (
    <div className="p-6">
      <Button
        variant="text"
        leftIcon={<ArrowLeft size={18} />}
        onClick={() => window.history.back()}
        className="mb-4"
      >
        Back
      </Button>
      <h1 className="text-2xl font-bold mb-6">Add Walk-In</h1>
      {/* Your form will go here */}
      <p className="text-muted">Form coming soon...</p>
    </div>
  );
};

export default AddWalkIn;
