import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DynamicQR } from './components/DynamicQR';

// Mock Auth Context - In reality, pull this from localStorage/Zustand
const getAuth = () => ({ role: 'STUDENT', token: 'mock-jwt' });

function App() {
  const { role, token } = getAuth();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold">Dadu Gatepass System</h1>
          <p className="text-sm text-gray-500">Logged in as: {role}</p>
        </header>

        <Routes>
          {/* Student/Faculty Dashboard */}
          <Route path="/dashboard" element={
            <div className="bg-white p-6 rounded shadow-sm max-w-md">
              <h2 className="text-lg font-semibold mb-4">Your Active Pass</h2>
              {/* Render the QR component built previously */}
              <DynamicQR passId="mock-uuid-123" jwtToken={token} />
            </div>
          } />

          {/* Supervisor Dashboard */}
          <Route path="/approvals" element={
            role.includes('SUPERVISOR') || role === 'SWD_ADMIN'
              ? <div><h2>Pending Approvals List Here</h2></div>
              : <Navigate to="/dashboard" />
          } />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;