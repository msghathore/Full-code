import React, { useState } from 'react';

const StaffSchedulingSystem: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');

  const authenticate = () => {
    if (employeeId === 'EMP001' || employeeId === 'EMP002') {
      alert('Login successful!');
    } else {
      alert('Invalid employee ID. Use EMP001 or EMP002');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-black mb-4">Staff Login</h1>
        <p className="text-gray-600 mb-4">Enter your employee ID</p>
        <input
          type="text"
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
          placeholder="Enter employee ID (e.g., EMP001)"
          className="w-full border border-gray-300 rounded px-3 py-2 mb-4 text-black"
        />
        <button
          onClick={authenticate}
          className="w-full bg-black hover:bg-slate-800 text-white px-4 py-2 rounded"
        >
          Sign In
        </button>
        <p className="text-sm text-gray-500 mt-4">Demo IDs: EMP001, EMP002</p>
      </div>
    </div>
  );
};

export default StaffSchedulingSystem;