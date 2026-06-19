# Employee Leave Management System — Frontend

React + Vite + Material UI frontend for the Leave Management API, generated from your
`/v3/api-docs` OpenAPI spec.

## Stack
- React 18 + Vite
- Material UI (MUI v5)
- Axios (with JWT interceptor)
- React Router v6
- JWT auth, token stored in `localStorage`

## Setup

```bash
npm install
npm run dev
```

The app runs on `http://localhost:5173` by default and expects your backend at
`http://localhost:8080` (configured in `.env` via `VITE_API_BASE_URL`).

## Project structure

```
src/
  api/                Axios calls, one file per API tag (auth, employee, leave)
  components/         Shared UI (AppLayout/sidebar, StatusChip, PageHeader, loading/empty states)
  context/AuthContext.jsx   Global auth state (token, user, login/logout, role check)
  routes/ProtectedRoute.jsx Route guard for auth + role-based access
  pages/
    LoginPage.jsx
    DashboardPage.jsx
    ApplyLeavePage.jsx
    MyLeavesPage.jsx
    LeaveApprovalPage.jsx   (MANAGER / ADMIN only)
    EmployeeManagementPage.jsx (MANAGER / ADMIN view, ADMIN-only create)
    NotFoundPage.jsx
  theme.js             MUI theme (indigo/slate palette, status colors)
  App.jsx              Routing
```

## API contract (from your OpenAPI spec)

All responses are wrapped: `{ success, message, data }`.

| Endpoint | Method | Notes |
|---|---|---|
| `/api/auth/login` | POST | `{email, password}` → `AuthResponse{token, type, employeeId, name, email, role}` |
| `/api/employees/me` | GET | Current user's profile (includes leave balances) |
| `/api/employees` | GET | All employees — MANAGER/ADMIN |
| `/api/employees` | POST | Create employee — ADMIN only. Role enum: `ROLE_EMPLOYEE`, `ROLE_MANAGER`, `ROLE_ADMIN` |
| `/api/employees/{id}` | GET | Single employee — MANAGER/ADMIN |
| `/api/leaves/my` | GET | Current user's leave history, optional `?status=` filter |
| `/api/leaves` | GET | All leave requests — MANAGER/ADMIN, optional `?status=` filter |
| `/api/leaves` | POST | Apply for leave: `{leaveType, startDate, endDate, reason}` |
| `/api/leaves/{id}` | GET | Single leave |
| `/api/leaves/{id}/action` | PUT | Approve/reject: `{status: 'APPROVED'|'REJECTED', rejectionReason?}` — MANAGER/ADMIN |
| `/api/leaves/{id}/cancel` | PUT | Employee cancels their own pending leave |

**Important — single token, no refresh endpoint:** your spec only returns one `token`
(JWT) on login, with no refresh-token flow. The app stores this token in `localStorage`
and attaches it as `Authorization: Bearer <token>` on every request via an Axios
interceptor. On any `401` response, the user is logged out and redirected to `/login`
(the JWT has expired or is invalid — there's nothing to refresh against, so re-login is
required). If you later add a refresh-token endpoint, update `src/context/AuthContext.jsx`
and `src/api/axiosInstance.js`.

**Role format:** the backend uses `ROLE_EMPLOYEE` / `ROLE_MANAGER` / `ROLE_ADMIN` for
employee creation, but the login response's `role` field in the example is the bare form
(`EMPLOYEE`). `AuthContext.hasRole()` normalizes both forms (strips the `ROLE_` prefix)
so role checks work either way — no changes needed unless your backend does something
different.

## Role-based access

- **EMPLOYEE**: Dashboard, Apply Leave, My Leaves
- **MANAGER / ADMIN**: above, plus Leave Approvals and Employee Management (view)
- **ADMIN only**: "Add employee" button on Employee Management

Routes are enforced both by the sidebar (items hidden if not permitted) and by
`ProtectedRoute` (direct URL access blocked with an Access Denied screen).

## If your backend differs from the spec

All API calls live in `src/api/*.js` with one function per endpoint and JSDoc comments
describing the expected request/response shape — these are the only files you should
need to touch if field names or routes change.
