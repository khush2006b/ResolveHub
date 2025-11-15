import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CheckStatusPage from './pages/CheckStatusPage';
import HelpPage from './pages/HelpPage';
import CitizenDashboard from './pages/CitizenDashboard';
import StaffDashboard from './pages/StaffDashboard';
import AdminDashboard from './pages/AdminDashboard';
import SubmitComplaint from './pages/SubmitComplaint';
import ComplaintHistory from './pages/ComplaintHistory';
import HeatmapPage from './pages/HeatmapPage';
import ProfilePage from './pages/ProfilePage';
import OAuthSuccess from './pages/OAuthSuccess';
import OAuthFailure from './pages/OAuthFailure';
import SettingsPage from './pages/SettingsPage';
import StatisticsPage from './pages/StatisticsPage';
import AboutPage from './pages/AboutPage';
import MapTest from './pages/MapTest';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black">
          <Navbar />
          <main className="pt-16">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/check-status" element={<CheckStatusPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/map-test" element={<MapTest />} />
              <Route path="/oauth-success" element={<OAuthSuccess />} />
              <Route path="/oauth-failure" element={<OAuthFailure />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute roles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff"
                element={
                  <ProtectedRoute roles={['staff', 'admin']}>
                    <StaffDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/submit-complaint"
                element={
                  <ProtectedRoute roles={['citizen']}>
                    <SubmitComplaint />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/complaint-history"
                element={
                  <ProtectedRoute roles={['citizen']}>
                    <ComplaintHistory />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/heatmap"
                element={
                  <ProtectedRoute roles={['staff', 'admin']}>
                    <HeatmapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute roles={['citizen', 'staff', 'admin']}>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute roles={['citizen', 'staff', 'admin']}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/statistics"
                element={
                  <ProtectedRoute roles={['admin']}>
                    <StatisticsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
