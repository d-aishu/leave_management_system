import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ApplyLeavePage from './pages/ApplyLeavePage';
import MyLeavesPage from './pages/MyLeavesPage';
import LeaveApprovalPage from './pages/LeaveApprovalPage';
import EmployeeManagementPage from './pages/EmployeeManagementPage';
import NotFoundPage from './pages/NotFoundPage';

const RootRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<RootRedirect />} />
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/apply-leave" element={<ApplyLeavePage />} />
      <Route path="/my-leaves" element={<MyLeavesPage />} />
      <Route
        path="/leave-approvals"
        element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
            <LeaveApprovalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employees"
        element={
          <ProtectedRoute roles={['MANAGER', 'ADMIN']}>
            <EmployeeManagementPage />
          </ProtectedRoute>
        }
      />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
