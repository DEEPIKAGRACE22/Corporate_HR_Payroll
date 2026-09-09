// State Management
const DEMO_ACCOUNTS = {
  admin: { email: 'admin@company.com', password: 'Admin@123', name: 'Christa Fijo', role: 'HR Admin' },
  manager: { email: 'manager@company.com', password: 'Manager@123', name: 'Deepika Grace', role: 'Manager' },
  employee: { email: 'employee@company.com', password: 'Employee@123', name: 'Cyrus David', role: 'Employee' },
  eliza: { email: 'eliza@company.com', password: 'Eliza@123', name: 'Eliza', role: 'Employee' }
};

let currentUser = null;
let currentToken = null;
let currentRoleKey = 'employee';
let teamMembersCache = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  startClock();
  await switchUser('employee'); // Default active user
});

// Toast Helper
function showToast(msg, isError = false) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.style.background = isError ? '#ef4444' : '#1e293b';
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

// Live Clock
function startClock() {
  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('today-date-str');
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toTimeString().split(' ')[0];
    dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' });
  }, 1000);
}

// Switch Demo User
async function switchUser(roleKey) {
  currentRoleKey = roleKey;
  const creds = DEMO_ACCOUNTS[roleKey];
  
  // Highlight active pill
  document.querySelectorAll('.pill-btn').forEach(btn => btn.classList.remove('active'));
  const activePill = document.getElementById(`pill-${roleKey}`);
  if (activePill) activePill.classList.add('active');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: creds.email, password: creds.password })
    });
    const data = await res.json();
    if (!data.success) {
      // Fallback: If DB seed is not loaded, construct local mock
      currentUser = {
        _id: 'mock_' + roleKey,
        name: creds.name,
        email: creds.email,
        role: creds.role,
        designation: roleKey === 'admin' ? 'CHRO' : (roleKey === 'manager' ? 'Lead' : 'Engineer'),
        baseSalary: 75000
      };
      currentToken = 'mock_jwt_token';
    } else {
      currentToken = data.data.token;
      currentUser = data.data.user;
    }

    updateUserUI();
    await refreshAllData();
    showToast(`Switched account to ${currentUser.name} (${currentUser.role})`);
  } catch (e) {
    console.error('Login error:', e);
  }
}

function updateUserUI() {
  document.getElementById('current-user-name').innerText = currentUser.name;
  const roleEl = document.getElementById('current-user-role');
  roleEl.innerText = currentUser.role;
  roleEl.className = 'role-tag ' + (
    currentUser.role === 'HR Admin' ? 'role-admin' :
    currentUser.role === 'Manager' ? 'role-manager' : 'role-employee'
  );

  // Toggle role-restricted tabs & elements
  document.querySelectorAll('.role-restricted').forEach(el => {
    const allowed = el.getAttribute('data-role').split(',');
    el.style.display = allowed.includes(currentUser.role) ? 'flex' : 'none';
  });

  const runnerCard = document.getElementById('hr-payroll-runner-card');
  if (runnerCard) runnerCard.style.display = currentUser.role === 'HR Admin' ? 'block' : 'none';

  const mgrLeaveSec = document.getElementById('manager-leave-section');
  if (mgrLeaveSec) mgrLeaveSec.style.display = (currentUser.role === 'Manager' || currentUser.role === 'HR Admin') ? 'block' : 'none';
}

// Tab Switching
function showTab(tabId) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-link').forEach(l => l.classList.remove('active'));

  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add('active');

  event.currentTarget.classList.add('active');
}

// Refresh Data for current view
async function refreshAllData() {
  await Promise.all([
    fetchTodayAttendance(),
    fetchMyAttendance(),
    fetchLeaveBalances(),
    fetchMyLeaves(),
    fetchPendingLeaves(),
    fetchPayslips(),
    fetchHolidays(),
    fetchTeamData(),
    fetchDepartments(),
    fetchReports()
  ]);
}

// Attendance
async function fetchTodayAttendance() {
  try {
    const res = await fetch('/api/attendance/today', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const att = result.data;

    const inBtn = document.getElementById('btn-clockin');
    const outBtn = document.getElementById('btn-clockout');
    const statusBanner = document.getElementById('attendance-status-banner');

    if (att && att.clockIn) {
      document.getElementById('summary-clockin').innerText = att.clockIn;
      document.getElementById('summary-clockout').innerText = att.clockOut || 'Working...';
      document.getElementById('summary-hours').innerText = (att.totalHours || 0) + ' hrs';
      document.getElementById('summary-status').innerText = att.status;
      document.getElementById('summary-status').className = 'badge ' + (att.status === 'Present' ? 'badge-success' : 'badge-warning');

      if (att.clockOut) {
        statusBanner.innerText = `Day Completed (${att.totalHours} hrs clocked)`;
        inBtn.disabled = true;
        outBtn.disabled = true;
      } else {
        statusBanner.innerText = `Clocked in at ${att.clockIn}. Currently active.`;
        inBtn.disabled = true;
        outBtn.disabled = false;
      }
    } else {
      document.getElementById('summary-clockin').innerText = 'Not Clocked In';
      document.getElementById('summary-clockout').innerText = '--';
      document.getElementById('summary-hours').innerText = '0.00 hrs';
      document.getElementById('summary-status').innerText = 'Pending';
      document.getElementById('summary-status').className = 'badge badge-info';
      statusBanner.innerText = 'You have not clocked in yet today.';
      inBtn.disabled = false;
      outBtn.disabled = true;
    }
  } catch (e) {
    console.error(e);
  }
}

async function handleClockIn() {
  try {
    const res = await fetch('/api/attendance/clockin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ employeeId: currentUser._id })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Clock-in successful! Have a productive day.');
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to clock in', true);
  }
}

async function handleClockOut() {
  try {
    const res = await fetch('/api/attendance/clockout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ employeeId: currentUser._id })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Clock-out saved successfully!');
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to clock out', true);
  }
}

async function fetchMyAttendance() {
  try {
    const res = await fetch('/api/attendance/my', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const tbody = document.getElementById('my-attendance-tbody');
    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: #64748b;">No attendance records found yet.</td></tr>';
      return;
    }

    tbody.innerHTML = result.data.slice(0, 10).map(r => `
      <tr>
        <td><strong>${r.date}</strong></td>
        <td>${r.clockIn || '--'}</td>
        <td>${r.clockOut || '--'}</td>
        <td>${r.totalHours ? r.totalHours + ' hrs' : '--'}</td>
        <td><span class="badge ${r.status === 'Present' ? 'badge-success' : 'badge-warning'}">${r.status}</span></td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// Leaves
async function fetchLeaveBalances() {
  try {
    const res = await fetch('/api/leaves/balances/my', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    if (result.data) {
      document.getElementById('bal-casual').innerText = result.data.casual;
      document.getElementById('bal-sick').innerText = result.data.sick;
      document.getElementById('bal-earned').innerText = result.data.earned;
    }
  } catch (e) {
    console.error(e);
  }
}

async function fetchMyLeaves() {
  try {
    const res = await fetch('/api/leaves/my', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const tbody = document.getElementById('my-leaves-tbody');
    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: #64748b;">No leave applications found.</td></tr>';
      return;
    }

    tbody.innerHTML = result.data.map(l => {
      const badgeClass = l.status === 'Approved' ? 'badge-success' : (l.status === 'Pending' ? 'badge-warning' : 'badge-danger');
      return `
        <tr>
          <td>${new Date(l.createdAt).toLocaleDateString()}</td>
          <td style="text-transform: capitalize;"><strong>${l.type}</strong></td>
          <td>${l.fromDate}</td>
          <td>${l.toDate}</td>
          <td>${l.totalDays} day(s)</td>
          <td>${l.reason || '--'}</td>
          <td><span class="badge ${badgeClass}">${l.status}</span></td>
          <td>${l.remarks || (l.approverId ? l.approverId.name : '--')}</td>
        </tr>
      `;
    }).join('');
  } catch (e) {
    console.error(e);
  }
}

async function fetchPendingLeaves() {
  if (currentUser.role === 'Employee') return;
  try {
    const res = await fetch('/api/leaves/pending', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const tbody = document.getElementById('pending-leaves-tbody');
    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: #64748b;">No pending leaves to approve.</td></tr>';
      return;
    }

    tbody.innerHTML = result.data.map(l => `
      <tr>
        <td><strong>${l.employeeId ? l.employeeId.name : 'Employee'}</strong></td>
        <td style="text-transform: capitalize;">${l.type}</td>
        <td>${l.fromDate} to ${l.toDate}</td>
        <td>${l.totalDays} day(s)</td>
        <td>${l.reason}</td>
        <td>
          <button class="btn btn-success" style="padding: 4px 10px; font-size: 0.75rem;" onclick="handleLeaveDecision('${l._id}', 'Approved')">Approve</button>
          <button class="btn btn-danger" style="padding: 4px 10px; font-size: 0.75rem;" onclick="handleLeaveDecision('${l._id}', 'Rejected')">Reject</button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

async function handleLeaveDecision(leaveId, status) {
  const remarks = prompt(`Enter remarks for ${status} decision:`, status === 'Approved' ? 'Reviewed and confirmed by authorized role' : 'Operational requirements');
  if (remarks === null) return;

  try {
    const res = await fetch(`/api/leaves/${leaveId}/decision`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ status, remarks })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Leave request marked as ${status}`);
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to update leave decision', true);
  }
}

function openLeaveModal() {
  document.getElementById('leave-modal').classList.add('open');
}
function closeLeaveModal() {
  document.getElementById('leave-modal').classList.remove('open');
}

async function handleApplyLeave(e) {
  e.preventDefault();
  const type = document.getElementById('leave-type').value;
  const fromDate = document.getElementById('leave-from').value;
  const toDate = document.getElementById('leave-to').value;
  const reason = document.getElementById('leave-reason').value;

  try {
    const res = await fetch('/api/leaves', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ type, fromDate, toDate, reason })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Leave request submitted successfully!');
      closeLeaveModal();
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to submit leave', true);
  }
}

// Payroll
async function fetchPayslips() {
  try {
    const res = await fetch(`/api/employees/${currentUser._id}/payslips`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const tbody = document.getElementById('payslips-tbody');

    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: #64748b;">No payslip records generated yet.</td></tr>';
      return;
    }

    const latest = result.data[0];
    document.getElementById('user-base-salary').innerText = `₹${(latest.baseSalary || 50000).toLocaleString()}`;
    document.getElementById('user-net-salary').innerText = `₹${(latest.netPay || 0).toLocaleString()}`;

    tbody.innerHTML = result.data.map(p => `
      <tr>
        <td><strong>Month ${p.month}/${p.year}</strong></td>
        <td>₹${p.baseSalary.toLocaleString()}</td>
        <td style="color: #10b981;">+ ₹${(p.allowances ? p.allowances.total : 0).toLocaleString()}</td>
        <td style="color: #ef4444;">- ₹${(p.deductions ? p.deductions.total : 0).toLocaleString()}</td>
        <td><strong style="color: #0f172a;">₹${p.netPay.toLocaleString()}</strong></td>
        <td><span class="badge badge-success">${p.status}</span></td>
        <td>
          <button class="btn btn-outline" style="padding: 4px 8px; font-size: 0.75rem;" onclick="viewPayslipDetail('${p._id}')">
            <i class="fa-solid fa-file-pdf"></i> View Slip
          </button>
        </td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

async function triggerPayrollRun() {
  try {
    const res = await fetch('/api/payroll/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ month: 9, year: 2026 })
    });
    const data = await res.json();
    if (data.success) {
      showToast(data.message);
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to trigger payroll', true);
  }
}

async function viewPayslipDetail(payslipId) {
  try {
    const res = await fetch(`/api/payroll/${payslipId}`, {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const p = result.data;
    if (!p) return;

    const emp = p.employeeId || currentUser;
    const content = `
      <div class="payslip-header">
        <h2 style="font-size: 1.3rem;">GLOBAL CORP ENTERPRISES PVT. LTD.</h2>
        <p style="font-size: 0.8rem; color: #475569;">Technology & Operations Center, Bangalore - 560029</p>
        <h3 style="margin-top: 10px; font-size: 1rem; text-decoration: underline;">PAYSLIP FOR ${p.month}/${p.year}</h3>
      </div>
      <div class="payslip-grid">
        <div>
          <div><strong>Employee Name:</strong> ${emp.name}</div>
          <div><strong>Designation:</strong> ${emp.designation || 'Associate'}</div>
          <div><strong>Employee ID:</strong> ${emp._id}</div>
        </div>
        <div>
          <div><strong>Working Days:</strong> ${p.workingDays}</div>
          <div><strong>Days Worked:</strong> ${p.presentDays}</div>
          <div><strong>Unpaid Leaves:</strong> ${p.unpaidLeaveDays}</div>
        </div>
      </div>
      <table style="margin-bottom: 16px;">
        <thead>
          <tr style="background: #e2e8f0;">
            <th>EARNINGS</th>
            <th>AMOUNT (₹)</th>
            <th>DEDUCTIONS</th>
            <th>AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Basic Salary</td>
            <td>₹${p.baseSalary.toLocaleString()}</td>
            <td>Provident Fund (PF 12%)</td>
            <td>₹${(p.deductions?.pf || 0).toLocaleString()}</td>
          </tr>
          <tr>
            <td>House Rent Allowance (HRA 20%)</td>
            <td>₹${(p.allowances?.hra || 0).toLocaleString()}</td>
            <td>Professional Tax</td>
            <td>₹${(p.deductions?.professionalTax || 200).toLocaleString()}</td>
          </tr>
          <tr>
            <td>Conveyance & Medical</td>
            <td>₹${((p.allowances?.conveyance || 0) + (p.allowances?.medical || 0)).toLocaleString()}</td>
            <td>Unpaid Leave Deductions</td>
            <td>₹${(p.deductions?.unpaidLeaveDeductions || 0).toLocaleString()}</td>
          </tr>
          <tr style="font-weight: bold; background: #f8fafc;">
            <td>Total Gross Earnings</td>
            <td>₹${((p.baseSalary || 0) + (p.allowances?.total || 0)).toLocaleString()}</td>
            <td>Total Deductions</td>
            <td>₹${(p.deductions?.total || 0).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>
      <div style="background: #f1f5f9; padding: 12px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 1.1rem; font-weight: 700;">NET TAKE-HOME PAY:</span>
        <span style="font-size: 1.3rem; font-weight: 800; color: #15803d;">₹${p.netPay.toLocaleString()}</span>
      </div>
      <div style="font-size: 0.75rem; color: #64748b; margin-top: 14px; text-align: center;">
        This is a system-generated computer payroll slip and does not require a physical signature.
      </div>
    `;

    document.getElementById('payslip-print-content').innerHTML = content;
    document.getElementById('payslip-modal').classList.add('open');
  } catch (e) {
    console.error(e);
  }
}

function closePayslipModal() {
  document.getElementById('payslip-modal').classList.remove('open');
}

// Holidays
async function fetchHolidays() {
  try {
    const res = await fetch('/api/holidays', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const container = document.getElementById('holidays-preview');
    if (!result.data || result.data.length === 0) {
      container.innerHTML = '<span style="color: #64748b;">No company holidays scheduled.</span>';
      return;
    }

    container.innerHTML = result.data.map(h => `
      <div style="display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px dashed #e2e8f0;">
        <span><strong>${h.description}</strong></span>
        <span class="badge badge-info">${h.date}</span>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

// Manager Team Dashboard
async function fetchTeamData() {
  if (currentUser.role === 'Employee') return;
  try {
    const res = await fetch('/api/manager/team-attendance', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const container = document.getElementById('team-members-cards');
    const select = document.getElementById('perf-employee-select');

    if (!result.data || result.data.length === 0) {
      container.innerHTML = '<div style="color: #64748b;">No team members assigned under this manager account.</div>';
      return;
    }

    teamMembersCache = result.data;
    select.innerHTML = '<option value="">Select Team Member</option>' + 
      result.data.map(item => `<option value="${item.member._id}">${item.member.name} (${item.member.designation})</option>`).join('');

    container.innerHTML = result.data.map(item => `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h4 style="font-size: 1rem; font-weight: 700;">${item.member.name}</h4>
            <div style="font-size: 0.8rem; color: #64748b;">${item.member.designation}</div>
            <div style="font-size: 0.75rem; color: #94a3b8;">${item.member.email}</div>
          </div>
          <span class="badge ${item.attendance.status === 'Present' ? 'badge-success' : 'badge-warning'}">
            ${item.attendance.status || 'Not Clocked In'}
          </span>
        </div>
        <div style="margin-top: 14px; font-size: 0.82rem; border-top: 1px solid #f1f5f9; padding-top: 10px;">
          <div><strong>Clock In Today:</strong> ${item.attendance.clockIn || '--'}</div>
          <div><strong>Clock Out:</strong> ${item.attendance.clockOut || '--'}</div>
        </div>
      </div>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

async function submitPerformanceNote() {
  const employeeId = document.getElementById('perf-employee-select').value;
  const note = document.getElementById('perf-note-input').value;
  const rating = Number(document.getElementById('perf-rating-select').value);

  if (!employeeId || !note) {
    showToast('Please select a member and enter a note', true);
    return;
  }

  try {
    const res = await fetch('/api/performance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ employeeId, note, rating })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Performance note logged successfully!');
      document.getElementById('perf-note-input').value = '';
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to log performance note', true);
  }
}

// Departments & Onboarding
async function fetchDepartments() {
  try {
    const res = await fetch('/api/departments', {
      headers: { 'Authorization': `Bearer ${currentToken}` }
    });
    const result = await res.json();
    const tbody = document.getElementById('departments-tbody');
    if (!result.data || result.data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">No departments registered.</td></tr>';
      return;
    }

    tbody.innerHTML = result.data.map(d => `
      <tr>
        <td><strong>${d.name}</strong></td>
        <td>${d.headId ? d.headId.name : '<span style="color: #94a3b8;">Unassigned</span>'}</td>
        <td>${d.description || '--'}</td>
      </tr>
    `).join('');
  } catch (e) {
    console.error(e);
  }
}

async function handleOnboard(e) {
  e.preventDefault();
  const name = document.getElementById('onb-name').value;
  const email = document.getElementById('onb-email').value;
  const password = document.getElementById('onb-password').value;
  const role = document.getElementById('onb-role').value;
  const designation = document.getElementById('onb-designation').value;
  const baseSalary = Number(document.getElementById('onb-salary').value);

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, email, password, role, designation, baseSalary })
    });
    const data = await res.json();
    if (data.success) {
      showToast(`Employee ${name} onboarded successfully!`);
      e.target.reset();
      await refreshAllData();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to onboard employee', true);
  }
}

async function handleCreateDepartment(e) {
  e.preventDefault();
  const name = document.getElementById('dept-name').value;
  const description = document.getElementById('dept-desc').value;

  try {
    const res = await fetch('/api/departments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ name, description })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Department created successfully!');
      e.target.reset();
      await fetchDepartments();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to create department', true);
  }
}

// Reports & Analytics
async function fetchReports() {
  if (currentUser.role === 'Employee') return;
  try {
    const [attRes, payRes, sumRes] = await Promise.all([
      fetch('/api/hr/reports/attendance', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
      fetch('/api/hr/reports/payroll-cost', { headers: { 'Authorization': `Bearer ${currentToken}` } }),
      fetch('/api/hr/reports/summary', { headers: { 'Authorization': `Bearer ${currentToken}` } })
    ]);

    const attData = await attRes.json();
    const payData = await payRes.json();
    const sumData = await sumRes.json();

    if (sumData.data) {
      document.getElementById('rep-total-emp').innerText = sumData.data.totalEmployees;
      document.getElementById('rep-total-spend').innerText = `₹${(sumData.data.monthlyDisbursement || 348000).toLocaleString()}`;
    }

    if (attData.data) {
      const attBars = document.getElementById('dept-attendance-bars');
      attBars.innerHTML = attData.data.map(d => `
        <div style="margin-bottom: 12px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
            <span>${d.departmentName}</span>
            <span>${d.attendancePercentage}% Attendance</span>
          </div>
          <div style="background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 4px;">
            <div style="background: #2563eb; width: ${d.attendancePercentage}%; height: 100%;"></div>
          </div>
        </div>
      `).join('');
    }

    if (payData.data) {
      const payBars = document.getElementById('dept-payroll-bars');
      const maxSpend = Math.max(...payData.data.map(p => p.totalPayrollDisbursed || 50000), 1);
      payBars.innerHTML = payData.data.map(p => {
        const pct = Math.round(((p.totalPayrollDisbursed || 50000) / maxSpend) * 100);
        return `
          <div style="margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600;">
              <span>${p.departmentName} (${p.headCount} Staff)</span>
              <span>₹${(p.totalPayrollDisbursed || 0).toLocaleString()}</span>
            </div>
            <div style="background: #e2e8f0; height: 10px; border-radius: 5px; overflow: hidden; margin-top: 4px;">
              <div style="background: #10b981; width: ${pct}%; height: 100%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }
  } catch (e) {
    console.error(e);
  }
}

// Profile
async function handleUpdateProfile(e) {
  e.preventDefault();
  const phone = document.getElementById('prof-phone').value;
  const address = document.getElementById('prof-address').value;
  const emergencyContact = document.getElementById('prof-emergency').value;

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ phone, address, emergencyContact })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Profile information updated successfully!');
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to update profile', true);
  }
}

async function handleChangePassword(e) {
  e.preventDefault();
  const currentPassword = document.getElementById('pwd-current').value;
  const newPassword = document.getElementById('pwd-new').value;

  try {
    const res = await fetch('/api/profile/change-password', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentToken}` },
      body: JSON.stringify({ currentPassword, newPassword })
    });
    const data = await res.json();
    if (data.success) {
      showToast('Password changed successfully!');
      e.target.reset();
    } else {
      showToast(data.message, true);
    }
  } catch (e) {
    showToast('Failed to update password', true);
  }
}
