================================================================================
CYRUS DAVID - SPRINT 4 (INTEGRATION & QA) MODULES
Project: Corporate HR & Payroll Management System (P04)
Course: 5th Semester • Christ University • CIA-3 Project Development
================================================================================

YOUR ASSIGNED FUNCTIONAL MODULES:
- MongoDB Schema Design & Indexing
  - Files: models/User.js, Department.js, Attendance.js, LeaveRequest.js, LeaveBalance.js, Payroll.js, Holiday.js, PerformanceNote.js
  - Features: Proper Mongoose schema types, foreign key references, and single-field & compound indexes ({ email: 1 }, { employeeId: 1, date: 1 }).

- Automated Database Seeder
  - Files: seed/seedData.js
  - Features: Realistic pre-populated data for departments, 4 demo users, attendance logs, leave requests, holidays, and past payroll.

- Postman Collection & Automated API Test Suite
  - Files: postman/corporate_hr_payroll.postman_collection.json, test/api.test.js
  - Features: Full coverage of all 13 modules, happy paths, 400 validation failures, 401 unauthenticated, 403 forbidden, and 404 not found.

- Frontend SPA Integration
  - Files: public/index.html, public/app.js, public/styles.css, frontend/
  - Features: Modern Angular/JavaScript Single Page Application with 1-click role switcher, clock-in widget, printable payslips, and HR analytics.

VIVA VOCE TIP FOR CYRUS:
- When asked: "Why did you choose referencing vs embedding in MongoDB?"
  Explain: "We referenced independent, frequently-queried collections like User, Attendance, and LeaveRequest using ObjectIds to prevent unbounded document growth. We embedded allowances and deductions inside Payroll because a payslip is an immutable snapshot at computation time."
- When asked about indexes:
  Explain: "We indexed email in users for fast login lookups, and employeeId across attendance, leaves, and payroll to speed up relational foreign-key queries."
================================================================================
