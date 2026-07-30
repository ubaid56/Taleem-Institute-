import { Course, Student, FeeTransaction, AttendanceRecord, StaffUser, InstituteSettings, Expense, StaffSalaryRecord, PublicStaffMember, PublicEvent, Assignment, AssignmentSubmission, OnlineApplication, InstituteNotice } from '../types';

export const DEFAULT_SETTINGS: InstituteSettings = {
  instituteName: 'Taleem Institute',
  subTitle: 'OF SCIENCE & TECHNOLOGY',
  address: 'Dubai Adda Road, Bakhshali, Mardan, KPK, Pakistan',
  phone: '03481064487',
  whatsappPhone: '923481064487',
  email: 'info@tist.edu.pk',
  ownerName: 'Ubaid Ahmad',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=200',
  currencySymbol: 'PKR',
  receiptFooterNote: 'Thank you for choosing Taleem Institute of Science & Technology!',
  registrationNo: 'REG-2026/TIST/99',
  
  // Public Website Content
  marqueeText: '📢 ADMISSIONS OPEN FOR BATCH 2026-27! • DIT, CIT, Web Development, Graphics Designing & Spoken English • Contact: 03481064487',
  heroTitle: 'Empowering Youth with Future-Ready Technical Skills',
  heroSubtitle: 'Leading Vocational & Information Technology Institute committed to practical hands-on training, industry certification, and career success.',
  missionStatement: 'To equip students with state-of-the-art technological education, practical skills, and ethical values, enabling them to excel in the global digital economy.',
  visionStatement: 'To become a premier center of excellence for IT and technical education, recognized for innovation, student achievement, and community development.',
  directorName: 'Engr. Ubaid Ahmad',
  directorTitle: 'Founder & Managing Director',
  directorPicUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
  directorMessage: 'Welcome to Taleem Institute of Science & Technology! Our vision is to provide world-class, affordable technical and vocational education to empower youth with high-demand digital skills.',
  socialTiktok: 'https://tiktok.com/@taleeminstitute',
  socialFacebook: 'https://facebook.com/taleeminstitutemardan',
  socialInstagram: 'https://instagram.com/taleeminstitute',
  socialYoutube: 'https://youtube.com/@taleeminstitute',
};

export const INITIAL_PUBLIC_STAFF: PublicStaffMember[] = [
  {
    id: 'staff-1',
    name: 'Engr. Ubaid Ahmad',
    designation: 'Managing Director & Founder',
    description: 'B.Sc. Software Engineering with 8+ years of technical education and management experience.',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400',
    order: 1
  },
  {
    id: 'staff-2',
    name: 'Prof. Asad Khan',
    designation: 'Senior Web & DIT Instructor',
    description: 'Expert Web Application Architect, certified network specialist, leading practical lab sessions.',
    photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
    order: 2
  },
  {
    id: 'staff-3',
    name: 'Sajid Khan',
    designation: 'Head Accountant & Admissions Administrator',
    description: 'Financial management specialist overseeing student registrations, accounts, and queries.',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    order: 3
  }
];

export const INITIAL_PUBLIC_EVENTS: PublicEvent[] = [
  {
    id: 'event-1',
    title: 'Annual IT Exhibition & Project Showcase 2026',
    date: '2026-08-15',
    location: 'Main Auditorium, TIST Campus',
    description: 'Students presenting final semester full-stack websites, mobile apps, and graphic branding projects.',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600'
  },
  {
    id: 'event-2',
    title: 'Graduation & Certificate Distribution Ceremony',
    date: '2026-09-10',
    location: 'TIST Main Campus',
    description: 'Honoring DIT and CIT graduates with official board certificates and awards for top performers.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=600'
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'DIT Semester 1: HTML & CSS Responsive Layout Project',
    description: 'Build a responsive multi-page website layout using HTML5 and CSS Flexbox/Grid. Submit your source code or GitHub link.',
    courseId: 'course-dit-2026',
    courseName: 'DIT Batch 2026-27 (Diploma in Info Tech)',
    assignedBy: 'Prof. Asad Khan',
    assignedByRole: 'teacher',
    dueDate: '2026-08-05',
    attachmentType: 'pdf',
    attachmentUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
    attachmentName: 'HTML_CSS_Assignment_Guidelines.pdf',
    totalMarks: 50,
    createdAt: '2026-07-25'
  }
];

export const INITIAL_ASSIGNMENT_SUBMISSIONS: AssignmentSubmission[] = [];

export const INITIAL_ONLINE_APPLICATIONS: OnlineApplication[] = [];

export const INITIAL_NOTICES: InstituteNotice[] = [
  {
    id: 'notice-1',
    title: 'Admissions Open for DIT & CIT New Batches 2026-27',
    subtitle: 'Limited Seats Available - Register Online Today!',
    category: 'Admission Notice',
    description: 'Admissions are officially open for Diploma in Information Technology (DIT 1 Year) and Certificate in Information Technology (CIT 6 Months). Apply online or visit campus admissions office.',
    imageUrl: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-07-28',
    postedBy: 'Admin Office'
  },
  {
    id: 'notice-2',
    title: 'Mid-Term Examination Schedule Announced',
    subtitle: 'DIT Semester 1 & 2 Students',
    category: 'Exam Notice',
    description: 'Mid-term practical examinations will commence from August 10, 2026. All students are advised to collect their roll number slips from the accountant office.',
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=800',
    createdAt: '2026-07-26',
    postedBy: 'Examination Department'
  }
];

export const INITIAL_COURSES: Course[] = [
  {
    id: 'course-dit-2026',
    code: 'DIT-2026',
    name: 'DIT Batch 2026-27 (Diploma in Info Tech)',
    baseCourseType: 'DIT',
    durationMonths: 12,
    monthlyFee: 2000,
    admissionFee: 3000,
    examFeeSem1: 1500,
    examFeeSem2: 1500,
    description: '1-Year Board recognized Diploma in Information Technology covering Hardware, Networking, Web & DB.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'course-cit-2026',
    code: 'CIT-2026',
    name: 'CIT Batch 2026 (Certificate in Info Tech)',
    baseCourseType: 'CIT',
    durationMonths: 6,
    monthlyFee: 2500,
    admissionFee: 2000,
    examFeeSem1: 0,
    examFeeSem2: 0,
    description: '6-Month Certificate Course in Computer Concepts, Office Automation and Internet Applications.',
    active: true,
    createdAt: '2026-01-01',
  },
  {
    id: 'course-eng-2026',
    code: 'ENG-2026',
    name: 'English Language Spoken & Grammar',
    baseCourseType: 'English Language',
    durationMonths: 3,
    monthlyFee: 1800,
    admissionFee: 1000,
    examFeeSem1: 0,
    examFeeSem2: 0,
    description: '3-Month Spoken English, Pronunciation, Grammar, and Public Speaking Intensive Module.',
    active: true,
    createdAt: '2026-01-05',
  },
  {
    id: 'course-web-2026',
    code: 'WEB-2026',
    name: 'Full Stack Web Development',
    baseCourseType: 'Web Development',
    durationMonths: 6,
    monthlyFee: 3500,
    admissionFee: 2500,
    examFeeSem1: 0,
    examFeeSem2: 0,
    description: 'HTML5, CSS3, JavaScript, React.js, Node.js & Database Engineering.',
    active: true,
    createdAt: '2026-02-01',
  },
  {
    id: 'course-gfx-2026',
    code: 'GFX-2026',
    name: 'Graphics Designing Masterclass',
    baseCourseType: 'Graphics Designing',
    durationMonths: 4,
    monthlyFee: 3000,
    admissionFee: 2000,
    examFeeSem1: 0,
    examFeeSem2: 0,
    description: 'Adobe Photoshop, Illustrator, InDesign, UI/UX Essentials, Branding & Print Media.',
    active: true,
    createdAt: '2026-02-10',
  },
  {
    id: 'course-yta-2026',
    code: 'YTA-2026',
    name: 'YouTube Automation & Monetization',
    baseCourseType: 'YouTube Automation',
    durationMonths: 3,
    monthlyFee: 4000,
    admissionFee: 2000,
    examFeeSem1: 0,
    examFeeSem2: 0,
    description: 'Faceless channels, Scriptwriting, AI Voiceovers, Video Editing, SEO & Monetization strategy.',
    active: true,
    createdAt: '2026-03-01',
  },
  {
    id: 'course-cw-2026',
    code: 'CW-2026',
    name: 'Short Computer Course (Course-Wise Fee)',
    baseCourseType: 'Course Wise',
    durationMonths: 2,
    monthlyFee: 0,
    admissionFee: 0,
    examFeeSem1: 0,
    examFeeSem2: 0,
    totalCourseFee: 8000,
    description: 'Fixed lump-sum course fee package. Monthly tuition and admission fees are disabled for this course.',
    active: true,
    createdAt: '2026-03-05',
  },
  {
    id: 'course-other-2026',
    code: 'OTH-2026',
    name: 'Other / Custom Short Course',
    baseCourseType: 'Other',
    durationMonths: 2,
    monthlyFee: 0,
    admissionFee: 0,
    examFeeSem1: 0,
    examFeeSem2: 0,
    totalCourseFee: 7500,
    description: 'Custom vocational or specialized skill training program with custom total course fee.',
    active: true,
    createdAt: '2026-03-05',
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: 'std-101',
    studentId: 'TIST-2026-001',
    rollNumber: '101',
    registrationNumber: 'REG-2026-001',
    photoUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300',
    name: 'Muhammad Ali',
    fatherName: 'Tariq Khan',
    gender: 'Male',
    dob: '2004-05-12',
    mobileNo: '0300-1234567',
    fatherMobileNo: '0300-7654321',
    cnic: '17301-1234567-1',
    fatherCnic: '17301-7654321-1',
    address: 'Dubai Adda Road, Bakhshali, Mardan',
    username: '101',
    password: '123456',
    admissionDate: '2026-01-10',
    status: 'active',
    courses: [
      {
        courseId: 'course-dit-2026',
        courseName: 'DIT Batch 2026-27 (Diploma in Info Tech)',
        durationMonths: 12,
        monthlyFee: 2000,
        admissionFee: 3000,
        examFeeSem1: 1500,
        examFeeSem2: 1500,
        otherFee: 0,
        totalCalculatedFee: 30000,
        enrollmentDate: '2026-01-10'
      }
    ],
    totalFeeCalculated: 30000,
    totalFeePaid: 10000,
    balanceRemaining: 20000,
    qrCodeData: 'TIST-2026-001|Muhammad Ali|0300-1234567',
    createdAt: '2026-01-10'
  },
  {
    id: 'std-102',
    studentId: 'TIST-2026-002',
    rollNumber: '102',
    registrationNumber: 'REG-2026-002',
    photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300',
    name: 'Ayesha Bibi',
    fatherName: 'Shahid Iqbal',
    gender: 'Female',
    dob: '2005-08-20',
    mobileNo: '0312-9876543',
    fatherMobileNo: '0312-3456789',
    cnic: '17301-8889991-2',
    fatherCnic: '17301-1112223-3',
    address: 'Near City Hospital, Mardan',
    username: '102',
    password: '123456',
    admissionDate: '2026-02-01',
    status: 'active',
    courses: [
      {
        courseId: 'course-web-2026',
        courseName: 'Full Stack Web Development',
        durationMonths: 6,
        monthlyFee: 3500,
        admissionFee: 2500,
        examFeeSem1: 0,
        examFeeSem2: 0,
        otherFee: 0,
        totalCalculatedFee: 23500,
        enrollmentDate: '2026-02-01'
      }
    ],
    totalFeeCalculated: 23500,
    totalFeePaid: 6000,
    balanceRemaining: 17500,
    qrCodeData: 'TIST-2026-002|Ayesha Bibi|0312-9876543',
    createdAt: '2026-02-01'
  }
];

export const INITIAL_TRANSACTIONS: FeeTransaction[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_USERS: StaffUser[] = [
  {
    id: 'usr-admin',
    name: 'Ubaid Ahmad',
    username: 'admin',
    password: 'admin123',
    role: 'super_admin',
    email: 'ubaidahmad184@gmail.com',
    phone: '03481064487',
    baseSalary: 80000,
    permissions: {
      canAddStudent: true,
      canSubmitFee: true,
      canManageCourses: true,
      canViewFinancials: true,
      canTakeAttendance: true,
      canManageStatus: true,
      canManageUsers: true,
      canManageExpenses: true,
      canManagePayroll: true,
    }
  },
  {
    id: 'usr-acct',
    name: 'Sajid Khan',
    username: 'sajid_accountant',
    password: 'accountant123',
    role: 'accountant',
    email: 'sajid.tist@gmail.com',
    phone: '0301-1112223',
    baseSalary: 45000,
    permissions: {
      canAddStudent: true,
      canSubmitFee: true,
      canManageCourses: false,
      canViewFinancials: true,
      canTakeAttendance: false,
      canManageStatus: false,
      canManageUsers: false,
      canManageExpenses: true,
      canManagePayroll: true,
    }
  },
  {
    id: 'usr-teacher',
    name: 'Prof. Asad Khan',
    username: 'asad_teacher',
    password: 'teacher123',
    role: 'teacher',
    email: 'asad.teacher@tist.edu.pk',
    phone: '0333-4445556',
    baseSalary: 55000,
    assignedCourses: ['course-dit-2026', 'course-cit-2026', 'course-web-2026'],
    permissions: {
      canAddStudent: false,
      canSubmitFee: false,
      canManageCourses: false,
      canViewFinancials: false,
      canTakeAttendance: true,
      canManageStatus: false,
      canManageUsers: false,
      canManageExpenses: false,
      canManagePayroll: false,
    }
  }
];

export const INITIAL_EXPENSES: Expense[] = [];

export const INITIAL_SALARY_RECORDS: StaffSalaryRecord[] = [];
