import axiosInstance from './axiosInstance';

/**
 * GET /api/employees
 * Accessible to MANAGER and ADMIN
 * Response: ApiResponse<EmployeeResponse[]>
 */
export const getAllEmployees = () => {
  return axiosInstance.get('/api/employees');
};

/**
 * GET /api/employees/{id}
 * Accessible to MANAGER and ADMIN
 * Response: ApiResponse<EmployeeResponse>
 */
export const getEmployeeById = (id) => {
  return axiosInstance.get(`/api/employees/${id}`);
};

/**
 * GET /api/employees/me
 * Returns the profile of the currently authenticated employee
 * Response: ApiResponse<EmployeeResponse>
 */
export const getMyProfile = () => {
  return axiosInstance.get('/api/employees/me');
};

/**
 * POST /api/employees
 * Accessible only to ADMIN
 * Body: { name, email, password, department, designation, role }
 *   role enum: ROLE_EMPLOYEE | ROLE_MANAGER | ROLE_ADMIN
 * Response: ApiResponse<EmployeeResponse>
 */
export const createEmployee = (payload) => {
  return axiosInstance.post('/api/employees', payload);
};
