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
  Button,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  Chip,
  CircularProgress,
  useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import PageHeader from '../components/PageHeader';
import { LoadingState, EmptyState } from '../components/StateViews';
import { useAuth } from '../context/AuthContext';
import { getAllEmployees, createEmployee } from '../api/employeeApi';
import { ROLES, formatRole, formatDate, extractErrorMessage } from '../utils/helpers';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  department: '',
  designation: '',
  role: 'ROLE_EMPLOYEE'
};

const EmployeeManagementPage = () => {
  const { hasRole } = useAuth();
  const isAdmin = hasRole('ADMIN');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadEmployees = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAllEmployees();
      setEmployees(res.data.data || []);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not load employees.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  const openCreateDialog = () => {
    setForm(emptyForm);
    setFormErrors({});
    setFormError('');
    setDialogOpen(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.email.trim()) errs.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(form.email)) errs.email = 'Enter a valid email.';
    if (!form.password || form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (!form.role) errs.role = 'Select a role.';
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;

    setSubmitting(true);
    try {
      await createEmployee(form);
      setSuccessMsg(`${form.name} was added successfully.`);
      setDialogOpen(false);
      loadEmployees();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Could not create this employee.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Employees"
        subtitle="View and manage employee accounts."
        action={
          isAdmin && (
            <Button
              variant="contained"
              startIcon={<PersonAddAltOutlinedIcon />}
              onClick={openCreateDialog}
            >
              Add employee
            </Button>
          )
        }
      />

      {successMsg && (
        <Alert severity="success" sx={{ mb: 2.5 }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert severity="error" sx={{ mb: 2.5 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading ? (
          <LoadingState label="Loading employees..." />
        ) : employees.length === 0 ? (
          <EmptyState title="No employees found" />
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size={isMobile ? 'small' : 'medium'}>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Designation</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Annual</TableCell>
                  <TableCell>Sick</TableCell>
                  <TableCell>Casual</TableCell>
                  <TableCell>Joined</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {employees.map((emp) => (
                  <TableRow key={emp.id} hover>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell>{emp.email}</TableCell>
                    <TableCell>{emp.department || '-'}</TableCell>
                    <TableCell>{emp.designation || '-'}</TableCell>
                    <TableCell>
                      <Chip label={formatRole(emp.role)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{emp.annualBalance}</TableCell>
                    <TableCell>{emp.sickBalance}</TableCell>
                    <TableCell>{emp.casualBalance}</TableCell>
                    <TableCell>{formatDate(emp.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add a new employee</DialogTitle>
        <DialogContent>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Box component="form" id="create-employee-form" onSubmit={handleCreate} noValidate sx={{ mt: 1 }}>
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Full name"
                  fullWidth
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={form.email}
                  onChange={handleChange('email')}
                  error={!!formErrors.email}
                  helperText={formErrors.email}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Password"
                  type="password"
                  fullWidth
                  required
                  value={form.password}
                  onChange={handleChange('password')}
                  error={!!formErrors.password}
                  helperText={formErrors.password || 'At least 6 characters'}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  label="Role"
                  fullWidth
                  required
                  value={form.role}
                  onChange={handleChange('role')}
                  error={!!formErrors.role}
                  helperText={formErrors.role}
                >
                  {ROLES.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      {r.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Department"
                  fullWidth
                  value={form.department}
                  onChange={handleChange('department')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Designation"
                  fullWidth
                  value={form.designation}
                  onChange={handleChange('designation')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDialogOpen(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-employee-form"
            variant="contained"
            disabled={submitting}
            sx={{ minWidth: 140 }}
          >
            {submitting ? <CircularProgress size={20} color="inherit" /> : 'Create employee'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmployeeManagementPage;
