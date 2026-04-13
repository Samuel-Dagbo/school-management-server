import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Connected to database');

const firstNames = {
  male: ['Kwame', 'Kofi', 'Yaw', 'Emmanuel', 'Daniel', 'David', 'Joseph', 'Samuel', 'Michael', 'Isaac'],
  female: ['Akua', 'Abena', 'Adjoa', 'Akosua', 'Amara', 'Esi', 'Yaa', 'Afia', 'Nadia', 'Serwaa']
};

const lastNames = ['Mensah', 'Osei', 'Kwaku', 'Owusu', 'Agyeman', 'Duodu', 'Kofi', 'Asante', 'Kumah', 'Opoku'];

async function seed() {
  try {
    console.log('🌱 Starting seed...\n');

    const password = await bcrypt.hash('admin123', 12);
    const adminId = uuidv4();
    
    await supabase.from('users').upsert({
      id: adminId,
      email: 'admin@school.edu',
      password,
      role: 'admin',
      firstName: 'System',
      lastName: 'Administrator',
      isActive: true
    }, { onConflict: 'email' });
    console.log('✅ Admin user created');

    const sessionId = uuidv4();
    await supabase.from('sessions').upsert({
      id: sessionId,
      name: '2025-2026',
      startDate: '2025-09-01',
      endDate: '2026-07-31',
      isActive: true
    });
    console.log('✅ Session created');

    const terms = [
      { id: uuidv4(), name: 'First Term', sessionId, termNumber: 1, startDate: '2025-09-01', endDate: '2025-12-20' },
      { id: uuidv4(), name: 'Second Term', sessionId, termNumber: 2, startDate: '2026-01-05', endDate: '2026-04-17' },
      { id: uuidv4(), name: 'Third Term', sessionId, termNumber: 3, startDate: '2026-04-21', endDate: '2026-07-31' }
    ];
    for (const term of terms) {
      await supabase.from('terms').upsert(term, { onConflict: 'sessionId,termNumber' });
    }
    console.log('✅ Terms created');

    const classNames = [
      { name: 'Creche', level: 'creche' },
      { name: 'KG 1', level: 'kg' },
      { name: 'KG 2', level: 'kg' },
      { name: 'Primary 1', level: 'primary' },
      { name: 'Primary 2', level: 'primary' },
      { name: 'Primary 3', level: 'primary' },
      { name: 'Primary 4', level: 'primary' },
      { name: 'Primary 5', level: 'primary' },
      { name: 'Primary 6', level: 'primary' },
      { name: 'JHS 1', level: 'jhs' },
      { name: 'JHS 2', level: 'jhs' },
      { name: 'JHS 3', level: 'jhs' }
    ];

    const classIds = {};
    for (const cls of classNames) {
      const id = uuidv4();
      classIds[cls.name] = id;
      await supabase.from('classes').upsert({ id, name: cls.name, level: cls.level, academicYear: 2025 });
    }
    console.log('✅ Classes created');

    const classSubjects = {
      'Creche': ['Play', 'Numbers', 'Letters'],
      'KG 1': ['Mathematics', 'English', 'Reading'],
      'KG 2': ['Mathematics', 'English', 'Reading'],
      'Primary 1': ['Mathematics', 'English', 'Basic Science'],
      'Primary 2': ['Mathematics', 'English', 'Basic Science'],
      'Primary 3': ['Mathematics', 'English', 'Basic Science'],
      'Primary 4': ['Mathematics', 'English', 'Science'],
      'Primary 5': ['Mathematics', 'English', 'Science'],
      'Primary 6': ['Mathematics', 'English', 'Science'],
      'JHS 1': ['Mathematics', 'English', 'Basic Science'],
      'JHS 2': ['Mathematics', 'English', 'Integrated Science'],
      'JHS 3': ['Mathematics', 'English', 'Integrated Science']
    };

    for (const [className, subjects] of Object.entries(classSubjects)) {
      for (const name of subjects) {
        await supabase.from('subjects').upsert({
          id: uuidv4(),
          name,
          code: name.substring(0, 4).toUpperCase(),
          classId: classIds[className]
        }, { onConflict: 'classId,name' });
      }
    }
    console.log('✅ Subjects created');

    const teachersData = [
      { firstName: 'John', lastName: 'Doe', email: 'john.doe@school.edu', gender: 'male', phone: '+233201234567', qualification: 'B.Ed Mathematics' },
      { firstName: 'Mary', lastName: 'Akosua', email: 'mary.akosua@school.edu', gender: 'female', phone: '+233201234568', qualification: 'BA English' },
      { firstName: 'Peter', lastName: 'Osei', email: 'peter.osei@school.edu', gender: 'male', phone: '+233201234569', qualification: 'B.Sc Physics' },
      { firstName: 'Sarah', lastName: 'Abena', email: 'sarah.abena@school.edu', gender: 'female', phone: '+233201234570', qualification: 'B.Ed Primary' },
      { firstName: 'James', lastName: 'Kwaku', email: 'james.kwaku@school.edu', gender: 'male', phone: '+233201234571', qualification: 'B.Ed Religious' }
    ];

    const teacherPassword = await bcrypt.hash('teacher123', 12);
    
    for (let i = 0; i < teachersData.length; i++) {
      const t = teachersData[i];
      const userId = uuidv4();
      
      await supabase.from('users').upsert({
        id: userId,
        email: t.email,
        password: teacherPassword,
        role: 'teacher',
        firstName: t.firstName,
        lastName: t.lastName,
        isActive: true
      }, { onConflict: 'email' });

      await supabase.from('teachers').upsert({
        id: uuidv4(),
        userId,
        employeeId: `TCH${String(i + 1).padStart(3, '0')}`,
        firstName: t.firstName,
        lastName: t.lastName,
        gender: t.gender,
        phone: t.phone,
        qualification: t.qualification
      }, { onConflict: 'employeeId' });
    }
    console.log(`✅ ${teachersData.length} teachers created`);

    const studentCountPerClass = { 'Creche': 5, 'KG 1': 6, 'KG 2': 6, 'Primary 1': 8, 'Primary 2': 8, 'Primary 3': 6, 'Primary 4': 6, 'Primary 5': 6, 'Primary 6': 6, 'JHS 1': 10, 'JHS 2': 10, 'JHS 3': 10 };
    let totalStudents = 0;
    const studentPassword = await bcrypt.hash('student123', 12);

    for (const [className, count] of Object.entries(studentCountPerClass)) {
      for (let i = 0; i < count; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const fname = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
        const lname = lastNames[Math.floor(Math.random() * lastNames.length)];
        const studentId = `STU${String(totalStudents + 1).padStart(4, '0')}`;
        
        const userId = uuidv4();
        
        await supabase.from('users').upsert({
          id: userId,
          email: `${fname.toLowerCase()}.${lname.toLowerCase()}@student.school.edu`,
          password: studentPassword,
          role: 'student',
          firstName: fname,
          lastName: lname,
          isActive: true
        });

        const parentFname = firstNames.male[Math.floor(Math.random() * firstNames.male.length)];
        
        await supabase.from('students').upsert({
          id: uuidv4(),
          userId,
          studentId,
          firstName: fname,
          lastName: lname,
          gender,
          dateOfBirth: `${2015 + Math.floor(Math.random() * 5)}-01-15`,
          classId: classIds[className],
          parentName: `${parentFname} ${lname}`,
          parentPhone: `+23320${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`,
          address: 'Accra, Ghana'
        }, { onConflict: 'studentId' });

        totalStudents++;
      }
    }
    console.log(`✅ ${totalStudents} students created`);

    const newsData = [
      { title: 'Academic Year 2025-2026 Commences', category: 'Academic' },
      { title: 'BECE Preparation Classes Begin', category: 'Academic' },
      { title: 'Annual Sports Day 2025', category: 'Events' },
      { title: 'Parent-Teacher Meeting', category: 'Events' }
    ];

    for (const news of newsData) {
      await supabase.from('news').upsert({
        id: uuidv4(),
        title: news.title,
        summary: `${news.title} - Our school continues to provide excellent education.`,
        content: `${news.title}. Our dedicated faculty ensure that each student receives personalized attention.`,
        category: news.category,
        isPublished: true,
        createdBy: adminId
      });
    }
    console.log(`✅ ${newsData.length} news items created`);

    console.log('\n🎉 Seed completed!\n');
    console.log('📋 Login credentials:');
    console.log('   Admin: admin@school.edu / admin123');
    console.log('   Teacher: john.doe@school.edu / teacher123');
    console.log('   Student: STU0001 / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seed();