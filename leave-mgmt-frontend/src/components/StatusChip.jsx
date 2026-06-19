import { Chip } from '@mui/material';
import { statusColor } from '../utils/helpers';

const StatusChip = ({ status }) => {
  return <Chip label={status} color={statusColor(status)} size="small" />;
};

export default StatusChip;
