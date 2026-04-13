import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import Student from '../models/Student.js';
import { validate, schemas } from '../utils/validation.js';

const router = express.Router();

const generateToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

router.post('/register', validate(schemas.register), async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await User.create({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      isActive: true,
      isVerified: role === 'student' ? false : true,
      verificationToken: role === 'student' ? verificationToken : undefined
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: role === 'student' ? 'Registration successful. Please verify your email.' : 'Registration successful',
      data: { user: { id: user._id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName, isVerified: user.isVerified }, token }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password, studentId } = req.body;

    let user = null;
    let student = null;

    if (studentId) {
      student = await Student.findOne({ studentId }).populate('userId');
      if (student && student.userId) {
        user = await User.findById(student.userId._id);
      } else {
        user = await User.findOne({ email: `${studentId}@student.edu` });
        if (!user) {
          return res.status(401).json({ success: false, message: 'Invalid student ID' });
        }
      }
    } else {
      user = await User.findOne({ email });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }

    if (user.role === 'student' && !user.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Email not verified. Please check your email for verification link.',
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user);

    let studentData = null;
    if (student) {
      studentData = {
        id: student._id,
        studentId: student.studentId,
        firstName: student.firstName,
        lastName: student.lastName,
        classId: student.classId
      };
    }

    res.json({
      success: true,
      message: 'Login successful',
      data: { 
        user: { 
          id: user._id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          isVerified: user.isVerified
        }, 
        student: studentData,
        token 
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify-email', async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid verification token' });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      message: 'Email verified successfully',
      data: { token: jwtToken }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/resend-verification', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, role: 'student' });
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: 'Email already verified' });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    res.json({ success: true, message: 'Verification email sent', data: { token: verificationToken } });
  } catch (error) {
    next(error);
  }
});

router.post('/reset-password', async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 3600000;
    await user.save();

    res.json({ 
      success: true, 
      message: 'Password reset link sent to email',
      data: { resetToken }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/new-password', async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({ 
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
    }

    user.password = await bcrypt.hash(password, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const jwtToken = generateToken(user);

    res.json({
      success: true,
      message: 'Password reset successfully',
      data: { token: jwtToken }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    let student = null;
    if (user.role === 'student') {
      student = await Student.findOne({ userId: user._id }).populate('classId', 'name');
    }

    res.json({ 
      success: true, 
      data: { 
        ...user.toObject(), 
        password: undefined,
        student 
      } 
    });
  } catch (error) {
    next(error);
  }
});

export default router;