import { Course, Student, FeeTransaction, AttendanceRecord, StaffUser, UserRole, InstituteSettings, Expense, StaffSalaryRecord } from '../types';
import { INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_ATTENDANCE, INITIAL_USERS, DEFAULT_SETTINGS, INITIAL_EXPENSES, INITIAL_SALARY_RECORDS } from '../data/initialData';

const STORAGE_KEYS = {
  COURSES: 'tist_courses_v1',
  STUDENTS: 'tist_students_v1',
  TRANSACTIONS: 'tist_transactions_v1',
  ATTENDANCE: 'tist_attendance_v1',
  USERS: 'tist_users_v1',
  EXPENSES: 'tist_expenses_v1',
  SALARY_RECORDS: 'tist_salary_records_v1',
  CURRENT_ROLE: 'tist_current_role_v1',
  SETTINGS: 'tist_settings_v1',
  IS_LOGGED_IN: 'tist_is_logged_in_v1',
  LOGGED_IN_USER: 'tist_logged_in_user_v1',
};

// Safe JSON Parse
function safeParse<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return fallback;
  }
}

// Safe JSON Save
function safeSave<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const getSettings = (): InstituteSettings => safeParse(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
export const saveSettings = (settings: InstituteSettings) => safeSave(STORAGE_KEYS.SETTINGS, settings);

export const getCourses = (): Course[] => safeParse(STORAGE_KEYS.COURSES, INITIAL_COURSES);
export const saveCourses = (courses: Course[]) => safeSave(STORAGE_KEYS.COURSES, courses);

export const getStudents = (): Student[] => safeParse(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
export const saveStudents = (students: Student[]) => safeSave(STORAGE_KEYS.STUDENTS, students);

export const getTransactions = (): FeeTransaction[] => safeParse(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
export const saveTransactions = (txs: FeeTransaction[]) => safeSave(STORAGE_KEYS.TRANSACTIONS, txs);

export const getAttendance = (): AttendanceRecord[] => safeParse(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
export const saveAttendance = (records: AttendanceRecord[]) => safeSave(STORAGE_KEYS.ATTENDANCE, records);

export const getUsers = (): StaffUser[] => safeParse(STORAGE_KEYS.USERS, INITIAL_USERS);
export const saveUsers = (users: StaffUser[]) => safeSave(STORAGE_KEYS.USERS, users);

export const getExpenses = (): Expense[] => safeParse(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
export const saveExpenses = (expenses: Expense[]) => safeSave(STORAGE_KEYS.EXPENSES, expenses);

export const getSalaryRecords = (): StaffSalaryRecord[] => safeParse(STORAGE_KEYS.SALARY_RECORDS, INITIAL_SALARY_RECORDS);
export const saveSalaryRecords = (records: StaffSalaryRecord[]) => safeSave(STORAGE_KEYS.SALARY_RECORDS, records);

export const getCurrentRole = (): UserRole => safeParse(STORAGE_KEYS.CURRENT_ROLE, 'super_admin');
export const setCurrentRole = (role: UserRole) => safeSave(STORAGE_KEYS.CURRENT_ROLE, role);

export const getIsLoggedIn = (): boolean => safeParse(STORAGE_KEYS.IS_LOGGED_IN, false);
export const setIsLoggedInState = (val: boolean) => safeSave(STORAGE_KEYS.IS_LOGGED_IN, val);

export const getLoggedInUser = (): StaffUser | null => safeParse(STORAGE_KEYS.LOGGED_IN_USER, null);
export const setLoggedInUserState = (user: StaffUser | null) => safeSave(STORAGE_KEYS.LOGGED_IN_USER, user);

// Reset storage to demo defaults
export const resetToDefaultData = () => {
  safeSave(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  safeSave(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  safeSave(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  safeSave(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  safeSave(STORAGE_KEYS.USERS, INITIAL_USERS);
  safeSave(STORAGE_KEYS.CURRENT_ROLE, 'super_admin');
  safeSave(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  safeSave(STORAGE_KEYS.IS_LOGGED_IN, true);
};

