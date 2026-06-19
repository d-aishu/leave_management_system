import axiosInstance from './axiosInstance';

/**
 * GET /api/leaves?status=PENDING
 * Accessible to MANAGER and ADMIN. Returns ALL leave requests.
 * Response: ApiResponse<LeaveResponse[]>
 */
export const getAllLeaves = (status) => {
  return axiosInstance.get('/api/leaves', {
    params: status ? { status } : {}
  });
};

/**
 * GET /api/leaves/my?status=PENDING
 * Returns leave history of the currently logged-in employee.
 * Response: ApiResponse<LeaveResponse[]>
 */
export const getMyLeaves = (status) => {
  return axiosInstance.get('/api/leaves/my', {
    params: status ? { status } : {}
  });
};

/**
 * GET /api/leaves/{id}
 * Response: ApiResponse<LeaveResponse>
 */
export const getLeaveById = (id) => {
  return axiosInstance.get(`/api/leaves/${id}`);
};

/**
 * POST /api/leaves
 * Body: { leaveType, startDate, endDate, reason }
 *   leaveType enum: ANNUAL | SICK | CASUAL | MATERNITY | PATERNITY | UNPAID
 *   startDate/endDate format: YYYY-MM-DD
 *   reason: 10-500 chars
 * Response: ApiResponse<LeaveResponse>
 */
export const applyLeave = (payload) => {
  return axiosInstance.post('/api/leaves', payload);
};

/**
 * PUT /api/leaves/{id}/action
 * Body: { status: 'APPROVED' | 'REJECTED', rejectionReason? }
 * Accessible to MANAGER and ADMIN
 * Response: ApiResponse<LeaveResponse>
 */
export const processLeave = (id, status, rejectionReason) => {
  return axiosInstance.put(`/api/leaves/${id}/action`, {
    status,
    ...(rejectionReason ? { rejectionReason } : {})
  });
};

/**
 * PUT /api/leaves/{id}/cancel
 * Employee cancels their own pending leave request.
 * Response: ApiResponse<LeaveResponse>
 */
export const cancelLeave = (id) => {
  return axiosInstance.put(`/api/leaves/${id}/cancel`);
};
