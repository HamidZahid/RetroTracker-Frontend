import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Layout } from '@/components/layout/Layout';
import { LoginPage } from '@/pages/Login';
import { RegisterPage } from '@/pages/Register';
import { DashboardPage } from '@/pages/Dashboard';
import { RetroListPage } from '@/pages/RetroList';
import { RetroBoardPage } from '@/pages/RetroBoard';
import { ActionItemsPage } from '@/pages/ActionItems';
import { TeamMembersPage } from '@/pages/TeamMembers';
import { ProfilePage } from '@/pages/Profile';
import { SettingsPage } from '@/pages/Settings';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes with layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/teams/:teamId/retros" element={<RetroListPage />} />
            <Route path="/retros/:retroId" element={<RetroBoardPage />} />
            <Route path="/teams/:teamId/action-items" element={<ActionItemsPage />} />
            <Route path="/teams/:teamId/members" element={<TeamMembersPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <Toaster />
    </AuthProvider>
  );
}

export default App;
