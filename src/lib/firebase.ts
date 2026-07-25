import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Course, Student, FeeTransaction, AttendanceRecord, StaffUser, InstituteSettings } from '../types';
import { INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_ATTENDANCE, INITIAL_USERS, DEFAULT_SETTINGS } from '../data/initialData';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore targeting the specific database ID if specified
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// COLLECTIONS
const COLLECTIONS = {
  COURSES: 'courses',
  STUDENTS: 'students',
  TRANSACTIONS: 'fee_transactions',
  ATTENDANCE: 'attendance_records',
  USERS: 'user_accounts',
  SETTINGS: 'settings'
};

// Seed initial data to Firestore if collection is empty
export async function seedInitialFirestoreDataIfEmpty() {
  if (localStorage.getItem('tist_explicitly_cleared') === 'true') {
    return;
  }
  try {
    // 1. Settings
    const settingsSnap = await getDocs(collection(db, COLLECTIONS.SETTINGS));
    if (settingsSnap.empty) {
      await setDoc(doc(db, COLLECTIONS.SETTINGS, 'institute'), DEFAULT_SETTINGS);
    }

    // 2. Courses
    const coursesSnap = await getDocs(collection(db, COLLECTIONS.COURSES));
    if (coursesSnap.empty) {
      for (const course of INITIAL_COURSES) {
        await setDoc(doc(db, COLLECTIONS.COURSES, course.id), course);
      }
    }

    // 3. Students
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty) {
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), student);
      }
    }

    // 4. Transactions
    const txSnap = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
    if (txSnap.empty) {
      for (const tx of INITIAL_TRANSACTIONS) {
        await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, tx.id), tx);
      }
    }

    // 5. Attendance
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (attSnap.empty) {
      for (const record of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), record);
      }
    }

    // 6. Users
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty) {
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), user);
      }
    }
  } catch (err) {
    console.error('Error seeding initial Firestore data:', err);
  }
}

// REALTIME LISTENERS
export function subscribeSettings(callback: (settings: InstituteSettings) => void) {
  return onSnapshot(
    doc(db, COLLECTIONS.SETTINGS, 'institute'),
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as InstituteSettings);
      }
    },
    (err) => {
      console.warn('[Firestore] Settings offline/unavailable:', err.message);
    }
  );
}

export function subscribeCourses(callback: (courses: Course[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.COURSES),
    (querySnap) => {
      const list: Course[] = [];
      querySnap.forEach((d) => list.push(d.data() as Course));
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Courses offline/unavailable:', err.message);
    }
  );
}

export function subscribeStudents(callback: (students: Student[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.STUDENTS),
    (querySnap) => {
      const list: Student[] = [];
      querySnap.forEach((d) => list.push(d.data() as Student));
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Students offline/unavailable:', err.message);
    }
  );
}

export function subscribeTransactions(callback: (txs: FeeTransaction[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.TRANSACTIONS),
    (querySnap) => {
      const list: FeeTransaction[] = [];
      querySnap.forEach((d) => list.push(d.data() as FeeTransaction));
      // Sort by date descending
      list.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Transactions offline/unavailable:', err.message);
    }
  );
}

export function subscribeAttendance(callback: (records: AttendanceRecord[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.ATTENDANCE),
    (querySnap) => {
      const list: AttendanceRecord[] = [];
      querySnap.forEach((d) => list.push(d.data() as AttendanceRecord));
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Attendance offline/unavailable:', err.message);
    }
  );
}

export function subscribeUsers(callback: (users: StaffUser[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.USERS),
    (querySnap) => {
      const list: StaffUser[] = [];
      querySnap.forEach((d) => list.push(d.data() as StaffUser));
      callback(list);
    },
    (err) => {
      console.warn('[Firestore] Users offline/unavailable:', err.message);
    }
  );
}

// Helper to sanitize objects before sending to Firestore (removes undefined properties)
function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (typeof data !== 'object') {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  const cleanObj: Record<string, any> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      cleanObj[key] = sanitizeForFirestore(value);
    }
  }
  return cleanObj as T;
}

// WRITE & UPDATE WRAPPERS FOR FIRESTORE
export async function dbSaveSettings(settings: InstituteSettings) {
  try {
    const cleanData = sanitizeForFirestore(settings);
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'institute'), cleanData);
  } catch (err) {
    console.error('[Firestore Error] Failed to save settings:', err);
  }
}

export async function dbSaveStudent(student: Student) {
  try {
    const cleanData = sanitizeForFirestore(student);
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), cleanData);
    console.log(`[Firestore] Saved student ${student.id} (${student.name})`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save student:', err);
  }
}

export async function dbSaveStudents(students: Student[]) {
  for (const s of students) {
    try {
      const cleanData = sanitizeForFirestore(s);
      await setDoc(doc(db, COLLECTIONS.STUDENTS, s.id), cleanData);
    } catch (err) {
      console.error(`[Firestore Error] Failed to save student ${s.id}:`, err);
    }
  }
}

export async function dbDeleteStudent(studentId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    console.log(`[Firestore] Deleted student ${studentId}`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete student:', err);
  }
}

export async function dbClearAllStudents() {
  try {
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    for (const docSnap of studentsSnap.docs) {
      await deleteDoc(doc(db, COLLECTIONS.STUDENTS, docSnap.id));
    }
    const txSnap = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
    for (const docSnap of txSnap.docs) {
      await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, docSnap.id));
    }
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    for (const docSnap of attSnap.docs) {
      await deleteDoc(doc(db, COLLECTIONS.ATTENDANCE, docSnap.id));
    }
    console.log('[Firestore] Cleared all old students, transactions, and attendance records');
  } catch (err) {
    console.error('[Firestore Error] Failed to clear all students from Firestore:', err);
  }
}

export async function dbSaveTransaction(tx: FeeTransaction) {
  try {
    const cleanData = sanitizeForFirestore(tx);
    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, tx.id), cleanData);
    console.log(`[Firestore] Saved transaction ${tx.id}`);
  } catch (err) {
    console.error('[Firestore Error] Failed to save transaction:', err);
  }
}

export async function dbDeleteTransaction(txId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, txId));
    console.log(`[Firestore] Deleted transaction ${txId}`);
  } catch (err) {
    console.error('[Firestore Error] Failed to delete transaction:', err);
  }
}

export async function dbSaveCourse(course: Course) {
  try {
    const cleanData = sanitizeForFirestore(course);
    await setDoc(doc(db, COLLECTIONS.COURSES, course.id), cleanData);
  } catch (err) {
    console.error('[Firestore Error] Failed to save course:', err);
  }
}

export async function dbDeleteCourse(courseId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
  } catch (err) {
    console.error('[Firestore Error] Failed to delete course:', err);
  }
}

export async function dbSaveAttendance(record: AttendanceRecord) {
  try {
    const cleanData = sanitizeForFirestore(record);
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), cleanData);
  } catch (err) {
    console.error('[Firestore Error] Failed to save attendance:', err);
  }
}

export async function dbSaveUser(user: StaffUser) {
  try {
    const cleanData = sanitizeForFirestore(user);
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), cleanData);
  } catch (err) {
    console.error('[Firestore Error] Failed to save user:', err);
  }
}

export async function dbDeleteUser(userId: string) {
  try {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  } catch (err) {
    console.error('[Firestore Error] Failed to delete user:', err);
  }
}

export async function wipeAllFirestoreRecordsCompletely() {
  localStorage.setItem('tist_explicitly_cleared', 'true');
  try {
    const collectionsToClear = [
      COLLECTIONS.STUDENTS,
      COLLECTIONS.TRANSACTIONS,
      COLLECTIONS.ATTENDANCE,
      'expenses',
      'salary_records',
    ];
    for (const colName of collectionsToClear) {
      const querySnap = await getDocs(collection(db, colName));
      for (const docSnap of querySnap.docs) {
        await deleteDoc(doc(db, colName, docSnap.id));
      }
    }
    console.log('[Firestore] Complete database wipe finished');
  } catch (err) {
    console.error('[Firestore Error] Failed to wipe database:', err);
  }
}
