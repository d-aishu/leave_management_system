import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Grid, Paper, Typography, Button, Stack, Divider, Alert } from '@mui/material';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import HourglassEmptyOutlinedIcon from '@mui/icons-material/HourglassEmptyOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../api/employeeApi';
import { getMyLeaves, getAllLeaves } from '../api/leaveApi';
import PageHeader from '../components/PageHeader';
import StatusChip from '../components/StatusChip';
import { LoadingState, EmptyState } from '../components/StateViews';
import { formatDate, extractErrorMessage } from '../utils/helpers';

const StatCard = ({ icon, label, value, accent }) => (
  <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, height: '100%' }}>
    <Stack direction="row" alignItems="center" spacing={2}>
      <Box
        sx={{
          width: 46,
          height: 46,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: accent,
          color: '#fff',
          flexShrink: 0
        }}
      >
        {icon}
      </Box>
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.1 }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

const DashboardPage = () => {
  const { user, hasRole } = useAuth();
  const navigate = useNavigate();
  const isApprover = hasRole('MANAGER', 'ADMIN');

  const [profile, setProfile] = useState(null);
  const [myLeaves, setMyLeaves] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const requests = [getMyProfile(), getMyLeaves()];
      if (isApprover) {
        requests.push(getAllLeaves('PENDING'));
      }
      const results = await Promise.all(requests);

      setProfile(results[0].data.data);
      setMyLeaves(results[1].data.data || []);
      if (isApprover) {
        setPendingApprovals(results[2].data.data || []);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load dashboard data.'));
    } finally {
      setLoading(false);
    }
  }, [isApprover]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) return <LoadingState label="Loading your dashboard…" />;

  const pendingCount = myLeaves.filter((l) => l.status === 'PENDING').length;
  const approvedCount = myLeaves.filter((l) => l.status === 'APPROVED').length;
  const recentLeaves = [...myLeaves]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 5);

  return (
    <Box>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || ''}`}
        subtitle="Here's an overview of your leave status."
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

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={2.5} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventAvailableOutlinedIcon />}
            label="Annual balance"
            value={profile?.annualBalance ?? '—'}
            accent="primary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<EventAvailableOutlinedIcon />}
            label="Sick balance"
            value={profile?.sickBalance ?? '—'}
            accent="secondary.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<HourglassEmptyOutlinedIcon />}
            label="My pending requests"
            value={pendingCount}
            accent="warning.main"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            icon={<CheckCircleOutlineIcon />}
            label="My approved requests"
            value={approvedCount}
            accent="success.main"
          />
        </Grid>
      </Grid>

      {isApprover && (
        <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3, mb: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
            <Stack direction="row" alignItems="center" spacing={1.2}>
              <GroupOutlinedIcon color="primary" />
              <Typography variant="subtitle1">Team requests awaiting your action</Typography>
            </Stack>
            <Button size="small" onClick={() => navigate('/leave-approvals')}>
              View all
            </Button>
          </Stack>
          <Divider sx={{ mb: 1.5 }} />
          {pendingApprovals.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No pending requests right now — you're all caught up.
            </Typography>
          ) : (
            <Stack spacing={1.2}>
              {pendingApprovals.slice(0, 5).map((leave) => (
                <Stack
                  key={leave.id}
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ py: 0.5 }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {leave.employeeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {leave.leaveType} · {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </Typography>
                  </Box>
                  <StatusChip status={leave.status} />
                </Stack>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Typography variant="subtitle1">My recent leave requests</Typography>
          <Button size="small" onClick={() => navigate('/my-leaves')}>
            View all
          </Button>
        </Stack>
        <Divider sx={{ mb: 1.5 }} />
        {recentLeaves.length === 0 ? (
          <EmptyState
            title="No leave requests yet"
            subtitle="When you apply for leave, your requests will show up here."
          />
        ) : (
          <Stack spacing={1.2}>
            {recentLeaves.map((leave) => (
              <Stack
                key={leave.id}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ py: 0.5 }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {leave.leaveType} · {leave.totalDays} day{leave.totalDays === 1 ? '' : 's'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                  </Typography>
                </Box>
                <StatusChip status={leave.status} />
              </Stack>
            ))}
          </Stack>
        )}
      </Paper>
    </Box>
  );
};

export default DashboardPage;
