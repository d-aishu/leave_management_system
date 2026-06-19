import { useEffect, useState, useCallback } from 'react';
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
  Stack,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffOutlinedIcon from '@mui/icons-material/HighlightOffOutlined';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import { LoadingState, EmptyState } from '../components/StateViews';
import { getAllLeaves, processLeave } from '../api/leaveApi';
import { formatDate, extractErrorMessage } from '../utils/helpers';

const STATUS_FILTERS = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'ALL'];

const LeaveApprovalPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [leaves, setLeaves] = useState([]);
  const [statusFilter, setStatusFilter] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const [actionDialog, setActionDialog] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllLeaves(statusFilter === 'ALL' ? undefined : statusFilter);
      setLeaves(res.data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load leave requests.'));
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  const openAction = (leave, type) => {
    setActionDialog({ leave, type });
    setRejectionReason('');
  };

  const handleConfirmAction = async () => {
    if (!actionDialog) return;
    const leave = actionDialog.leave;
    const type = actionDialog.type;

    if (type === 'REJECTED' && rejectionReason.trim().length === 0) {
      setError('A rejection reason is required.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      await processLeave(leave.id, type, type === 'REJECTED' ? rejectionReason.trim() : undefined);
      setActionMsg('Leave request ' + (type === 'APPROVED' ? 'approved' : 'rejected') + ' successfully.');
      setActionDialog(null);
      loadLeaves();
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not process this leave request.'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Leave approvals"
        subtitle="Review and act on your team's leave requests."
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
          <LoadingState label="Loading leave requests..." />
        ) : leaves.length === 0 ? (
          <EmptyState title="No leave requests found" subtitle="Try a different status filter." />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Start</TableCell>
                  <TableCell>End</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.employeeName}</TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {leave.reason}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={leave.status} />
                    </TableCell>
                    <TableCell align="right">
                      {leave.status === 'PENDING' ? (
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            color="success"
                            variant="outlined"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => openAction(leave, 'APPROVED')}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            variant="outlined"
                            startIcon={<HighlightOffOutlinedIcon />}
                            onClick={() => openAction(leave, 'REJECTED')}
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={!!actionDialog} onClose={() => setActionDialog(null)} fullWidth maxWidth="xs">
        <DialogTitle>
          {actionDialog && actionDialog.type === 'APPROVED' ? 'Approve leave request' : 'Reject leave request'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: actionDialog && actionDialog.type === 'REJECTED' ? 2 : 0 }}>
            {actionDialog && (
              <>
                {actionDialog.leave.employeeName}'s {actionDialog.leave.leaveType.toLowerCase()} leave
                from {formatDate(actionDialog.leave.startDate)} to {formatDate(actionDialog.leave.endDate)}.
              </>
            )}
          </DialogContentText>
          {actionDialog && actionDialog.type === 'REJECTED' && (
            <TextField
              label="Rejection reason"
              fullWidth
              required
              multiline
              minRows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              autoFocus
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setActionDialog(null)} disabled={processing}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color={actionDialog && actionDialog.type === 'APPROVED' ? 'success' : 'error'}
            onClick={handleConfirmAction}
            disabled={processing}
          >
            {processing
              ? 'Processing...'
              : actionDialog && actionDialog.type === 'APPROVED'
              ? 'Confirm approval'
              : 'Confirm rejection'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveApprovalPage;
