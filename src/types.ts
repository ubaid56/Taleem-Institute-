export type UserRole = 'super_admin' | 'accountant' | 'teacher' | 'other_staff';

export type StudentStatus = 'active' | 'pass_out' | 'suspended';

export type PaymentSource = 'cash' | 'bank';

export interface Course {
  id: string;
  code: string;
  name: string; // e.g., "DIT Batch 2026-27"
  baseCourseType: string;
  durationMonths: number;
  monthlyFee: number;
  admissionFee: number;
  examFeeSem1: number; // Only applicable for DIT
  examFeeSem2: number; // Only applicable for DIT
  totalCourseFee?: number; // Total package fee for 'Course Wise' base category
  description?: string;
  active: boolean;
  createdAt: string;
}

export interface StudentCourseEnrollment {
  courseId: string;
  courseName: string;
  durationMonths: number;
  monthlyFee: number;
  admissionFee: number;
  examFeeSem1: number;
  examFeeSem2: number;
  otherFee: number;
  otherFeeRemarks?: string;
  discountAmount?: number;
  discountRemarks?: string;
  totalCalculatedFee: number;
  enrollmentDate: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. TIST-2026-001
  rollNumber?: string;
  registrationNumber?: string;
  photoUrl: string;
  name: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobileNo: string;
  fatherMobileNo: string;
  cnic: string;
  fatherCnic: string;
  address?: string;
  username?: string;
  password?: string;
  portalUsername?: string;
  portalPassword?: string;
  isOrphan?: boolean;
  admissionDate: string;
  courses: StudentCourseEnrollment[];
  discountTotal?: number;
  discountRemarks?: string;
  totalFeeCalculated: number;
  totalFeePaid: number;
  balanceRemaining: number;
  status: StudentStatus;
  statusChangeDate?: string;
  statusChangeRemarks?: string;
  assignedMonthlyFee?: number;
  assignedAdmissionFee?: number;
  assignedExamFee?: number;
  qrCodeData: string;
  isDefaulterExempted?: boolean;
  createdAt: string;
}

export interface FeeBreakdown {
  monthlyFee?: number;
  monthlyFeeMonth?: string; // e.g. "July 2026"
  examFee?: number;
  admissionFee?: number;
  otherFee?: number;
  otherFeeTitle?: string;
  discountAmount?: number;
}

export interface FeeTransaction {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  fatherName: string;
  courseNames: string[];
  paymentDate: string; // YYYY-MM-DD HH:mm
  amountPaid: number;
  previousBalance: number;
  remainingBalance: number;
  paymentSource: PaymentSource;
  feeBreakdown?: FeeBreakdown;
  remarks: string;
  collectedByRole: UserRole;
  collectedByName: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceEntry {
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  courseId: string;
  courseName: string;
  markedByTeacher: string;
  entries: AttendanceEntry[];
  createdAt: string;
}

export interface StaffUser {
  id: string;
  name: string;
  username: string;
  password?: string;
  hasLoginAccess?: boolean;
  role: UserRole;
  email: string;
  phone: string;
  photoUrl?: string;
  designation?: string;
  cnic?: string;
  baseSalary?: number;
  assignedCourses?: string[]; // course IDs assigned to teacher
  permissions: {
    canAddStudent: boolean;
    canEditStudent?: boolean;
    canDeleteStudent?: boolean;
    canSubmitFee: boolean;
    canManageCourses: boolean;
    canViewFinancials: boolean;
    canTakeAttendance: boolean;
    canManageStatus: boolean;
    canManageUsers: boolean;
    canManageExpenses?: boolean;
    canManagePayroll?: boolean;
  };
}

export type ExpenseCategory = 
  | 'Rent' 
  | 'Electricity & Utilities' 
  | 'Internet & Phone' 
  | 'Stationery & Printing' 
  | 'Tea & Refreshments' 
  | 'Maintenance & Repairs' 
  | 'Marketing & Ads' 
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentSource: PaymentSource;
  voucherNo?: string;
  remarks?: string;
  recordedBy: string;
  createdAt: string;
}

export type SalaryPaymentType = 'salary' | 'advance';

export interface StaffSalaryRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: UserRole;
  type: SalaryPaymentType; // 'salary' or 'advance'
  monthYear: string; // e.g., "2026-07"
  amount: number;
  paymentDate: string; // YYYY-MM-DD
  paymentSource: PaymentSource;
  notes?: string;
  recordedBy: string;
  createdAt: string;
}

export interface InstituteSettings {
  instituteName: string;
  subTitle: string;
  address: string;
  phone: string;
  whatsappPhone?: string;
  whatsappDefaultMessage?: string;
  email: string;
  ownerName: string;
  logoUrl: string;
  currencySymbol: string;
  receiptFooterNote: string;
  registrationNo?: string;
  customBaseCategories?: string[];
  
  // Public Website CMS Fields
  marqueeText?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  missionStatement?: string;
  visionStatement?: string;
  directorName?: string;
  directorTitle?: string;
  directorPicUrl?: string;
  directorMessage?: string;
  socialTiktok?: string;
  socialFacebook?: string;
  socialInstagram?: string;
  socialYoutube?: string;
}

export interface PublicStaffMember {
  id: string;
  name: string;
  designation: string;
  description: string;
  photoUrl: string;
  order?: number;
}

export interface PublicEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
  location?: string;
}

export interface OnlineApplication {
  id: string;
  applicantName: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  mobileNo: string;
  cnic?: string;
  email?: string;
  address: string;
  courseId: string;
  courseName: string;
  status: 'pending' | 'accepted' | 'approved' | 'rejected';
  submittedAt: string;
  notes?: string;
  photoUrl?: string;
  dob?: string;
  qualification?: string;
  enrolledStudentId?: string;
}

export type AttachmentType = 'text' | 'image' | 'pdf' | 'doc' | 'excel' | 'word' | 'link';

export interface Assignment {
  id: string;
  title: string;
  description: string;
  courseId: string;
  courseName: string;
  assignedBy?: string;
  assignedByRole?: string;
  createdByUserId?: string;
  createdByName?: string;
  dueDate?: string; // YYYY-MM-DD
  fileType?: 'text' | 'image' | 'pdf' | 'excel' | 'word';
  attachmentType?: AttachmentType;
  attachmentUrl?: string; // File URL or Web link
  attachmentName?: string;
  totalMarks?: number;
  createdAt: string;
}

export interface AssignmentSubmission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNumber?: string;
  courseId: string;
  submissionText?: string;
  attachmentType?: AttachmentType;
  attachmentUrl?: string;
  attachmentName?: string;
  submittedAt: string;
  marksObtained?: number;
  feedback?: string;
  teacherFeedback?: string;
  gradedBy?: string;
  gradedByUserId?: string;
  gradedAt?: string;
  status?: 'submitted' | 'graded';
}

export interface InstituteNotice {
  id: string;
  title: string;
  subtitle?: string;
  category: 'General Notice' | 'Exam Notice' | 'Admission Notice' | 'Holiday Notice';
  description: string;
  imageUrl?: string;
  createdAt: string;
  postedBy?: string;
}

