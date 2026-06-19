import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Button,
  Alert,
  CircularProgress
} from '@mui/material';
import PageHeader from '../components/PageHeader';
import { LEAVE_TYPES, extractErrorMessage } from '../utils/helpers';
import { applyLeave } from '../api/leaveApi';

const todayStr = () => new Date().toISOString().split('T')[0];

const calcDays = (start, end) => {
  if (!start || !end) return 0;
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime()) || e < s) return 0;
  return Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
};

const ApplyLeavePage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    leaveType: 'ANNUAL',
    startDate: todayStr(),
    endDate: todayStr(),
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const totalDays = useMemo(() => calcDays(form.startDate, form.endDate), [form.startDate, form.endDate]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.leaveType) errs.leaveType = 'Select a leave type.';
    if (!form.startDate) errs.startDate = 'Start date is required.';
    if (!form.endDate) errs.endDate = 'End date is required.';
    if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
      errs.endDate = 'End date cannot be before the start date.';
    }
    if (!form.reason || form.reason.trim().length < 10) {
      errs.reason = 'Reason must be at least 10 characters.';
    } else if (form.reason.length > 500) {
      errs.reason = 'Reason cannot exceed 500 characters.';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await applyLeave({
        leaveType: form.leaveType,
        startDate: form.startDate,
        endDate: form.endDate,
        reason: form.reason.trim()
      });
      setSuccess(true);
      setTimeout(() => navigate('/my-leaves'), 900);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not submit your leave request.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Apply for leave" subtitle="Submit a new leave request for approval." />

      <Paper variant="outlined" sx={{ p: { xs: 2.5, sm: 4 }, borderRadius: 3, maxWidth: 720 }}>
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Leave application submitted successfully. Redirecting to your leave history…
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Leave type"
                fullWidth
                required
                value={form.leaveType}
                onChange={handleChange('leaveType')}
                error={!!fieldErrors.leaveType}
                helperText={fieldErrors.leaveType}
              >
                {LEAVE_TYPES.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Total days"
                fullWidth
                value={totalDays > 0 ? totalDays : '—'}
                InputProps={{ readOnly: true }}
                helperText="Calculated automatically from your dates"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Start date"
                type="date"
                fullWidth
                required
                value={form.startDate}
                onChange={handleChange('startDate')}
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.startDate}
                helperText={fieldErrors.startDate}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="End date"
                type="date"
                fullWidth
                required
                value={form.endDate}
                onChange={handleChange('endDate')}
                InputLabelProps={{ shrink: true }}
                error={!!fieldErrors.endDate}
                helperText={fieldErrors.endDate}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason"
                fullWidth
                required
                multiline
                minRows={4}
                value={form.reason}
                onChange={handleChange('reason')}
                error={!!fieldErrors.reason}
                helperText={fieldErrors.reason || `${form.reason.length}/500 characters (minimum 10)`}
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 3.5 }}>
            <Button variant="text" onClick={() => navigate('/dashboard')} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ minWidth: 160 }}>
              {submitting ? <CircularProgress size={22} color="inherit" /> : 'Submit request'}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default ApplyLeavePage;
