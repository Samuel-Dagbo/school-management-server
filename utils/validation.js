import Joi from 'joi';

export const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      return res.status(400).json({ success: false, errors });
    }
    next();
  };
};

export const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'teacher', 'student').required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required()
  }),

  login: Joi.object({
    email: Joi.string().email(),
    password: Joi.string().required(),
    studentId: Joi.string()
  }).or('email', 'studentId'),

  student: Joi.object({
    userId: Joi.string().uuid().required(),
    studentId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().required(),
    classId: Joi.string().uuid(),
    phone: Joi.string(),
    address: Joi.string(),
    parentName: Joi.string(),
    parentPhone: Joi.string()
  }),

  teacher: Joi.object({
    userId: Joi.string().uuid().required(),
    employeeId: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('male', 'female').required(),
    phone: Joi.string(),
    address: Joi.string(),
    qualification: Joi.string(),
    specialties: Joi.array().items(Joi.string())
  }),

  class: Joi.object({
    name: Joi.string().required(),
    level: Joi.string().valid('nursery', 'primary', 'jss', 'sss').required(),
    stream: Joi.string(),
    academicYear: Joi.number().required()
  }),

  subject: Joi.object({
    name: Joi.string().required(),
    code: Joi.string().required(),
    classId: Joi.string().uuid().required()
  }),

  session: Joi.object({
    name: Joi.string().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    isActive: Joi.boolean()
  }),

  term: Joi.object({
    name: Joi.string().required(),
    sessionId: Joi.string().uuid().required(),
    termNumber: Joi.number().min(1).max(3).required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required()
  }),

  assignment: Joi.object({
    teacherId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
    classId: Joi.string().uuid().required()
  }),

  result: Joi.object({
    studentId: Joi.string().uuid().required(),
    subjectId: Joi.string().uuid().required(),
    termId: Joi.string().uuid().required(),
    score: Joi.number().min(0).max(100).required(),
    grade: Joi.string(),
    comment: Joi.string()
  }),

  admission: Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    gender: Joi.string().valid('male', 'female').required(),
    dateOfBirth: Joi.date().required(),
    email: Joi.string().email(),
    phone: Joi.string().required(),
    address: Joi.string().required(),
    appliedClass: Joi.string().required(),
    parentName: Joi.string().required(),
    parentPhone: Joi.string().required(),
    previousSchool: Joi.string()
  })
};