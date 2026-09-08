================================================================================
DEEPIKA GRACE - SPRINT 2 (CORE WORKFLOW) MODULES
Project: Corporate HR & Payroll Management System (P04)
Course: 5th Semester • Christ University • CIA-3 Project Development
================================================================================

YOUR ASSIGNED FUNCTIONAL MODULES:
5. Leave Balance Management
   - Files: models/LeaveBalance.js, controllers/leaveController.js
   - Features: Tracking casual (10), sick (10), and earned (15) quotas; auto-deduction upon manager approval.

6. Payroll Computation Engine
   - Files: utils/calculator.js, controllers/payrollController.js, routes/payrollRoutes.js
   - Features: Monthly automated salary computation based on base pay, attendance days, 20% HRA, 12% PF, and professional tax.

7. Payslip Generation Records
   - Files: controllers/payrollController.js, routes/payrollRoutes.js, routes/employeeRoutes.js
   - Features: Immutable monthly payroll records queryable by employee (`GET /api/employees/:id/payslips`).

8. Employee Self-Service Profile
   - Files: controllers/employeeController.js, routes/employeeRoutes.js
   - Features: Personal info updates (phone, address, emergency contact) and password update.

VIVA VOCE TIP FOR DEEPIKA:
- When asked: "How does your payroll calculation engine work?"
  Explain: "In utils/calculator.js, per-day salary is calculated from base salary and working days. We compute statutory allowances (20% HRA, conveyance, medical) and deductions (12% PF, Rs 200 professional tax, unpaid leaves). Net pay is Gross Earnings minus Total Deductions."
- When asked about Leave Balances:
  Explain: "When a manager approves a leave request in leaveController.js, the system looks up the employee's LeaveBalance and automatically decrements the specific leave type balance."
================================================================================
