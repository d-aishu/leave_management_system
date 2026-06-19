import axiosInstance from './axiosInstance';

/**
 * POST /api/auth/login
 * Body: { email, password }
 * Response: ApiResponse<AuthResponse>
 *   AuthResponse: { token, type, employeeId, name, email, role }
 */
export const login = (email, password) => {
  return axiosInstance.post('/api/auth/login', { email, password });
};
