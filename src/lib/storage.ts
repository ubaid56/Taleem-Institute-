import { Course, Student, FeeTransaction, AttendanceRecord, StaffUser, UserRole, InstituteSettings, Expense, StaffSalaryRecord, PublicStaffMember, PublicEvent, Assignment, AssignmentSubmission, OnlineApplication, InstituteNotice } from '../types';
import { INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_ATTENDANCE, INITIAL_USERS, DEFAULT_SETTINGS, INITIAL_EXPENSES, INITIAL_SALARY_RECORDS, INITIAL_PUBLIC_STAFF, INITIAL_PUBLIC_EVENTS, INITIAL_ASSIGNMENTS, INITIAL_ASSIGNMENT_SUBMISSIONS, INITIAL_ONLINE_APPLICATIONS, INITIAL_NOTICES } from '../data/initialData';

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
  PUBLIC_STAFF: 'tist_public_staff_v1',
  PUBLIC_EVENTS: 'tist_public_events_v1',
  ASSIGNMENTS: 'tist_assignments_v1',
  ASSIGNMENT_SUBMISSIONS: 'tist_assignment_submissions_v1',
  ONLINE_APPLICATIONS: 'tist_online_applications_v1',
  NOTICES: 'tist_notices_v1',
  LOGGED_IN_STUDENT: 'tist_logged_in_student_v1',
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

export const getIsLoggedIn = (): boolean => {
  try {
    const isSessionLoggedIn = sessionStorage.getItem('tist_is_logged_in_v1');
    if (isSessionLoggedIn === 'true') {
      const lastActive = sessionStorage.getItem('tist_last_active_v1');
      if (lastActive) {
        const diff = Date.now() - Number(lastActive);
        // 15 minutes session timeout on inactivity or sleep
        if (diff > 15 * 60 * 1000) {
          sessionStorage.removeItem('tist_is_logged_in_v1');
          return false;
        }
      }
      return true;
    }
  } catch (e) {
    console.error('Error checking login session:', e);
  }
  return false;
};

export const setIsLoggedInState = (val: boolean) => {
  try {
    if (val) {
      sessionStorage.setItem('tist_is_logged_in_v1', 'true');
      sessionStorage.setItem('tist_last_active_v1', Date.now().toString());
    } else {
      sessionStorage.removeItem('tist_is_logged_in_v1');
      sessionStorage.removeItem('tist_last_active_v1');
    }
  } catch (e) {
    console.error('Error setting login session:', e);
  }
};

export const updateLastActiveTime = () => {
  try {
    sessionStorage.setItem('tist_last_active_v1', Date.now().toString());
  } catch (e) {
    // ignore
  }
};

export const getLoggedInUser = (): StaffUser | null => safeParse(STORAGE_KEYS.LOGGED_IN_USER, null);
export const setLoggedInUserState = (user: StaffUser | null) => safeSave(STORAGE_KEYS.LOGGED_IN_USER, user);

export const getPublicStaff = (): PublicStaffMember[] => safeParse(STORAGE_KEYS.PUBLIC_STAFF, INITIAL_PUBLIC_STAFF);
export const savePublicStaff = (staff: PublicStaffMember[]) => safeSave(STORAGE_KEYS.PUBLIC_STAFF, staff);

export const getPublicEvents = (): PublicEvent[] => safeParse(STORAGE_KEYS.PUBLIC_EVENTS, INITIAL_PUBLIC_EVENTS);
export const savePublicEvents = (events: PublicEvent[]) => safeSave(STORAGE_KEYS.PUBLIC_EVENTS, events);

export const getAssignments = (): Assignment[] => safeParse(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
export const saveAssignments = (asgs: Assignment[]) => safeSave(STORAGE_KEYS.ASSIGNMENTS, asgs);

export const getAssignmentSubmissions = (): AssignmentSubmission[] => safeParse(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
export const saveAssignmentSubmissions = (subs: AssignmentSubmission[]) => safeSave(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, subs);

export const getOnlineApplications = (): OnlineApplication[] => safeParse(STORAGE_KEYS.ONLINE_APPLICATIONS, INITIAL_ONLINE_APPLICATIONS);
export const saveOnlineApplications = (apps: OnlineApplication[]) => safeSave(STORAGE_KEYS.ONLINE_APPLICATIONS, apps);

export const getNotices = (): InstituteNotice[] => safeParse(STORAGE_KEYS.NOTICES, INITIAL_NOTICES);
export const saveNotices = (notices: InstituteNotice[]) => safeSave(STORAGE_KEYS.NOTICES, notices);

export const getLoggedInStudent = (): Student | null => safeParse(STORAGE_KEYS.LOGGED_IN_STUDENT, null);
export const setLoggedInStudentState = (student: Student | null) => safeSave(STORAGE_KEYS.LOGGED_IN_STUDENT, student);

// Reset storage to demo defaults
export const resetToDefaultData = () => {
  localStorage.removeItem('tist_explicitly_cleared');
  safeSave(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  safeSave(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
  safeSave(STORAGE_KEYS.TRANSACTIONS, INITIAL_TRANSACTIONS);
  safeSave(STORAGE_KEYS.ATTENDANCE, INITIAL_ATTENDANCE);
  safeSave(STORAGE_KEYS.USERS, INITIAL_USERS);
  safeSave(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
  safeSave(STORAGE_KEYS.SALARY_RECORDS, INITIAL_SALARY_RECORDS);
  safeSave(STORAGE_KEYS.PUBLIC_STAFF, INITIAL_PUBLIC_STAFF);
  safeSave(STORAGE_KEYS.PUBLIC_EVENTS, INITIAL_PUBLIC_EVENTS);
  safeSave(STORAGE_KEYS.ASSIGNMENTS, INITIAL_ASSIGNMENTS);
  safeSave(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, INITIAL_ASSIGNMENT_SUBMISSIONS);
  safeSave(STORAGE_KEYS.ONLINE_APPLICATIONS, INITIAL_ONLINE_APPLICATIONS);
  safeSave(STORAGE_KEYS.CURRENT_ROLE, 'super_admin');
  safeSave(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  safeSave(STORAGE_KEYS.IS_LOGGED_IN, true);
};

// Secret Complete Database Wipe for Super Admin
export const wipeAllDataCompletely = () => {
  localStorage.setItem('tist_explicitly_cleared', 'true');
  safeSave(STORAGE_KEYS.STUDENTS, []);
  safeSave(STORAGE_KEYS.TRANSACTIONS, []);
  safeSave(STORAGE_KEYS.ATTENDANCE, []);
  safeSave(STORAGE_KEYS.EXPENSES, []);
  safeSave(STORAGE_KEYS.SALARY_RECORDS, []);
  safeSave(STORAGE_KEYS.ONLINE_APPLICATIONS, []);
  safeSave(STORAGE_KEYS.ASSIGNMENTS, []);
  safeSave(STORAGE_KEYS.ASSIGNMENT_SUBMISSIONS, []);
};

