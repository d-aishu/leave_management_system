import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TextField,
  MenuItem,
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Tooltip,
  IconButton,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import { LoadingState, EmptyState } from '../components/StateViews';
import { getMyLeaves, cancelLeave } from '../api/leaveApi';
import { formatDate, extractErrorMessage } from '../utils/helpers';

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

const MyLeavesPage = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getMyLeaves(statusFilter === 'ALL' ? undefined : statusFilter);
      setLeaves(res.data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load your leave requests.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelLeave(cancelTarget.id);
      setActionMsg('Leave request cancelled.');
      setCancelTarget(null);
      loadLeaves();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not cancel this leave request.'));
      setCancelTarget(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="My leaves"
        subtitle="Track the status of leave requests you've submitted."
        action={
          <Button
            variant="contained"
            startIcon={<AddCircleOutlineIcon />}
            onClick={() => navigate('/apply-leave')}
          >
            Apply for leave
          </Button>
        }
      />

      {actionMsg && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setActionMsg('')}>
          {actionMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 2.5, maxWidth: 220 }}>
        <TextField
          select
          label="Filter by status"
          size="small"
          fullWidth
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          {STATUS_FILTERS.map((s) => (
            <MenuItem key={s} value={s}>
              {s === 'ALL' ? 'All statuses' : s}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <LoadingState label="Loading your leave requests…" />
        ) : leaves.length === 0 ? (
          <EmptyState
            title="No leave requests found"
            subtitle="Try a different filter, or apply for a new leave."
          />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <StatusChip status={leave.status} />
                      {leave.status === 'REJECTED' && leave.rejectionReason && (
                        <Tooltip title={leave.rejectionReason}>
                          <Box
                            component="span"
                            sx={{ ml: 1, fontSize: 12, color: 'text.secondary', cursor: 'help' }}
                          >
                            (why?)
                          </Box>
                        </Tooltip>
                      )}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 240 }}>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason}
                      </Box>
                    </TableCell>
                    <TableCell align="right">
                      {leave.status === 'PENDING' && (
                        <Tooltip title="Cancel this request">
                          <IconButton size="small" color="error" onClick={() => setCancelTarget(leave)}>
                            <CancelOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!cancelTarget} onClose={() => setCancelTarget(null)}>
        <DialogTitle>Cancel this leave request?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This will cancel your {cancelTarget?.leaveType?.toLowerCase()} leave request from{' '}
            {formatDate(cancelTarget?.startDate)} to {formatDate(cancelTarget?.endDate)}. This action
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setCancelTarget(null)} disabled={cancelling}>
            Keep request
          </Button>
          <Button color="error" variant="contained" onClick={handleCancelConfirm} disabled={cancelling}>
            {cancelling ? 'Cancelling…' : 'Cancel request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MyLeavesPage;
