import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Session from '../models/Session.js';
import Term from '../models/Term.js';
import Teacher from '../models/Teacher.js';
import TeacherAssignment from '../models/TeacherAssignment.js';
import Student from '../models/Student.js';
import Result from '../models/Result.js';
import News from '../models/News.js';

const router = express.Router();

const firstNames = {
  male: ['Kwame', 'Kofi', 'Yaw', 'Emmanuel', 'Daniel', 'David', 'Joseph', 'Samuel', 'Michael', 'Isaac'],
  female: ['Akua', 'Abena', 'Adjoa', 'Akosua', 'Amara', 'Esi', 'Yaa', 'Afia', 'Nadia', 'Serwaa']
};

const lastNames = ['Mensah', 'Osei', 'Kwaku', 'Owusu', 'Agyeman', 'Duodu', 'Kofi', 'Asante', 'Kumah', 'Opoku'];

const classSubjects = {
  'Creche': ['Play', 'Numbers', 'Letters'],
  'KG 1': ['Mathematics', 'English', 'Reading'],
  'KG 2': ['Mathematics', 'English', 'Reading'],
  'Primary 1': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'ICT'],
  'Primary 2': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'ICT'],
  'Primary 3': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'ICT'],
  'Primary 4': ['Mathematics', 'English', 'Science', 'Social Studies', 'ICT'],
  'Primary 5': ['Mathematics', 'English', 'Science', 'Social Studies', 'ICT'],
  'Primary 6': ['Mathematics', 'English', 'Science', 'Social Studies', 'ICT'],
  'JHS 1': ['Mathematics', 'English', 'Basic Science', 'Social Studies', 'ICT'],
  'JHS 2': ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'ICT'],
  'JHS 3': ['Mathematics', 'English', 'Integrated Science', 'Social Studies', 'ICT']
};

function getGrade(score) {
  if (score >= 90) return 'A1';
  if (score >= 80) return 'A2';
  if (score >= 70) return 'B2';
  if (score >= 60) return 'B3';
  if (score >= 50) return 'C4';
  if (score >= 40) return 'C5';
  if (score >= 30) return 'D6';
  return 'F9';
}

function getComment(score) {
  if (score >= 90) return 'Excellent performance!';
  if (score >= 80) return 'Very good work.';
  if (score >= 70) return 'Good progress.';
  if (score >= 60) return 'Satisfactory.';
  if (score >= 50) return 'Can do better.';
  return 'Needs improvement.';
}

router.post('/run', async (req, res) => {
  try {
    console.log('Starting seed...');
    
    // Clear all data
    await User.deleteMany({});
    await Class.deleteMany({});
    await Subject.deleteMany({});
    await Session.deleteMany({});
    await Term.deleteMany({});
    await Teacher.deleteMany({});
    await TeacherAssignment.deleteMany({});
    await Student.deleteMany({});
    await Result.deleteMany({});
    await News.deleteMany({});

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await User.create({
      email: 'admin@school.edu',
      password: adminPassword,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true
    });
    console.log('Admin created');

    // Create session
    const session = await Session.create({
      name: '2025-2026',
      startDate: new Date('2025-09-01'),
      endDate: new Date('2026-07-31'),
      isActive: true
    });

    // Create terms
    const terms = await Term.insertMany([
      { name: 'First Term', sessionId: session._id, termNumber: 1, startDate: new Date('2025-09-01'), endDate: new Date('2025-12-20') },
      { name: 'Second Term', sessionId: session._id, termNumber: 2, startDate: new Date('2026-01-05'), endDate: new Date('2026-04-17') },
      { name: 'Third Term', sessionId: session._id, termNumber: 3, startDate: new Date('2026-04-21'), endDate: new Date('2026-07-31') }
    ]);
    console.log('Session and terms created');

    // Create classes
    const classData = [
      { name: 'Creche', level: 'creche', academicYear: 2025 },
      { name: 'KG 1', level: 'kg', academicYear: 2025 },
      { name: 'KG 2', level: 'kg', academicYear: 2025 },
      { name: 'Primary 1', level: 'primary', academicYear: 2025 },
      { name: 'Primary 2', level: 'primary', academicYear: 2025 },
      { name: 'Primary 3', level: 'primary', academicYear: 2025 },
      { name: 'Primary 4', level: 'primary', academicYear: 2025 },
      { name: 'Primary 5', level: 'primary', academicYear: 2025 },
      { name: 'Primary 6', level: 'primary', academicYear: 2025 },
      { name: 'JHS 1', level: 'jhs', academicYear: 2025 },
      { name: 'JHS 2', level: 'jhs', academicYear: 2025 },
      { name: 'JHS 3', level: 'jhs', academicYear: 2025 }
    ];
    const classes = await Class.insertMany(classData);
    console.log('Classes created');

    // Create subjects
    const subjectData = [];
    for (const [className, subjects] of Object.entries(classSubjects)) {
      const cls = classes.find(c => c.name === className);
      if (cls) {
        for (const subjectName of subjects) {
          subjectData.push({
            name: subjectName,
            code: subjectName.substring(0, 4).toUpperCase(),
            classId: cls._id
          });
        }
      }
    }
    const dbSubjects = await Subject.insertMany(subjectData);
    console.log('Subjects created');

    // Create teachers
    const teacherPassword = await bcrypt.hash('teacher123', 12);
    const teacherData = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@school.edu', gender: 'male', phone: '+233201234567', qualification: 'B.Ed Mathematics', specialties: ['Mathematics'] },
      { firstName: 'Mary', lastName: 'Akosua', email: 'mary.akosua@school.edu', gender: 'female', phone: '+233201234568', qualification: 'BA English', specialties: ['English'] },
      { firstName: 'Peter', lastName: 'Osei', email: 'peter.osei@school.edu', gender: 'male', phone: '+233201234569', qualification: 'B.Sc Physics', specialties: ['Science', 'ICT'] },
      { firstName: 'Sarah', lastName: 'Abena', email: 'sarah.abena@school.edu', gender: 'female', phone: '+233201234570', qualification: 'B.Ed Primary Education', specialties: ['Primary Education'] },
      { firstName: 'James', lastName: 'Kwaku', email: 'james.kwaku@school.edu', gender: 'male', phone: '+233201234571', qualification: 'B.Ed Religious Studies', specialties: ['Religious Studies'] }
    ];

    for (const t of teacherData) {
      const existingUser = await User.findOne({ email: t.email });
      let userId;
      if (existingUser) {
        userId = existingUser._id;
        existingUser.password = teacherPassword;
        await existingUser.save();
      } else {
        const user = await User.create({
          email: t.email,
          password: teacherPassword,
          role: 'teacher',
          firstName: t.firstName,
          lastName: t.lastName,
          isActive: true
        });
        userId = user._id;
      }

      await Teacher.create({
        userId: userId,
        employeeId: `TCH${String(teacherData.indexOf(t) + 1).padStart(3, '0')}`,
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender,
        phone: t.phone,
        qualification: t.qualification,
        specialties: t.specialties
      });
    }
    console.log('Teachers created');

    // Create students
    const studentPassword = await bcrypt.hash('student123', 12);
    const studentCountPerClass = { 'Creche': 3, 'KG 1': 4, 'KG 2': 4, 'Primary 1': 5, 'Primary 2': 5, 'Primary 3': 4, 'Primary 4': 4, 'Primary 5': 4, 'Primary 6': 4, 'JHS 1': 6, 'JHS 2': 6, 'JHS 3': 6 };
    let totalStudents = 0;
    const students = [];

    for (const [className, count] of Object.entries(studentCountPerClass)) {
      const cls = classes.find(c => c.name === className);
      if (!cls) continue;
      
      for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const fname = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
        const studentId = `STU${String(totalStudents + 1).padStart(4, '0')}`;
        const uniqueSuffix = totalStudents + 1;
        const studentEmail = `${fname.toLowerCase()}.${lname.toLowerCase()}${uniqueSuffix}@student.school.edu`;

        let studentUserId;
        const existingUser = await User.findOne({ email: studentEmail });
        if (existingUser) {
          studentUserId = existingUser._id;
          existingUser.password = studentPassword;
          await existingUser.save();
        } else {
          const user = await User.create({
            email: studentEmail,
            password: studentPassword,
            role: 'student',
            firstName: fname,
            lastName: lname,
            isActive: true
          });
          studentUserId = user._id;
        }

        const parentFname = firstNames.male[Math.floor(Math.random() * firstNames.male.length)];
        
        const student = await Student.create({
          userId: studentUserId,
          studentId,
          firstName: fname,
          lastName: lname,
          gender,
          dateOfBirth: new Date(`${2015 + Math.floor(Math.random() * 5)}-01-15`),
          classId: cls._id,
          parentName: `${parentFname} ${lname}`,
          parentPhone: `+23320${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          address: 'Accra, Ghana'
        });

        students.push({ _id: student._id, classId: cls._id, className });
        totalStudents++;
      }
    }
    console.log('Students created');

    // Create results for first term
    const firstTerm = terms[0];
    for (const student of students.slice(0, 20)) {
      const subjects = classSubjects[student.className] || [];
      const classSubjectsList = dbSubjects.filter(s => s.classId.toString() === student.classId.toString());
      
      for (const sub of classSubjectsList) {
        const score = Math.floor(Math.random() * 40) + 60;
        await Result.create({
          studentId: student._id,
          subjectId: sub._id,
          termId: firstTerm._id,
          score,
          grade: getGrade(score),
          comment: getComment(score),
          isPublished: true
        });
      }
    }
    console.log('Results created');

    // Create news
    const newsData = [
      { title: 'Academic Year 2025-2026 Commences', summary: 'We are excited to announce the start of our new academic year.', category: 'Academic', content: 'Welcome to the new academic year!' },
      { title: 'BECE Preparation Classes Begin', summary: 'Our JHS 3 students begin intensive preparation for BECE.', category: 'Academic', content: 'Good luck to all students!' },
      { title: 'Annual Sports Day 2025', summary: 'Join us for our annual sports day.', category: 'Events', content: 'Come and support your children!' }
    ];
    await News.insertMany(newsData.map(n => ({ ...n, isPublished: true, createdBy: admin._id })));
    console.log('News created');

    res.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        admin: { email: 'admin@school.edu', password: 'admin123' },
        teachers: { count: teacherData.length, defaultPassword: 'teacher123' },
        students: { count: totalStudents, defaultPassword: 'student123' },
        classes: classData.length,
        subjects: subjectData.length,
        news: newsData.length
      }
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;