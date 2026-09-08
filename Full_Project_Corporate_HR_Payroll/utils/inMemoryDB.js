// In-Memory Fallback Database populated with realistic CIA-3 seed data
const inMemoryDB = {
  users: [
    {
      _id: "64f1a2b3c4d5e6f7a8b9c001",
      name: "Christa Fijo",
      email: "admin@company.com",
      role: "HR Admin",
      designation: "Chief Human Resources Officer",
      departmentId: { _id: "dept_hr", name: "Human Resources & Talent" },
      baseSalary: 110000,
      phone: "+91 98765 43210",
      address: "Christ University Campus, Bangalore",
      emergencyContact: "+91 98765 00001"
    },
    {
      _id: "64f1a2b3c4d5e6f7a8b9c002",
      name: "Deepika Grace",
      email: "manager@company.com",
      role: "Manager",
      designation: "Engineering Lead & Architect",
      departmentId: { _id: "dept_eng", name: "Engineering & Technology" },
      baseSalary: 95000,
      phone: "+91 98765 43211",
      address: "Koramangala 4th Block, Bangalore",
      emergencyContact: "+91 98765 00002"
    },
    {
      _id: "64f1a2b3c4d5e6f7a8b9c003",
      name: "Cyrus David",
      email: "employee@company.com",
      role: "Employee",
      designation: "Senior Full Stack Engineer",
      departmentId: { _id: "dept_eng", name: "Engineering & Technology" },
      managerId: { _id: "64f1a2b3c4d5e6f7a8b9c002", name: "Deepika Grace", email: "manager@company.com" },
      baseSalary: 75000,
      phone: "+91 98765 43212",
      address: "Indiranagar 100ft Road, Bangalore",
      emergencyContact: "+91 98765 00003"
    },
    {
      _id: "64f1a2b3c4d5e6f7a8b9c004",
      name: "Eliza",
      email: "eliza@company.com",
      role: "Employee",
      designation: "Frontend Application Specialist",
      departmentId: { _id: "dept_eng", name: "Engineering & Technology" },
      managerId: { _id: "64f1a2b3c4d5e6f7a8b9c002", name: "Deepika Grace", email: "manager@company.com" },
      baseSalary: 68000,
      phone: "+91 98765 43213",
      address: "HSR Layout Sector 3, Bangalore",
      emergencyContact: "+91 98765 00004"
    }
  ],

  departments: [
    { _id: "dept_eng", name: "Engineering & Technology", headId: { name: "Deepika Grace" }, description: "Core software engineering, architecture, and infrastructure." },
    { _id: "dept_hr", name: "Human Resources & Talent", headId: { name: "Christa Fijo" }, description: "Employee relations, recruitment, and organizational culture." },
    { _id: "dept_fin", name: "Finance & Operations", headId: null, description: "Budgeting, fiscal audit, and corporate payroll disbursement." }
  ],

  attendance: [
    { _id: "att_1", employeeId: "64f1a2b3c4d5e6f7a8b9c003", date: "2026-09-05", clockIn: "09:05:00", clockOut: "17:45:00", status: "Present", totalHours: 8.67 },
    { _id: "att_2", employeeId: "64f1a2b3c4d5e6f7a8b9c003", date: "2026-09-04", clockIn: "09:12:00", clockOut: "17:35:00", status: "Present", totalHours: 8.38 },
    { _id: "att_3", employeeId: "64f1a2b3c4d5e6f7a8b9c003", date: "2026-09-03", clockIn: "09:35:00", clockOut: "18:00:00", status: "Late", totalHours: 8.42 },
    { _id: "att_4", employeeId: "64f1a2b3c4d5e6f7a8b9c003", date: "2026-09-02", clockIn: "09:00:00", clockOut: "17:30:00", status: "Present", totalHours: 8.50 },
    { _id: "att_5", employeeId: "64f1a2b3c4d5e6f7a8b9c003", date: "2026-09-01", clockIn: "09:02:00", clockOut: "17:30:00", status: "Present", totalHours: 8.46 }
  ],

  leaves: [
    {
      _id: "leave_1",
      employeeId: { _id: "64f1a2b3c4d5e6f7a8b9c003", name: "Cyrus David", email: "employee@company.com", designation: "Senior Engineer" },
      type: "casual",
      fromDate: "2026-09-18",
      toDate: "2026-09-19",
      totalDays: 2,
      reason: "Family milestone event and technical seminar",
      status: "Pending",
      createdAt: new Date().toISOString()
    },
    {
      _id: "leave_2",
      employeeId: { _id: "64f1a2b3c4d5e6f7a8b9c004", name: "Eliza", email: "eliza@company.com", designation: "Frontend Specialist" },
      type: "sick",
      fromDate: "2026-08-20",
      toDate: "2026-08-21",
      totalDays: 2,
      reason: "Viral recuperation",
      status: "Approved",
      remarks: "Reviewed and confirmed by authorized role",
      createdAt: new Date(Date.now() - 86400000 * 15).toISOString()
    }
  ],

  balances: {
    "64f1a2b3c4d5e6f7a8b9c001": { casual: 10, sick: 10, earned: 15 },
    "64f1a2b3c4d5e6f7a8b9c002": { casual: 10, sick: 10, earned: 15 },
    "64f1a2b3c4d5e6f7a8b9c003": { casual: 8, sick: 10, earned: 15 },
    "64f1a2b3c4d5e6f7a8b9c004": { casual: 10, sick: 8, earned: 15 }
  },

  holidays: [
    { _id: "hol_1", date: "2026-01-01", description: "New Year's Day" },
    { _id: "hol_2", date: "2026-01-26", description: "Republic Day" },
    { _id: "hol_3", date: "2026-05-01", description: "International Workers' Day" },
    { _id: "hol_4", date: "2026-08-15", description: "Independence Day" },
    { _id: "hol_5", date: "2026-10-02", description: "Mahatma Gandhi Jayanti" },
    { _id: "hol_6", date: "2026-11-08", description: "Diwali (Deepavali)" },
    { _id: "hol_7", date: "2026-12-25", description: "Christmas Day" }
  ],

  payrolls: [
    {
      _id: "pay_1",
      employeeId: { _id: "64f1a2b3c4d5e6f7a8b9c003", name: "Cyrus David", designation: "Senior Full Stack Engineer" },
      month: 8,
      year: 2026,
      baseSalary: 75000,
      workingDays: 30,
      presentDays: 28,
      unpaidLeaveDays: 0,
      allowances: { hra: 15000, conveyance: 1600, medical: 1250, total: 17850 },
      deductions: { pf: 9000, professionalTax: 200, unpaidLeaveDeductions: 0, total: 9200 },
      netPay: 83650,
      status: "Generated"
    },
    {
      _id: "pay_2",
      employeeId: { _id: "64f1a2b3c4d5e6f7a8b9c004", name: "Eliza", designation: "Frontend Application Specialist" },
      month: 8,
      year: 2026,
      baseSalary: 68000,
      workingDays: 30,
      presentDays: 28,
      unpaidLeaveDays: 0,
      allowances: { hra: 13600, conveyance: 1600, medical: 1250, total: 16450 },
      deductions: { pf: 8160, professionalTax: 200, unpaidLeaveDeductions: 0, total: 8360 },
      netPay: 76090,
      status: "Generated"
    }
  ],

  performanceNotes: [
    {
      _id: "perf_1",
      employeeId: "64f1a2b3c4d5e6f7a8b9c003",
      managerId: "64f1a2b3c4d5e6f7a8b9c002",
      note: "Exceptional architecture on backend models and zero-defect attendance tracking.",
      rating: 5,
      date: "2026-08-30"
    },
    {
      _id: "perf_2",
      employeeId: "64f1a2b3c4d5e6f7a8b9c004",
      managerId: "64f1a2b3c4d5e6f7a8b9c002",
      note: "Great work building responsive UI and intuitive modal dialogs.",
      rating: 5,
      date: "2026-08-31"
    }
  ]
};

module.exports = inMemoryDB;
