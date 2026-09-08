/**
 * Computes monthly salary breakdown based on base pay, attendance, and unpaid leaves.
 */
function computeSalary({ baseSalary, totalDaysInMonth = 30, presentDays = 30, unpaidLeaves = 0 }) {
  const perDaySalary = baseSalary / totalDaysInMonth;
  const leaveDeductions = Math.round(unpaidLeaves * perDaySalary);
  
  // Standard statutory and benefit rates
  const hra = Math.round(baseSalary * 0.20); // 20% HRA
  const conveyance = 1600; // standard conveyance allowance
  const medical = 1250; // standard medical allowance
  const grossAllowances = hra + conveyance + medical;

  const pf = Math.round(baseSalary * 0.12); // 12% Provident Fund
  const professionalTax = 200; // Fixed professional tax
  const grossDeductions = pf + professionalTax + leaveDeductions;

  const netPay = Math.round((baseSalary + grossAllowances) - grossDeductions);

  return {
    baseSalary,
    workingDays: totalDaysInMonth,
    presentDays,
    unpaidLeaveDays: unpaidLeaves,
    allowances: {
      hra,
      conveyance,
      medical,
      total: grossAllowances
    },
    deductions: {
      pf,
      professionalTax,
      unpaidLeaveDeductions: leaveDeductions,
      total: grossDeductions
    },
    netPay
  };
}

module.exports = { computeSalary };
