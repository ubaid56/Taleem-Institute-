export type UserRole = 'super_admin' | 'accountant' | 'teacher';

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
  photoUrl: string;
  name: string;
  fatherName: string;
  gender: 'Male' | 'Female' | 'Other';
  dob: string;
  mobileNo: string;
  fatherMobileNo: string;
  cnic: string;
  fatherCnic: string;
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
  email: string;
  ownerName: string;
  logoUrl: string;
  currencySymbol: string;
  receiptFooterNote: string;
  registrationNo?: string;
  customBaseCategories?: string[];
}

