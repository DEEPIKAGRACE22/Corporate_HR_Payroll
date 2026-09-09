================================================================================
CHRISTA FIJO - SPRINT 1 (FOUNDATION) MODULES
Project: Corporate HR & Payroll Management System (P04)
Course: 5th Semester • Christ University • CIA-3 Project Development
================================================================================

YOUR ASSIGNED FUNCTIONAL MODULES:
1. Employee Onboarding & Authentication
   - Files: controllers/authController.js, routes/authRoutes.js, middleware/auth.js
   - Features: HR Admin only registration, bcrypt password hashing, JWT token creation, getMe endpoint.

2. Department & Designation Management
   - Files: controllers/departmentController.js, routes/departmentRoutes.js
   - Features: Full CRUD for organizational structure, department head assignment.

3. Daily Attendance Tracking
   - Files: controllers/attendanceController.js, routes/attendanceRoutes.js
   - Features: Clock-in/out endpoints, prevents duplicate clock-in on same day, calculates hours, late logic.

4. Leave Request & Approval Workflow
   - Files: controllers/leaveController.js, routes/leaveRoutes.js
   - Features: Leave application, date range validation (fromDate <= toDate), overlapping leave check, manager approve/reject decision.

