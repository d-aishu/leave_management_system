export const LEAVE_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
};

export const LEAVE_TYPES = [
  { value: 'ANNUAL', label: 'Annual Leave' },
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'CASUAL', label: 'Casual Leave' },
  { value: 'MATERNITY', label: 'Maternity Leave' },
  { value: 'PATERNITY', label: 'Paternity Leave' },
  { value: 'UNPAID', label: 'Unpaid Leave' }
];

export const ROLES = [
  { value: 'ROLE_EMPLOYEE', label: 'Employee' },
  { value: 'ROLE_MANAGER', label: 'Manager' },
  { value: 'ROLE_ADMIN', label: 'Admin' }
];

export const statusColor = (status) => {
  switch (status) {
    case 'APPROVED':
      return 'success';
    case 'REJECTED':
      return 'error';
    case 'CANCELLED':
      return 'default';
    case 'PENDING':
    default:
      return 'warning';
  }
};

export const formatRole = (role) => {
  if (!role) return '';
  return role.replace('ROLE_', '');
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export const formatDateTime = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const extractErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};
