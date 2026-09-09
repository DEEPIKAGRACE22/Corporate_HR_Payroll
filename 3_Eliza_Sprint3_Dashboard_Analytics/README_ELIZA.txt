================================================================================
ELIZA - SPRINT 3 (REPORTING & POLISH) MODULES
Project: Corporate HR & Payroll Management System (P04)
Course: 5th Semester • Christ University • CIA-3 Project Development
================================================================================

YOUR ASSIGNED FUNCTIONAL MODULES:
9. Manager Team Dashboard
   - Files: controllers/managerController.js, routes/managerRoutes.js
   - Features: Managers view their direct reports, real-time team attendance today, and pending leaves.

10. Holiday Calendar Management
    - Files: controllers/holidayController.js, routes/holidayRoutes.js
    - Features: HR defines company non-working holidays affecting attendance.

11. Performance Note Logging
    - Files: controllers/performanceController.js, routes/performanceRoutes.js
    - Features: Managers log periodic performance notes and 1-5 star ratings for direct reports.

12. HR Reports & Analytics
    - Files: controllers/reportController.js, routes/reportRoutes.js
    - Features: Department-wise attendance percentages, monthly salary costs, and headcount metrics.

13. Role-Based Access Control (RBAC)
    - Files: middleware/auth.js
    - Features: Distinct authorization permissions for Employee, Manager, and HR Admin roles.

VIVA VOCE TIP FOR ELIZA:
- When asked: "How is Role-Based Access Control (RBAC) enforced?"
  Explain: "We use a reusable higher-order middleware in middleware/auth.js called `authorize(...allowedRoles)`. It inspects `req.user.role` from the validated JWT and returns a 403 FORBIDDEN if the user's role is not permitted."
- When asked about HR Reports:
  Explain: "In reportController.js, we aggregate data across departments to compute attendance percentages and total payroll expenditures without relational join bottlenecks."
================================================================================
