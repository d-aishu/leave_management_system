import { Box, CircularProgress, Typography } from '@mui/material';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';

export const LoadingState = ({ label = 'Loading…' }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 2
    }}
  >
    <CircularProgress size={32} />
    <Typography variant="body2" color="text.secondary">
      {label}
    </Typography>
  </Box>
);

export const EmptyState = ({ title = 'Nothing here yet', subtitle }) => (
  <Box
    sx={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      py: 8,
      gap: 1,
      textAlign: 'center'
    }}
  >
    <InboxOutlinedIcon sx={{ fontSize: 44, color: 'text.disabled' }} />
    <Typography variant="subtitle1">{title}</Typography>
    {subtitle && (
      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);
