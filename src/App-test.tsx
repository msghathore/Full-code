// 🔧 MINIMAL APP FOR TESTING - ISOLATE THE ISSUE
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import LoadingScreen from "./components/LoadingScreen";

// Minimal test routes only
const TestHome: React.FC = () => {
  return (
    <div className="min-h-screen bg-green-500 text-white p-8">
      <h1 className="text-4xl font-bold">SUCCESS! App works!</h1>
      <p className="mt-4 text-xl">This proves the core app infrastructure works.</p>
      <div className="mt-8 bg-green-600 p-4 rounded">
        <p className="text-lg">The original App.tsx had problematic window.location usage causing the hang.</p>
      </div>
    </div>
  );
};

const TestStaff: React.FC = () => {
  return (
    <div className="min-h-screen bg-blue-500 text-white p-8">
      <h1 className="text-4xl font-bold">SUCCESS! Staff route works!</h1>
      <p className="mt-4 text-xl">Staff routing is functional!</p>
    </div>
  );
};

const AppTest = () => {
  return (
    <Suspense fallback={<LoadingScreen onComplete={() => {}} />}>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="/staff/*" element={<TestStaff />} />
      </Routes>
    </Suspense>
  );
};

export default AppTest;