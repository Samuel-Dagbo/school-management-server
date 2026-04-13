import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

const studentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId },
  studentId: { type: String, required: true, unique: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  gender: { type: String, enum: ['male', 'female'], required: true },
  dateOfBirth: { type: Date, required: true },
  classId: { type: mongoose.Schema.Types.ObjectId },
  phone: { type: String },
  address: { type: String },
  parentName: { type: String },
  parentPhone: { type: String }
}, { timestamps: true });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

const sessionSchema = new mongoose.Schema({ name: { type: String, required: true }, startDate: { type: Date }, endDate: { type: Date }, isActive: { type: Boolean } }, { timestamps: true });
const termSchema = new mongoose.Schema({ name: { type: String }, sessionId: { type: mongoose.Schema.Types.ObjectId }, termNumber: { type: Number }, startDate: { type: Date }, endDate: { type: Date } }, { timestamps: true });
const classSchema = new mongoose.Schema({ name: { type: String }, level: { type: String }, stream: { type: String }, academicYear: { type: Number } }, { timestamps: true });
const subjectSchema = new mongoose.Schema({ name: { type: String }, code: { type: String }, classId: { type: mongoose.Schema.Types.ObjectId } }, { timestamps: true });
const teacherSchema = new mongoose.Schema({ userId: { type: mongoose.Schema.Types.ObjectId }, employeeId: { type: String }, firstName: { type: String }, lastName: { type: String }, gender: { type: String }, phone: { type: String }, qualification: { type: String } }, { timestamps: true });
const taSchema = new mongoose.Schema({ teacherId: { type: mongoose.Schema.Types.ObjectId }, classId: { type: mongoose.Schema.Types.ObjectId }, subjectId: { type: mongoose.Schema.Types.ObjectId } }, { timestamps: true });
const resultSchema = new mongoose.Schema({ studentId: { type: mongoose.Schema.Types.ObjectId }, subjectId: { type: mongoose.Schema.Types.ObjectId }, termId: { type: mongoose.Schema.Types.ObjectId }, score: { type: Number }, grade: { type: String }, comment: { type: String }, isPublished: { type: Boolean } }, { timestamps: true });
const admissionSchema = new mongoose.Schema({ firstName: { type: String }, lastName: { type: String }, gender: { type: String }, dateOfBirth: { type: Date }, email: { type: String }, phone: { type: String }, address: { type: String }, appliedClass: { type: String }, parentName: { type: String }, parentPhone: { type: String }, previousSchool: { type: String }, status: { type: String }, notes: { type: String } }, { timestamps: true });
const newsSchema = new mongoose.Schema({ title: { type: String }, content: { type: String }, category: { type: String }, imageUrl: { type: String }, isPublished: { type: Boolean } }, { timestamps: true });
const gallerySchema = new mongoose.Schema({ title: { type: String }, description: { type: String }, imageUrl: { type: String }, category: { type: String }, createdBy: { type: mongoose.Schema.Types.ObjectId } }, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Session = mongoose.model('Session', sessionSchema);
const Term = mongoose.model('Term', termSchema);
const Class = mongoose.model('Class', classSchema);
const Subject = mongoose.model('Subject', subjectSchema);
const Student = mongoose.model('Student', studentSchema);
const Teacher = mongoose.model('Teacher', teacherSchema);
const TA = mongoose.model('TeacherAssignment', taSchema);
const Result = mongoose.model('Result', resultSchema);
const Admission = mongoose.model('Admission', admissionSchema);
const News = mongoose.model('News', newsSchema);
const Gallery = mongoose.model('Gallery', gallerySchema);

const firstNames = { male: ['Kwame','Kofi','Yaw','Emmanuel','Daniel','David','Joseph','Samuel','Michael','Isaac','John','Peter','James','Paul','Mark'], female: ['Akua','Abena','Adjoa','Akosua','Amara','Esi','Yaa','Afia','Nadia','Serwaa','Mary','Jane','Grace','Faith','Hope'] };
const lastNames = ['Mensah','Osei','Kwaku','Owusu','Agyeman','Duodu','Kofi','Asante','Kumah','Opoku','Appiah','Boateng'];

function grade(score) { if(score>=90)return'A+';if(score>=80)return'A';if(score>=70)return'B';if(score>=60)return'C';if(score>=50)return'D';return'F'; }

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    const db = mongoose.connection;
    await db.dropDatabase();
    console.log('✅ Fresh database\n');

    const pwd = await bcrypt.hash('admin123', 12);
    await User.create({ email: 'admin@school.edu', password: pwd, role: 'admin', firstName: 'System', lastName: 'Admin', isActive: true, isVerified: true });
    console.log('✅ Admin');

    const tpwd = await bcrypt.hash('teacher123', 12);
    const tdata = [{firstName:'John',lastName:'Doe',email:'john.doe@school.edu',gender:'male'},{firstName:'Mary',lastName:'Akosua',email:'mary.akosua@school.edu',gender:'female'},{firstName:'Peter',lastName:'Osei',email:'peter.osei@school.edu',gender:'male'},{firstName:'Sarah',lastName:'Abena',email:'sarah.abena@school.edu',gender:'female'},{firstName:'James',lastName:'Kwaku',email:'james.kwaku@school.edu',gender:'male'}];
    for(let i=0;i<tdata.length;i++){ await User.create({email:tdata[i].email,password:tpwd,role:'teacher',firstName:tdata[i].firstName,lastName:tdata[i].lastName,isActive:true,isVerified:true}); }
    console.log('✅ Teachers');

    const s1 = await Session.create({name:'2023-2024',startDate:new Date('2023-09-01'),endDate:new Date('2024-07-31'),isActive:false});
    const s2 = await Session.create({name:'2024-2025',startDate:new Date('2024-09-01'),endDate:new Date('2025-07-31'),isActive:false});
    const s3 = await Session.create({name:'2025-2026',startDate:new Date('2025-09-01'),endDate:new Date('2026-07-31'),isActive:true});
    for(let i=1;i<=3;i++){ await Term.create({name:'Term '+i,sessionId:s1._id,termNumber:i}); await Term.create({name:'Term '+i,sessionId:s2._id,termNumber:i}); await Term.create({name:'Term '+i,sessionId:s3._id,termNumber:i}); }
    console.log('✅ Sessions/Terms');

    const cls = await Class.insertMany([{name:'Creche',level:'creche',academicYear:2025},{name:'KG 1',level:'kg',academicYear:2025},{name:'KG 2',level:'kg',academicYear:2025},{name:'Primary 1',level:'primary',academicYear:2025},{name:'Primary 2',level:'primary',academicYear:2025},{name:'Primary 3',level:'primary',academicYear:2025},{name:'Primary 4',level:'primary',academicYear:2025},{name:'Primary 5',level:'primary',academicYear:2025},{name:'Primary 6',level:'primary',academicYear:2025},{name:'JHS 1',level:'jhs',academicYear:2025},{name:'JHS 2',level:'jhs',academicYear:2025},{name:'JHS 3',level:'jhs',academicYear:2025}]);
    console.log('✅ Classes');

    for(const c of cls){
      const subs = c.level==='creche'?['Play','Numbers']:c.level==='kg'?['Math','English']:c.name==='JHS 3'?['Math','English','Science']:['Math','English','Science','ICT'];
      for(const s of subs){ await Subject.create({name:s,code:s.substring(0,3).toUpperCase(),classId:c._id}); }
    }
    console.log('✅ Subjects');

    const allSubjects = await Subject.find().lean();
    const teachers = [];
    for(let i=0;i<tdata.length;i++){ teachers.push(await Teacher.create({userId:(await User.findOne({email:tdata[i].email}))._id,employeeId:'TCH'+(i+1).toString().padStart(3,'0'),firstName:tdata[i].firstName,lastName:tdata[i].lastName,gender:tdata[i].gender})); }
    for(let i=0;i<teachers.length;i++){ const c = cls[i%9+3]; const ss = allSubjects.filter(s=>s.classId.toString()===c._id.toString()).slice(0,2); for(const s of ss){ await TA.create({teacherId:teachers[i]._id,classId:c._id,subjectId:s._id}); } }
    console.log('✅ Assignments');

    const spwd = await bcrypt.hash('student123', 12);
    let stuCount = 0;
    for(const c of cls){
      const num = c.level==='creche'||c.level==='kg'?10:20;
      for(let i=0;i<num;i++){
        stuCount++;
        const g = Math.random()>0.5?'male':'female';
        const fn = firstNames[g][Math.floor(Math.random()*firstNames[g].length)];
        const ln = lastNames[Math.floor(Math.random()*lastNames.length)];
        const year = 2010+Math.floor(Math.random()*6);
        const u = await User.create({email:fn.toLowerCase()+'.'+ln.toLowerCase()+stuCount+'@student.edu',password:spwd,role:'student',firstName:fn,lastName:ln,isActive:true,isVerified:true});
        await Student.create({userId:u._id,studentId:'STU'+stuCount.toString().padStart(4,'0'),firstName:fn,lastName:ln,gender:g,dateOfBirth:new Date(year,0,1),classId:c._id,phone:'+23320'+stuCount,address:'Accra',parentName:ln,parentPhone:'+23320'+stuCount});
      }
    }
    console.log('✅ Students');

    const currentTerms = await Term.find({sessionId:s3._id}).lean();
    const results = [];
    for(const s of cls){
      const ss = allSubjects.filter(x=>x.classId.toString()===s._id.toString());
      const studs = await Student.find({classId:s._id}).lean();
      for(const t of currentTerms){
        for(const st of studs){
          for(const su of ss){
            const sc = 40+Math.floor(Math.random()*60);
            results.push({studentId:st._id,subjectId:su._id,termId:t._id,score:sc,grade:grade(sc),comment:'',isPublished:sc>50});
          }
        }
      }
    }
    await Result.insertMany(results);
    console.log('✅ Results');

    for(let i=0;i<30;i++){
      const g = Math.random()>0.5?'male':'female';
      const fn = firstNames[g][Math.floor(Math.random()*firstNames[g].length)];
      const ln = lastNames[Math.floor(Math.random()*lastNames.length)];
      await Admission.create({firstName:fn,lastName:ln,gender:g,dateOfBirth:new Date(2012,0,1),phone:'+23320'+i,address:'Accra',appliedClass:cls[i%12].name,parentName:ln,parentPhone:'+23320'+i,status:['pending','accepted','rejected'][i%3]});
    }
    console.log('✅ Admissions');

    await News.insertMany([{title:'New Term Begins',content:'Welcome to the new term',category:'Academic',isPublished:true},{title:'Exam Schedule',content:'Exams start next week',category:'Academic',isPublished:true},{title:'Sports Day',content:'Annual sports day',category:'Sports',isPublished:true}]);
    console.log('✅ News');

    console.log('\n📊 DATA SUMMARY');
    console.log(`  Users:       ${await User.countDocuments()}`);
    console.log(`  Students:    ${await Student.countDocuments()}`);
    console.log(`  Teachers:   ${await Teacher.countDocuments()}`);
    console.log(`  Classes:    ${await Class.countDocuments()}`);
    console.log(`  Subjects:   ${await Subject.countDocuments()}`);
    console.log(`  Results:    ${await Result.countDocuments()}`);
    console.log(`  Admissions: ${await Admission.countDocuments()}`);
    console.log('  News:       '+(await News.countDocuments()));

    console.log('\n📋 LOGIN');
    console.log('  Admin:   admin@school.edu / admin123');
    console.log('  Teacher: john.doe@school.edu / teacher123');
    console.log('  Student: STU0001 / student123');
    process.exit(0);
  } catch(e){ console.error(e); process.exit(1); }
}
seed();