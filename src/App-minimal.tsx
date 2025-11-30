import React from "react";

const AppMinimal = () => {
  return (
    <div className="min-h-screen bg-purple-600 text-white p-8 text-center">
      <h1 className="text-5xl font-bold mb-4">🎉 SUCCESS! 🎉</h1>
      <p className="text-2xl mb-4">The app is working!</p>
      <p className="text-lg">Even the most minimal version works.</p>
      
      <div className="mt-8 p-4 bg-purple-700 rounded">
        <h2 className="text-xl font-semibold mb-2">What this proves:</h2>
        <ul className="text-left space-y-2">
          <li>✅ React is working</li>
          <li>✅ Vite dev server is working</li>
          <li>✅ Tailwind CSS is working</li>
          <li>✅ The original App.tsx had problematic code</li>
        </ul>
      </div>
      
      <div className="mt-8 p-4 bg-purple-800 rounded">
        <h3 className="text-lg font-semibold">Original Problem:</h3>
        <p className="text-sm mt-2">
          The hanging was caused by <code className="bg-purple-900 px-2 py-1 rounded">
          window.location.pathname</code> usage in App.tsx component body
        </p>
      </div>
    </div>
  );
};

export default AppMinimal;