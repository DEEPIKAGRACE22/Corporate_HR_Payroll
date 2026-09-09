import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, Department, AttendanceRecord, LeaveRequest, LeaveBalance, PayrollRecord, Holiday, PerformanceNote } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = '/api';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Auth & Onboarding
  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/login`, credentials);
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, userData, { headers: this.getHeaders() });
  }

  getMe(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/me`, { headers: this.getHeaders() });
  }

  // Attendance
  clockIn(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance/clockin`, payload, { headers: this.getHeaders() });
  }

  clockOut(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/attendance/clockout`, payload, { headers: this.getHeaders() });
  }

  getMyAttendance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/my`, { headers: this.getHeaders() });
  }

  getTodayStatus(): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/today`, { headers: this.getHeaders() });
  }

  getAllAttendance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/attendance/all`, { headers: this.getHeaders() });
  }

  // Leaves
  applyLeave(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/leaves`, payload, { headers: this.getHeaders() });
  }

  getMyLeaves(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/my`, { headers: this.getHeaders() });
  }

  getPendingLeaves(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/pending`, { headers: this.getHeaders() });
  }

  decideLeave(leaveId: string, payload: { status: string; remarks: string }): Observable<any> {
    return this.http.put(`${this.baseUrl}/leaves/${leaveId}/decision`, payload, { headers: this.getHeaders() });
  }

  getMyBalances(): Observable<any> {
    return this.http.get(`${this.baseUrl}/leaves/balances/my`, { headers: this.getHeaders() });
  }

  // Payroll
  runPayroll(payload: { month: number; year: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/payroll/run`, payload, { headers: this.getHeaders() });
  }

  getPayslips(employeeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/employees/${employeeId}/payslips`, { headers: this.getHeaders() });
  }

  // Departments
  getDepartments(): Observable<any> {
    return this.http.get(`${this.baseUrl}/departments`, { headers: this.getHeaders() });
  }

  createDepartment(dept: { name: string; description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/departments`, dept, { headers: this.getHeaders() });
  }

  // Manager Team
  getTeamMembers(): Observable<any> {
    return this.http.get(`${this.baseUrl}/manager/team`, { headers: this.getHeaders() });
  }

  getTeamAttendance(): Observable<any> {
    return this.http.get(`${this.baseUrl}/manager/team-attendance`, { headers: this.getHeaders() });
  }

  // Holidays
  getHolidays(): Observable<any> {
    return this.http.get(`${this.baseUrl}/holidays`, { headers: this.getHeaders() });
  }

  createHoliday(holiday: { date: string; description: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/holidays`, holiday, { headers: this.getHeaders() });
  }

  // Performance Notes
  logPerformanceNote(payload: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/performance`, payload, { headers: this.getHeaders() });
  }

  getPerformanceNotes(employeeId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/performance/${employeeId}`, { headers: this.getHeaders() });
  }

  // HR Reports
  getAttendanceReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hr/reports/attendance`, { headers: this.getHeaders() });
  }

  getPayrollCostReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hr/reports/payroll-cost`, { headers: this.getHeaders() });
  }

  getSummaryReport(): Observable<any> {
    return this.http.get(`${this.baseUrl}/hr/reports/summary`, { headers: this.getHeaders() });
  }

  // Profile
  updateProfile(profile: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile`, profile, { headers: this.getHeaders() });
  }

  changePassword(passwords: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/profile/change-password`, passwords, { headers: this.getHeaders() });
  }
}
