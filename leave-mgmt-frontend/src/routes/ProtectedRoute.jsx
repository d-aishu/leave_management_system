import { Navigate, useLocation } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a page. Redirects to /login if not authenticated.
 * If `roles` is provided, also enforces that the logged-in user has one of those roles;
 * otherwise shows an Access Denied panel.
 */
const ProtectedRoute = ({ children, roles }) => {
  const { isAuthenticated, hasRole } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (roles && roles.length > 0 && !hasRole(...roles)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          px: 2
        }}
      >
        <LockOutlinedIcon sx={{ fontSize: 56, color: 'text.secondary', mb: 2 }} />
        <Typography variant="h5" gutterBottom>
          Access denied
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 420 }}>
          Your role doesn't have permission to view this page. Contact your administrator if you
          think this is a mistake.
        </Typography>
        <Button variant="contained" href="/dashboard">
          Back to dashboard
        </Button>
      </Box>
    );
  }

  return children;
};

export default ProtectedRoute;
