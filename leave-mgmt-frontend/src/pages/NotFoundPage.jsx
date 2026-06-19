import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: 2
      }}
    >
      <Typography variant="h2" sx={{ fontWeight: 800, color: 'primary.main' }}>
        404
      </Typography>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or was moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/dashboard')}>
        Back to dashboard
      </Button>
    </Box>
  );
};

export default NotFoundPage;
