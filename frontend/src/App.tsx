import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { ResidentLogin, ResidentSignup } from './pages/Auth';
import { VisitorFlow } from './pages/VisitorFlow';
import { DashboardLoader } from './pages/DashboardLoader';
import { VisitorDashboard } from './pages/VisitorDashboard';
import { QRDisplay } from './pages/QRDisplay';
import { SWDPortal } from './pages/SWDPortal';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans p-4">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/resident/login" element={<ResidentLogin />} />
          <Route path="/resident/signup" element={<ResidentSignup />} />
          <Route path="/visitor" element={<VisitorFlow />} />
          <Route path="/dashboard" element={<DashboardLoader />} />
          <Route path="/visitor-dashboard" element={<VisitorDashboard />} />
          <Route path="/qr/:pass_id" element={<QRDisplay />} />
          <Route path="/swd" element={<SWDPortal />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}