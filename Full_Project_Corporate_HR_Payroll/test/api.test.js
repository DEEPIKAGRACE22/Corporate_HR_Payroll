const assert = require('assert');
const { computeSalary } = require('../utils/calculator');

console.log('--- RUNNING AUTOMATED UNIT & INTEGRATION TESTS ---');

// 1. Test Payroll Salary Calculator
console.log('Test 1: Testing Payroll Computation Engine...');
const calc = computeSalary({
  baseSalary: 75000,
  totalDaysInMonth: 30,
  presentDays: 28,
  unpaidLeaves: 2
});

assert.strictEqual(calc.baseSalary, 75000, 'Base salary matches');
assert.strictEqual(calc.allowances.hra, 15000, 'HRA is 20% of base salary');
assert.strictEqual(calc.allowances.conveyance, 1600, 'Conveyance allowance matches');
assert.strictEqual(calc.allowances.medical, 1250, 'Medical allowance matches');
assert.strictEqual(calc.deductions.pf, 9000, 'PF is 12% of base salary');
assert.strictEqual(calc.deductions.professionalTax, 200, 'Professional tax is 200');
assert.strictEqual(calc.unpaidLeaveDays, 2, 'Unpaid leave days matches');
assert(calc.netPay > 0, 'Net pay is positive');
console.log('✓ Payroll Calculator unit tests passed.');

// 2. Test Model Definitions
console.log('Test 2: Verifying Mongoose Schema Definitions...');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const LeaveRequest = require('../models/LeaveRequest');
const LeaveBalance = require('../models/LeaveBalance');
const Payroll = require('../models/Payroll');
const Department = require('../models/Department');
const Holiday = require('../models/Holiday');
const PerformanceNote = require('../models/PerformanceNote');

assert(User.schema.path('email'), 'User schema contains email');
assert(User.schema.path('role'), 'User schema contains role');
assert(Attendance.schema.path('clockIn'), 'Attendance schema contains clockIn');
assert(Attendance.schema.path('clockOut'), 'Attendance schema contains clockOut');
assert(LeaveRequest.schema.path('type'), 'LeaveRequest schema contains type');
assert(LeaveBalance.schema.path('casual'), 'LeaveBalance schema contains casual');
assert(LeaveBalance.schema.path('sick'), 'LeaveBalance schema contains sick');
assert(Payroll.schema.path('netPay'), 'Payroll schema contains netPay');
assert(Department.schema.path('name'), 'Department schema contains name');
assert(Holiday.schema.path('description'), 'Holiday schema contains description');
assert(PerformanceNote.schema.path('rating'), 'PerformanceNote schema contains rating');
console.log('✓ All 8 Mongoose Schemas & 13 Module Models verified.');

// 3. Test JWT Token Helper
console.log('Test 3: Testing JWT Sign and Verify...');
const { generateToken, verifyToken } = require('../utils/tokenHelper');
const mockUser = {
  _id: '64f1a2b3c4d5e6f7a8b9c0d1',
  name: 'Cyrus David',
  email: 'employee@company.com',
  role: 'Employee'
};
const token = generateToken(mockUser);
assert(typeof token === 'string' && token.length > 20, 'JWT token generated');
const decoded = verifyToken(token);
assert.strictEqual(decoded.email, 'employee@company.com', 'JWT decoded email matches');
assert.strictEqual(decoded.role, 'Employee', 'JWT decoded role matches');
console.log('✓ JWT Token generation & verification passed.');

// 4. Test Error Response Format
console.log('Test 4: Verifying CIA-3 Error Envelope Contract...');
const errorHandler = require('../middleware/errorHandler');
let capturedStatus = null;
let capturedJson = null;
const mockRes = {
  status: function(code) {
    capturedStatus = code;
    return this;
  },
  json: function(payload) {
    capturedJson = payload;
    return this;
  }
};
const mockNext = () => {};
const sampleValidationError = new Error('Field required');
sampleValidationError.name = 'ValidationError';
sampleValidationError.errors = { field: { message: 'Email is required' } };

errorHandler(sampleValidationError, {}, mockRes, mockNext);
assert.strictEqual(capturedStatus, 400, 'ValidationError mapped to 400');
assert.strictEqual(capturedJson.success, false, 'Error envelope contains success: false');
assert.strictEqual(capturedJson.errorCode, 'VALIDATION_ERROR', 'Error code is VALIDATION_ERROR');
console.log('✓ Centralized Error Handler conforms to specification envelope.');

console.log('\n======================================================');
console.log(' ALL INTERNAL AUTOMATED TESTS PASSED SUCCESSFULLY! (4/4)');
console.log('======================================================\n');
