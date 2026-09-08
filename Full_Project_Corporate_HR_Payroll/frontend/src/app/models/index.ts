export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'Employee' | 'Manager' | 'HR Admin';
  departmentId?: string | { _id: string; name: string };
  managerId?: string | { _id: string; name: string; email: string };
  designation: string;
  baseSalary: number;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  createdAt?: string;
}

export interface Department {
  _id: string;
  name: string;
  headId?: string | { _id: string; name: string; email: string };
  description?: string;
}

export interface AttendanceRecord {
  _id: string;
  employeeId: string | User;
  date: string;
  clockIn?: string;
  clockOut?: string;
  status: 'Present' | 'Late' | 'Half-Day' | 'Absent' | 'On Leave';
  totalHours?: number;
}

export interface LeaveRequest {
  _id: string;
  employeeId: string | User;
  type: 'casual' | 'sick' | 'earned';
  fromDate: string;
  toDate: string;
  totalDays: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approverId?: string | User;
  remarks?: string;
  createdAt?: string;
}

export interface LeaveBalance {
  _id: string;
  employeeId: string;
  casual: number;
  sick: number;
  earned: number;
}

export interface PayrollRecord {
  _id: string;
  employeeId: string | User;
  month: number;
  year: number;
  baseSalary: number;
  workingDays: number;
  presentDays: number;
  unpaidLeaveDays: number;
  allowances: {
    hra: number;
    conveyance: number;
    medical: number;
    total: number;
  };
  deductions: {
    pf: number;
    professionalTax: number;
    unpaidLeaveDeductions: number;
    total: number;
  };
  netPay: number;
  status: 'Generated' | 'Paid';
}

export interface Holiday {
  _id: string;
  date: string;
  description: string;
}

export interface PerformanceNote {
  _id: string;
  employeeId: string;
  managerId: string | User;
  note: string;
  date: string;
  rating: number;
}
