import React from 'react';

interface Props {
  onLogout: () => void;
}

export const AdminDashboard: React.FC<Props> = ({ onLogout }) => {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-white bg-background-dark">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
      <button onClick={onLogout} className="px-4 py-2 bg-red-600 rounded">
        Logout
      </button>
    </div>
  );
};