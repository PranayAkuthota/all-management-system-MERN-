const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Course = require('./models/Course');
const Payment = require('./models/Payment');
const Coupon = require('./models/Coupon');
const { v4: uuidv4 } = require('uuid');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lms_ecera';

const COURSES_DATA = [
  // Web Development
  { title: 'Complete React.js Bootcamp 2024', description: 'Master React from scratch — hooks, context, Redux, React Router and build 10 real projects. Perfect for beginners and intermediate developers.', category: 'Web Development', price: 49, tags: ['react', 'javascript', 'frontend'] },
  { title: 'Complete React.js Bootcamp 2024 — Advanced', description: 'Advanced React patterns, performance optimization, server components, and Next.js integration. Build production-grade applications.', category: 'Web Development', price: 59, tags: ['react', 'advanced', 'nextjs'] },
  { title: 'Node.js & Express — Backend Mastery', description: 'Build scalable REST APIs with Node.js and Express. Covers authentication, file uploads, email, and deployment to AWS.', category: 'Web Development', price: 45, tags: ['nodejs', 'express', 'backend'] },
  { title: 'Node.js & Express — REST APIs & Microservices', description: 'Deep dive into building microservices architecture with Node.js, message queues, Docker, and Kubernetes deployment.', category: 'Web Development', price: 55, tags: ['nodejs', 'microservices', 'docker'] },
  { title: 'Full Stack MERN Development', description: 'Build complete full-stack web applications using MongoDB, Express, React, and Node.js. Includes 3 capstone projects.', category: 'Web Development', price: 69, tags: ['mern', 'fullstack', 'mongodb'] },
  { title: 'Full Stack MERN — E-Commerce Project', description: 'Build a production-ready e-commerce platform with MERN stack including cart, payments, admin panel and deployment.', category: 'Web Development', price: 79, tags: ['mern', 'ecommerce', 'project'] },
  { title: 'HTML, CSS & JavaScript Fundamentals', description: 'Start your web development journey. Learn HTML5, CSS3, Flexbox, Grid, and modern JavaScript ES6+.', category: 'Web Development', price: 0, tags: ['html', 'css', 'javascript'] },
  // Data Science
  { title: 'Python for Data Science & Machine Learning', description: 'Complete data science course covering NumPy, Pandas, Matplotlib, Scikit-learn, and ML algorithms with real datasets.', category: 'Data Science', price: 59, tags: ['python', 'ml', 'datascience'] },
  { title: 'Python for Data Science — Deep Learning', description: 'Advanced deep learning with TensorFlow and Keras. Build CNNs, RNNs, transformers and deploy ML models.', category: 'Data Science', price: 69, tags: ['python', 'tensorflow', 'deeplearning'] },
  { title: 'SQL & Database Design Masterclass', description: 'Master SQL from basics to advanced queries, joins, indexes, stored procedures and database design principles.', category: 'Data Science', price: 39, tags: ['sql', 'database', 'postgresql'] },
  // Mobile
  { title: 'React Native — Build iOS & Android Apps', description: 'Create cross-platform mobile apps using React Native. Build a food delivery and social media app from scratch.', category: 'Mobile', price: 55, tags: ['reactnative', 'mobile', 'ios', 'android'] },
  { title: 'React Native — Advanced & Animations', description: 'Advanced React Native with gesture handler, Reanimated 2, navigation, push notifications and app store publishing.', category: 'Mobile', price: 65, tags: ['reactnative', 'animations', 'advanced'] },
  // Design
  { title: 'UI/UX Design with Figma', description: 'Learn professional UI/UX design using Figma. Create wireframes, prototypes, and design systems used by top companies.', category: 'Design', price: 45, tags: ['figma', 'ux', 'design'] },
  { title: 'UI/UX Design — Design Systems & Handoff', description: 'Create scalable design systems, component libraries, and developer handoffs. Covers Figma Variables and Auto Layout.', category: 'Design', price: 49, tags: ['figma', 'designsystem', 'advanced'] },
  // DevOps
  { title: 'Docker & Kubernetes for Developers', description: 'Master containerization with Docker and orchestration with Kubernetes. Deploy apps to GCP, AWS, and Azure.', category: 'DevOps', price: 59, tags: ['docker', 'kubernetes', 'devops'] },
  { title: 'AWS Cloud Practitioner to Solutions Architect', description: 'Complete AWS course covering EC2, S3, RDS, Lambda, VPC, IAM and preparation for the AWS certification exam.', category: 'DevOps', price: 69, tags: ['aws', 'cloud', 'certification'] },
];

const LESSONS_TEMPLATE = [
  { title: 'Introduction & Course Overview', content: 'Welcome! Learn what we will build and set up your environment.', duration: 15, order: 1 },
  { title: 'Core Concepts — Part 1', content: 'Deep dive into the foundational concepts of this topic.', duration: 45, order: 2 },
  { title: 'Core Concepts — Part 2', content: 'Continue building on the fundamentals with more examples.', duration: 40, order: 3 },
  { title: 'Hands-on Project', content: 'Build your first mini-project applying what you have learned.', duration: 60, order: 4 },
  { title: 'Advanced Topics', content: 'Level up with advanced patterns and real-world scenarios.', duration: 50, order: 5 },
  { title: 'Final Project & Wrap Up', content: 'Complete the capstone project and review key takeaways.', duration: 90, order: 6 },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Course.deleteMany({});
  await Payment.deleteMany({});
  await Coupon.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create Users
  const adminPass = await bcrypt.hash('admin123', 12);
  const instrPass = await bcrypt.hash('instructor123', 12);
  const studentPass = await bcrypt.hash('student123', 12);

  const admin = await User.create({ name: 'Admin User', email: 'admin@learnhub.com', password: adminPass, role: 'admin' });

  const instructors = await User.insertMany([
    { name: 'Sarah Johnson', email: 'sarah@learnhub.com', password: instrPass, role: 'instructor' },
    { name: 'Mark Patel', email: 'mark@learnhub.com', password: instrPass, role: 'instructor' },
    { name: 'Priya Sharma', email: 'priya@learnhub.com', password: instrPass, role: 'instructor' },
    { name: 'James Wilson', email: 'james@learnhub.com', password: instrPass, role: 'instructor' },
  ]);

  const students = await User.insertMany([
    { name: 'Alex Kumar', email: 'alex@student.com', password: studentPass, role: 'student' },
    { name: 'Meera Singh', email: 'meera@student.com', password: studentPass, role: 'student' },
    { name: 'Ravi Verma', email: 'ravi@student.com', password: studentPass, role: 'student' },
  ]);

  console.log(`👤 Created ${1 + instructors.length + students.length} users`);

  // Create Courses — assign to instructors
  const instrIds = instructors.map(i => i._id);
  const courseDocs = COURSES_DATA.map((c, idx) => ({
    ...c,
    instructor: instrIds[idx % instrIds.length],
    isPublished: true,
    lessons: LESSONS_TEMPLATE,
    enrolledStudents: [],
    rating: (3.8 + Math.random() * 1.2).toFixed(1),
    totalRatings: Math.floor(Math.random() * 500) + 50,
  }));
  const courses = await Course.insertMany(courseDocs);
  console.log(`📚 Created ${courses.length} courses`);

  // Create Coupons
  const future = new Date();
  future.setFullYear(future.getFullYear() + 1);
  await Coupon.insertMany([
    { code: 'SAVE10', discountType: 'percentage', discountValue: 10, minPurchase: 0, usageLimit: 100, usedCount: 12, expiryDate: future, isActive: true, createdBy: admin._id },
    { code: 'SAVE20', discountType: 'percentage', discountValue: 20, minPurchase: 30, maxDiscount: 15, usageLimit: 50, usedCount: 8, expiryDate: future, isActive: true, createdBy: admin._id },
    { code: 'FLAT5', discountType: 'fixed', discountValue: 5, minPurchase: 20, usageLimit: 200, usedCount: 45, expiryDate: future, isActive: true, createdBy: admin._id },
    { code: 'WELCOME', discountType: 'percentage', discountValue: 15, minPurchase: 0, usageLimit: 500, usedCount: 120, expiryDate: future, isActive: true, createdBy: admin._id },
    { code: 'EXPIRED50', discountType: 'percentage', discountValue: 50, minPurchase: 0, expiryDate: new Date('2023-01-01'), isActive: false, createdBy: admin._id },
  ]);
  console.log('🎟️  Created 5 coupons');

  // Create Payments — students enroll in specific courses
  const paymentData = [];

  // Alex buys 3 courses (completed)
  const alexCourses = [courses[0], courses[4], courses[7]];
  for (const course of alexCourses) {
    paymentData.push({
      user: students[0]._id,
      course: course._id,
      amount: course.price,
      currency: 'USD',
      status: 'completed',
      paymentMethod: 'card',
      transactionId: uuidv4(),
      discountAmount: 0,
      createdAt: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000),
    });
    await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: students[0]._id } });
    await User.findByIdAndUpdate(students[0]._id, { $addToSet: { enrolledCourses: course._id } });
  }

  // Meera buys 2 courses — one with coupon
  const meeraCourses = [courses[1], courses[11]];
  paymentData.push({
    user: students[1]._id, course: meeraCourses[0]._id,
    amount: meeraCourses[0].price * 0.9, currency: 'USD', status: 'completed',
    paymentMethod: 'upi', transactionId: uuidv4(), discountAmount: meeraCourses[0].price * 0.1,
    createdAt: new Date(Date.now() - 7 * 86400000),
  });
  paymentData.push({
    user: students[1]._id, course: meeraCourses[1]._id,
    amount: meeraCourses[1].price, currency: 'USD', status: 'completed',
    paymentMethod: 'paypal', transactionId: uuidv4(), discountAmount: 0,
    createdAt: new Date(Date.now() - 3 * 86400000),
  });
  for (const course of meeraCourses) {
    await Course.findByIdAndUpdate(course._id, { $addToSet: { enrolledStudents: students[1]._id } });
    await User.findByIdAndUpdate(students[1]._id, { $addToSet: { enrolledCourses: course._id } });
  }

  // Ravi buys 1 course
  paymentData.push({
    user: students[2]._id, course: courses[14]._id,
    amount: courses[14].price, currency: 'USD', status: 'completed',
    paymentMethod: 'card', transactionId: uuidv4(), discountAmount: 0,
    createdAt: new Date(Date.now() - 15 * 86400000),
  });
  await Course.findByIdAndUpdate(courses[14]._id, { $addToSet: { enrolledStudents: students[2]._id } });
  await User.findByIdAndUpdate(students[2]._id, { $addToSet: { enrolledCourses: courses[14]._id } });

  await Payment.insertMany(paymentData);
  console.log(`💳 Created ${paymentData.length} payments`);

  console.log('\n✅ Database seeded successfully!\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔑 LOGIN CREDENTIALS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:      admin@learnhub.com    / admin123');
  console.log('Instructor: sarah@learnhub.com    / instructor123');
  console.log('Student:    alex@student.com      / student123');
  console.log('Student:    meera@student.com     / student123');
  console.log('Student:    ravi@student.com      / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  console.log('🎟️  COUPON CODES: SAVE10 | SAVE20 | FLAT5 | WELCOME\n');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
