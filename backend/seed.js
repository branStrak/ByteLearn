const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Models
const User = require('./model/User');
const Course = require('./model/Course');
const Module = require('./model/Module');
const Lesson = require('./model/Lesson');
const Quiz = require('./model/Quiz');
const Question = require('./model/Question');
const Assignment = require('./model/Assignment');
const Enrollment = require('./model/Enrollment');

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for Seeding...');

        // Clear existing data (optional, but good for a fresh start)
        // await User.deleteMany();
        // await Course.deleteMany();
        // await Module.deleteMany();
        // await Lesson.deleteMany();
        // await Quiz.deleteMany();
        // await Question.deleteMany();
        // await Assignment.deleteMany();
        // await Enrollment.deleteMany();
        // console.log('Previous data cleared (if any).');

        // Create Admin
        const adminPass = await bcrypt.hash('admin123', 10);
        let admin = await User.findOne({ email: 'admin@bytelearn.com' });
        if (!admin) {
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@bytelearn.com',
                password: 'admin123', // Mongoose pre-save will hash it if we don't, but let's let pre-save handle it
                role: 'admin',
                isVerified: true
            });
        }

        // Create Educators
        let educator1 = await User.findOne({ email: 'sarah.connor@bytelearn.com' });
        if (!educator1) {
            educator1 = await User.create({
                name: 'Sarah Connor',
                email: 'sarah.connor@bytelearn.com',
                password: 'password123',
                role: 'educator',
                isVerified: true,
                educatorApplication: {
                    status: 'approved',
                    qualifications: 'Ph.D. in Computer Science',
                    experience: '10 years teaching AI and Web Development',
                    appliedAt: new Date()
                },
                profilePicture: 'https://randomuser.me/api/portraits/women/44.jpg'
            });
        }

        let educator2 = await User.findOne({ email: 'david.miller@bytelearn.com' });
        if (!educator2) {
            educator2 = await User.create({
                name: 'David Miller',
                email: 'david.miller@bytelearn.com',
                password: 'password123',
                role: 'educator',
                isVerified: true,
                educatorApplication: {
                    status: 'approved',
                    qualifications: 'MSc in Data Science',
                    experience: '5 years industry experience',
                    appliedAt: new Date()
                },
                profilePicture: 'https://randomuser.me/api/portraits/men/32.jpg'
            });
        }

        // Create Students
        const students = [];
        for (let i = 1; i <= 5; i++) {
            let student = await User.findOne({ email: `student${i}@example.com` });
            if (!student) {
                student = await User.create({
                    name: `Student User ${i}`,
                    email: `student${i}@example.com`,
                    password: 'password123',
                    role: 'student',
                    isVerified: true,
                    profilePicture: `https://randomuser.me/api/portraits/${i % 2 === 0 ? 'women' : 'men'}/${i + 10}.jpg`
                });
            }
            students.push(student);
        }

        // Create Courses
        const course1Title = 'Full-Stack React & Node.js Masterclass';
        let course1 = await Course.findOne({ title: course1Title });
        if (!course1) {
            course1 = await Course.create({
                educatorId: educator1._id,
                title: course1Title,
                description: 'Learn to build scalable, full-stack applications using React.js for the frontend and Node.js/Express for the backend. Includes database management with MongoDB.',
                thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1000&auto=format&fit=crop',
                category: 'Web Development',
                tags: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
                price: 1999,
                isPaid: true,
                level: 'Intermediate',
                language: 'English',
                status: 'approved',
                totalDuration: 120, // arbitrary unit
                totalLessons: 4,
                rating: 4.8,
                totalRatings: 15,
                enrolledStudents: 120
            });

            // Add Modules
            const module1 = await Module.create({
                courseId: course1._id,
                title: 'Getting Started with React',
                order: 1
            });
            const module2 = await Module.create({
                courseId: course1._id,
                title: 'Backend with Node.js & Express',
                order: 2
            });

            // Add Lessons to Module 1
            await Lesson.create([
                {
                    moduleId: module1._id,
                    title: 'Introduction to React Concepts',
                    lessonType: 'video',
                    videoUrl: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', // sample React video
                    content: 'In this lesson, we will cover the basics of React, components, and state.',
                    duration: 15,
                    order: 1
                },
                {
                    moduleId: module1._id,
                    title: 'Hooks and State Management',
                    lessonType: 'article',
                    content: '<h1>Hooks overview</h1><p>React hooks allow you to use state and other features without writing a class...</p>',
                    duration: 10,
                    order: 2
                }
            ]);

            // Add Quiz to Module 1
            const quiz1 = await Quiz.create({
                moduleId: module1._id,
                title: 'React Fundamentals Quiz',
                duration: 15,
                order: 3
            });

            await Question.create([
                {
                    quizId: quiz1._id,
                    question: 'What is the purpose of useState?',
                    options: ['To fetch data', 'To manage local state in a functional component', 'To manage global state', 'To connect to a database'],
                    correctAnswer: 1,
                    marks: 5
                },
                {
                    quizId: quiz1._id,
                    question: 'Which hook is used for side effects?',
                    options: ['useContext', 'useReducer', 'useEffect', 'useMemo'],
                    correctAnswer: 2,
                    marks: 5
                }
            ]);

            // Add Lessons to Module 2
            await Lesson.create([
                {
                    moduleId: module2._id,
                    title: 'Setting up an Express Server',
                    lessonType: 'video',
                    videoUrl: 'https://www.youtube.com/watch?v=pKd0Rpw7O48',
                    content: 'Learn how to initialize a Node project and set up a basic Express server.',
                    duration: 20,
                    order: 1
                }
            ]);

            // Add Assignment
            await Assignment.create({
                moduleId: module2._id,
                title: 'Build a REST API',
                instructions: 'Create a simple REST API with GET, POST, PUT, and DELETE endpoints for a User model.',
                totalMarks: 50,
                order: 2
            });
        }


        const course2Title = 'Python for Data Science';
        let course2 = await Course.findOne({ title: course2Title });
        if (!course2) {
            course2 = await Course.create({
                educatorId: educator2._id,
                title: course2Title,
                description: 'Master Python programming and learn how to analyze data, create visualizations, and build machine learning models using Pandas, NumPy, and Scikit-Learn.',
                thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bfce8?q=80&w=1000&auto=format&fit=crop',
                category: 'Data Science',
                tags: ['Python', 'Data Analysis', 'Machine Learning', 'Pandas'],
                price: 0,
                isPaid: false,
                level: 'Beginner',
                language: 'English',
                status: 'approved',
                rating: 4.5,
                totalRatings: 42,
                enrolledStudents: 350
            });
            
             const module3 = await Module.create({
                courseId: course2._id,
                title: 'Python Basics',
                order: 1
            });
            
            await Lesson.create({
                moduleId: module3._id,
                title: 'Variables and Data Types',
                lessonType: 'video',
                videoUrl: 'https://www.youtube.com/watch?v=k9TUPpGqYTo', 
                content: 'Introduction to Python data types and variable assignment.',
                duration: 12,
                order: 1
            });
        }

        console.log('✅ Seeding completed successfully!');
        
        console.log('\n--- Sample Accounts ---');
        console.log('Educator 1: sarah.connor@bytelearn.com / password123');
        console.log('Educator 2: david.miller@bytelearn.com / password123');
        console.log('Student 1: student1@example.com / password123');
        console.log('-----------------------\n');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
