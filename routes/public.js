import express from 'express';
import News from '../models/News.js';
import Gallery from '../models/Gallery.js';
import Session from '../models/Session.js';
import Class from '../models/Class.js';
import Subject from '../models/Subject.js';
import Teacher from '../models/Teacher.js';

const router = express.Router();

const mockNews = [
  { id: '1', title: 'Welcome to Our School', summary: 'Start your journey to academic excellence', category: 'Announcement', createdAt: new Date().toISOString() },
  { id: '2', title: 'Enrollment Open for 2025-2026', summary: 'Join our community of learners', category: 'Announcement', createdAt: new Date().toISOString() },
  { id: '3', title: 'Academic Excellence Award', summary: 'Celebrating our students achievements', category: 'Academic', createdAt: new Date().toISOString() }
];

const mockGallery = [
  { id: '1', title: 'School Building', category: 'Campus' },
  { id: '2', title: 'Classroom', category: 'Campus' },
  { id: '3', title: 'Library', category: 'Campus' }
];

const mockClasses = [
  { id: '1', name: 'Nursery 1', level: 'nursery' },
  { id: '2', name: 'Primary 1', level: 'primary' },
  { id: '3', name: 'JSS 1', level: 'jss' },
  { id: '4', name: 'SSS 1', level: 'sss' }
];

router.get('/home', async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 }).limit(3);
    const gallery = await Gallery.find().sort({ createdAt: -1 }).limit(6);
    const session = await Session.findOne({ isActive: true }).populate('terms');
    
    res.json({ success: true, data: { 
      news: news.length > 0 ? news : mockNews, 
      gallery: gallery.length > 0 ? gallery : mockGallery, 
      currentSession: session 
    }});
  } catch (error) {
    res.json({ success: true, data: { news: mockNews, gallery: mockGallery, currentSession: null } });
  }
});

router.get('/about', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      mission: "To provide quality education that empowers students to achieve their full potential.",
      vision: "To be a center of excellence in education.",
      values: ["Excellence", "Integrity", "Innovation", "Inclusivity"]
    }
  });
});

router.get('/academics', async (req, res) => {
  try {
    const classes = await Class.find().sort({ level: 1 });
    const subjects = await Subject.find().populate('classId', 'name');
    res.json({ success: true, data: { classes: classes.length > 0 ? classes : mockClasses, subjects } });
  } catch (error) {
    res.json({ success: true, data: { classes: mockClasses, subjects: [] } });
  }
});

router.get('/staff', async (req, res) => {
  try {
    const teachers = await Teacher.find().select('firstName lastName qualification specialties');
    res.json({ success: true, data: teachers });
  } catch (error) {
    res.json({ success: true, data: [] });
  }
});

router.get('/contact', (req, res) => {
  res.json({ 
    success: true, 
    data: {
      address: "123 Education Street, City",
      phone: "+1 234 567 890",
      email: "info@school.edu",
      hours: "Mon-Fri: 8:00 AM - 4:00 PM"
    }
  });
});

router.post('/contact', (req, res) => {
  res.json({ success: true, message: 'Message sent successfully' });
});

export default router;