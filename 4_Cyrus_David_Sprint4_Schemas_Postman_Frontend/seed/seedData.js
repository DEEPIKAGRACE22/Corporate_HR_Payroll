require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('../models/User');
const Department = require('../models/Department');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Payroll = require('../models/Payroll');
const Holiday = require('../models/Holiday');
const PerformanceNote = require('../models/PerformanceNote');

const seedDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/corporate_hr';
  console.log(`[Seed] Connecting to MongoDB at ${uri}...`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('[Seed] Connected to database successfully.');

    console.log('[Seed] Cleaning existing data...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Attendance.deleteMany({}),
      LeaveRequest.deleteMany({}),
      LeaveBalance.deleteMany({}),
      Payroll.deleteMany({}),
      Holiday.deleteMany({}),
      PerformanceNote.deleteMany({})
    ]);

    console.log('[Seed] Creating Departments...');
    const engDept = await Department.create({
      name: 'Engineering & Technology',
      description: 'Software development, infrastructure, and technical architecture.'
    });

    const hrDept = await Department.create({
      name: 'Human Resources & Talent',
      description: 'Employee lifecycle, benefits, compliance, and organizational culture.'
    });

    const finDept = await Department.create({
      name: 'Finance & Operations',
      description: 'Corporate budgeting, payroll disbursements, and fiscal compliance.'
    });

    console.log('[Seed] Hashing passwords for team members...');
    const adminHash = await bcrypt.hash('Admin@123', 10);
    const managerHash = await bcrypt.hash('Manager@123', 10);
    const cyrusHash = await bcrypt.hash('Employee@123', 10);
    const elizaHash = await bcrypt.hash('Eliza@123', 10);

    console.log('[Seed] Creating Team Users (Christa Fijo, Deepika Grace, Cyrus David, Eliza)...');
    // 1. HR Admin: Christa Fijo
    const christaAdmin = await User.create({
      name: 'Christa Fijo',
      email: 'admin@company.com',
      passwordHash: adminHash,
      role: 'HR Admin',
      departmentId: hrDept._id,
      designation: 'Chief Human Resources Officer',
      baseSalary: 110000,
      phone: '+91 98765 43210',
      address: 'Christ University Campus, Bangalore',
      emergencyContact: '+91 98765 00001'
    });

    // 2. Manager: Deepika Grace
    const deepikaManager = await User.create({
      name: 'Deepika Grace',
      email: 'manager@company.com',
      passwordHash: managerHash,
      role: 'Manager',
      departmentId: engDept._id,
      managerId: christaAdmin._id,
      designation: 'Engineering Lead & Architect',
      baseSalary: 95000,
      phone: '+91 98765 43211',
      address: 'Koramangala 4th Block, Bangalore',
      emergencyContact: '+91 98765 00002'
    });

    // 3. Employee 1: Cyrus David
    const cyrusEmployee = await User.create({
      name: 'Cyrus David',
      email: 'employee@company.com',
      passwordHash: cyrusHash,
      role: 'Employee',
      departmentId: engDept._id,
      managerId: deepikaManager._id,
      designation: 'Senior Full Stack Engineer',
      baseSalary: 75000,
      phone: '+91 98765 43212',
      address: 'Indiranagar 100ft Road, Bangalore',
      emergencyContact: '+91 98765 00003'
    });

    // 4. Employee 2: Eliza
    const elizaEmployee = await User.create({
      name: 'Eliza',
      email: 'eliza@company.com',
      passwordHash: elizaHash,
      role: 'Employee',
      departmentId: engDept._id,
      managerId: deepikaManager._id,
      designation: 'Frontend Application Specialist',
      baseSalary: 68000,
      phone: '+91 98765 43213',
      address: 'HSR Layout Sector 3, Bangalore',
      emergencyContact: '+91 98765 00004'
    });

    // Update department heads
    hrDept.headId = christaAdmin._id;
    await hrDept.save();
    engDept.headId = deepikaManager._id;
    await engDept.save();

    console.log('[Seed] Creating Leave Balances...');
    const allUsers = [christaAdmin, deepikaManager, cyrusEmployee, elizaEmployee];
    for (const u of allUsers) {
      await LeaveBalance.create({
        employeeId: u._id,
        casual: 10,
        sick: 10,
        earned: 15
      });
    }

    console.log('[Seed] Creating Company Holidays...');
    await Holiday.create([
      { date: '2026-01-01', description: "New Year's Day" },
      { date: '2026-01-26', description: 'Republic Day' },
      { date: '2026-05-01', description: 'International Workers Day' },
      { date: '2026-08-15', description: 'Independence Day' },
      { date: '2026-10-02', description: 'Mahatma Gandhi Jayanti' },
      { date: '2026-11-08', description: 'Diwali (Deepavali)' },
      { date: '2026-12-25', description: 'Christmas Day' }
    ]);

    console.log('[Seed] Creating Attendance Logs for past 10 working days...');
    const today = new Date();
    for (let i = 1; i <= 10; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      if (isWeekend) continue;

      for (const u of [deepikaManager, cyrusEmployee, elizaEmployee]) {
        await Attendance.create({
          employeeId: u._id,
          date: dateStr,
          clockIn: '09:15:00',
          clockOut: '17:45:00',
          status: 'Present',
          totalHours: 8.5
        });
      }
    }

    // Today's attendance for Cyrus David
    const todayStr = today.toISOString().split('T')[0];
    await Attendance.create({
      employeeId: cyrusEmployee._id,
      date: todayStr,
      clockIn: '09:05:00',
      status: 'Present'
    });

    console.log('[Seed] Creating Leave Requests...');
    await LeaveRequest.create({
      employeeId: cyrusEmployee._id,
      type: 'casual',
      fromDate: '2026-09-15',
      toDate: '2026-09-16',
      totalDays: 2,
      reason: 'Attending family celebration and academic seminar',
      status: 'Pending'
    });

    await LeaveRequest.create({
      employeeId: elizaEmployee._id,
      type: 'sick',
      fromDate: '2026-08-20',
      toDate: '2026-08-21',
      totalDays: 2,
      reason: 'Seasonal viral fever recuperation',
      status: 'Approved',
      approverId: deepikaManager._id,
      remarks: 'Reviewed and confirmed by authorized role'
    });

    console.log('[Seed] Creating Performance Notes...');
    await PerformanceNote.create({
      employeeId: cyrusEmployee._id,
      managerId: deepikaManager._id,
      note: 'Demonstrated outstanding ownership in architecting the core microservices and Mongoose data models.',
      rating: 5,
      date: '2026-08-30'
    });

    await PerformanceNote.create({
      employeeId: elizaEmployee._id,
      managerId: deepikaManager._id,
      note: 'Exceptional work designing the responsive Angular SPA interface and accessible dashboard components.',
      rating: 5,
      date: '2026-08-31'
    });

    console.log('[Seed] Generating Initial Payroll records for previous months...');
    // August Payroll
    for (const u of [deepikaManager, cyrusEmployee, elizaEmployee]) {
      const hra = Math.round(u.baseSalary * 0.2);
      const pf = Math.round(u.baseSalary * 0.12);
      const conveyance = 1600;
      const medical = 1250;
      const profTax = 200;
      const totalAllowances = hra + conveyance + medical;
      const totalDeductions = pf + profTax;
      const netPay = (u.baseSalary + totalAllowances) - totalDeductions;

      await Payroll.create({
        employeeId: u._id,
        month: 8,
        year: 2026,
        baseSalary: u.baseSalary,
        workingDays: 30,
        presentDays: 28,
        unpaidLeaveDays: 0,
        allowances: {
          hra,
          conveyance,
          medical,
          total: totalAllowances
        },
        deductions: {
          pf,
          professionalTax: profTax,
          unpaidLeaveDeductions: 0,
          total: totalDeductions
        },
        netPay,
        status: 'Generated'
      });
    }

    console.log('\n======================================================');
    console.log(' SEED DATA GENERATION COMPLETE');
    console.log('======================================================');
    console.log('Demo Accounts:');
    console.log('  1. HR Admin : admin@company.com    / Admin@123    (Christa Fijo)');
    console.log('  2. Manager  : manager@company.com  / Manager@123  (Deepika Grace)');
    console.log('  3. Employee : employee@company.com / Employee@123 (Cyrus David)');
    console.log('  4. Employee : eliza@company.com    / Eliza@123    (Eliza)');
    console.log('======================================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err.message);
    process.exit(1);
  }
};

seedDB();
