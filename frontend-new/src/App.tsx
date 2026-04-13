import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

// A placeholder for the dashboard which will be accessed after login
function Dashboard() {
  return (
    <div className="min-h-screen flex items-center justify-center nebula-bg text-on-surface">
      <h1 className="text-4xl font-headline font-bold">Welcome to the YUDO Dashboard</h1>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* Default route redirecting to login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
