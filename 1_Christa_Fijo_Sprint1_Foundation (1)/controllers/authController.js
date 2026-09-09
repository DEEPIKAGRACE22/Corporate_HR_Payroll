const bcrypt = require('bcryptjs');
const User = require('../models/User');
const LeaveBalance = require('../models/LeaveBalance');
const { generateToken } = require('../utils/tokenHelper');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role, departmentId, managerId, designation, baseSalary, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: Name, email, and password are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An employee with this email address already exists',
        errorCode: 'DUPLICATE_KEY'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase().trim(),
      passwordHash,
      role: role || 'Employee',
      departmentId: departmentId || null,
      managerId: managerId || null,
      designation: designation || 'Associate',
      baseSalary: baseSalary || 50000,
      phone: phone || '',
      address: address || ''
    });

    await LeaveBalance.create({
      employeeId: user._id,
      casual: 10,
      sick: 10,
      earned: 15
    });

    res.status(201).json({
      success: true,
      message: 'Employee registered successfully',
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        designation: user.designation,
        departmentId: user.departmentId
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Requested action violates a business rule or failed validation: Email and password are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'UNAUTHORIZED'
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
        errorCode: 'UNAUTHORIZED'
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          designation: user.designation,
          departmentId: user.departmentId,
          managerId: user.managerId,
          baseSalary: user.baseSalary
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-passwordHash')
      .populate('departmentId', 'name description')
      .populate('managerId', 'name email designation');
    
    res.status(200).json({
      success: true,
      message: 'Profile retrieved successfully',
      data: user
    });
  } catch (err) {
    next(err);
  }
};
