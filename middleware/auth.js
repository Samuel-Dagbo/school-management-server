import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import TeacherAssignment from '../models/TeacherAssignment.js';

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: "User not found or inactive" });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    next(error);
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    if (user) {
      req.user = user;
    }
    next();
  } catch {
    next();
  }
};

// Check if student owns the data
export const studentOwner = async (req, res, next) => {
  try {
    if (req.user.role !== 'student') {
      return next();
    }
    
    const student = await Student.findOne({ userId: req.user._id });
    if (!student) {
      return res.status(403).json({ success: false, message: "Student profile not found" });
    }
    
    req.student = student;
    next();
  } catch (error) {
    next(error);
  }
};

// Check if teacher can access class/subject
export const teacherAssignment = async (req, res, next) => {
  try {
    if (req.user.role !== 'teacher') {
      return next();
    }
    
    const teacher = await Teacher.findOne({ userId: req.user._id });
    if (!teacher) {
      return res.status(403).json({ success: false, message: "Teacher profile not found" });
    }
    
    const assignments = await TeacherAssignment.find({ teacherId: teacher._id });
    
    req.teacher = teacher;
    req.assignments = assignments;
    req.allowedClasses = assignments.map(a => a.classId.toString());
    req.allowedSubjects = assignments.map(a => a.subjectId.toString());
    
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware for teacher result entry access
export const canAccessResults = async (req, res, next) => {
  const { classId, subjectId } = req.query;
  
  // Admins can access everything
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Teachers can only access their assignments
  if (req.user.role === 'teacher') {
    const assignments = await TeacherAssignment.find({ 
      teacherId: req.teacher?._id || req.user._id 
    });
    
    const allowed = assignments.some(a => 
      (!classId || a.classId.toString() === classId) &&
      (!subjectId || a.subjectId.toString() === subjectId)
    );
    
    if (!allowed) {
      return res.status(403).json({ 
        success: false, 
        message: "You don't have permission to access this class/subject" 
      });
    }
  }
  
  next();
};