import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  setLogLevel,
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  onSnapshot, 
  deleteDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { 
  Course, 
  Student, 
  FeeTransaction, 
  AttendanceRecord, 
  StaffUser, 
  InstituteSettings, 
  PublicStaffMember, 
  PublicEvent, 
  Assignment, 
  AssignmentSubmission, 
  OnlineApplication,
  InstituteNotice
} from '../types';
import { INITIAL_COURSES, INITIAL_STUDENTS, INITIAL_TRANSACTIONS, INITIAL_ATTENDANCE, INITIAL_USERS, DEFAULT_SETTINGS, INITIAL_EXPENSES, INITIAL_SALARY_RECORDS } from '../data/initialData';

// Suppress benign connection retry logs in console
setLogLevel('error');

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with modern persistence settings (replaces deprecated enableMultiTabIndexedDbPersistence)
export const db = (() => {
  try {
    const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
    return initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
      })
    }, dbId);
  } catch (err) {
    // Fallback if already initialized or custom setup
    return firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

// COLLECTIONS
const COLLECTIONS = {
  COURSES: 'courses',
  STUDENTS: 'students',
  TRANSACTIONS: 'fee_transactions',
  ATTENDANCE: 'attendance_records',
  USERS: 'user_accounts',
  SETTINGS: 'settings',
  PUBLIC_STAFF: 'public_staff',
  PUBLIC_EVENTS: 'public_events',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
  ONLINE_APPLICATIONS: 'online_applications',
  NOTICES: 'notices',
};

// Seed initial data to Firestore if collection is empty
export async function seedInitialFirestoreDataIfEmpty() {
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
        await setDoc(doc(db, COLLECTIONS.COURSES, course.id), sanitizeForFirestore(course));
      }
    }

    // 3. Students
    const studentsSnap = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    if (studentsSnap.empty) {
      for (const student of INITIAL_STUDENTS) {
        await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), sanitizeForFirestore(student));
      }
    }

    // 4. Transactions
    const txSnap = await getDocs(collection(db, COLLECTIONS.TRANSACTIONS));
    if (txSnap.empty) {
      for (const tx of INITIAL_TRANSACTIONS) {
        await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, tx.id), sanitizeForFirestore(tx));
      }
    }

    // 5. Attendance
    const attSnap = await getDocs(collection(db, COLLECTIONS.ATTENDANCE));
    if (attSnap.empty) {
      for (const record of INITIAL_ATTENDANCE) {
        await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), sanitizeForFirestore(record));
      }
    }

    // 6. Users
    const usersSnap = await getDocs(collection(db, COLLECTIONS.USERS));
    if (usersSnap.empty) {
      for (const user of INITIAL_USERS) {
        await setDoc(doc(db, COLLECTIONS.USERS, user.id), sanitizeForFirestore(user));
      }
    }
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
      console.warn('[Firestore Offline] Skipping seeding while backend is unavailable.');
    } else {
      console.warn('[Firestore] Error seeding initial data:', err?.message || err);
    }
  }
}

// Force re-seed default demo dataset into LocalStorage & Firestore
export async function forceReSeedDefaultFirestoreData() {
  localStorage.removeItem('tist_explicitly_cleared');
  localStorage.removeItem('tist_db_cleared_v5');
  
  try {
    // 1. Settings
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'institute'), DEFAULT_SETTINGS);

    // 2. Courses
    for (const course of INITIAL_COURSES) {
      await setDoc(doc(db, COLLECTIONS.COURSES, course.id), sanitizeForFirestore(course));
    }

    // 3. Students
    for (const student of INITIAL_STUDENTS) {
      await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), sanitizeForFirestore(student));
    }

    // 4. Transactions
    for (const tx of INITIAL_TRANSACTIONS) {
      await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, tx.id), sanitizeForFirestore(tx));
    }

    // 5. Attendance
    for (const record of INITIAL_ATTENDANCE) {
      await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), sanitizeForFirestore(record));
    }

    // 6. Users
    for (const user of INITIAL_USERS) {
      await setDoc(doc(db, COLLECTIONS.USERS, user.id), sanitizeForFirestore(user));
    }

    // 7. Expenses
    for (const exp of INITIAL_EXPENSES) {
      await setDoc(doc(db, 'expenses', exp.id), sanitizeForFirestore(exp));
    }

    // 8. Salary Records
    for (const sal of INITIAL_SALARY_RECORDS) {
      await setDoc(doc(db, 'salary_records', sal.id), sanitizeForFirestore(sal));
    }

    console.log('[Firestore] Default sample data restored successfully.');
  } catch (err: any) {
    console.error('[Firestore] Error force re-seeding default data:', err);
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

// Helper to safely execute Firestore write operations without blocking if offline/unavailable
async function safeFirestoreOperation(operation: () => Promise<void>, opName: string) {
  try {
    await operation();
  } catch (err: any) {
    if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
      console.warn(`[Firestore Offline] ${opName} queued locally for sync when reconnected.`);
    } else {
      console.error(`[Firestore Error] ${opName} failed:`, err);
    }
  }
}

// WRITE & UPDATE WRAPPERS FOR FIRESTORE
export async function dbSaveSettings(settings: InstituteSettings) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(settings);
    await setDoc(doc(db, COLLECTIONS.SETTINGS, 'institute'), cleanData);
  }, 'saveSettings');
}

export async function dbSaveStudent(student: Student) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(student);
    await setDoc(doc(db, COLLECTIONS.STUDENTS, student.id), cleanData);
    console.log(`[Firestore] Saved student ${student.id} (${student.name})`);
  }, `saveStudent ${student.id}`);
}

export async function dbSaveStudents(students: Student[]) {
  for (const s of students) {
    await safeFirestoreOperation(async () => {
      const cleanData = sanitizeForFirestore(s);
      await setDoc(doc(db, COLLECTIONS.STUDENTS, s.id), cleanData);
    }, `saveStudent ${s.id}`);
  }
}

export async function dbDeleteStudent(studentId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, studentId));
    console.log(`[Firestore] Deleted student ${studentId}`);
  }, `deleteStudent ${studentId}`);
}

export async function dbClearAllStudents() {
  await safeFirestoreOperation(async () => {
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
  }, 'clearAllStudents');
}

export async function dbSaveTransaction(tx: FeeTransaction) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(tx);
    await setDoc(doc(db, COLLECTIONS.TRANSACTIONS, tx.id), cleanData);
    console.log(`[Firestore] Saved transaction ${tx.id}`);
  }, `saveTransaction ${tx.id}`);
}

export async function dbDeleteTransaction(txId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.TRANSACTIONS, txId));
    console.log(`[Firestore] Deleted transaction ${txId}`);
  }, `deleteTransaction ${txId}`);
}

export async function dbSaveCourse(course: Course) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(course);
    await setDoc(doc(db, COLLECTIONS.COURSES, course.id), cleanData);
  }, `saveCourse ${course.id}`);
}

export async function dbDeleteCourse(courseId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, courseId));
  }, `deleteCourse ${courseId}`);
}

export async function dbSaveAttendance(record: AttendanceRecord) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(record);
    await setDoc(doc(db, COLLECTIONS.ATTENDANCE, record.id), cleanData);
  }, `saveAttendance ${record.id}`);
}

export async function dbSaveUser(user: StaffUser) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(user);
    await setDoc(doc(db, COLLECTIONS.USERS, user.id), cleanData);
  }, `saveUser ${user.id}`);
}

export async function dbDeleteUser(userId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.USERS, userId));
  }, `deleteUser ${userId}`);
}

export function subscribePublicStaff(callback: (staff: PublicStaffMember[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.PUBLIC_STAFF),
    (querySnap) => {
      const list: PublicStaffMember[] = [];
      querySnap.forEach((d) => list.push(d.data() as PublicStaffMember));
      list.sort((a, b) => (a.order || 99) - (b.order || 99));
      callback(list);
    },
    (err) => console.warn('[Firestore] Public staff offline:', err.message)
  );
}

export function subscribePublicEvents(callback: (events: PublicEvent[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.PUBLIC_EVENTS),
    (querySnap) => {
      const list: PublicEvent[] = [];
      querySnap.forEach((d) => list.push(d.data() as PublicEvent));
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(list);
    },
    (err) => console.warn('[Firestore] Public events offline:', err.message)
  );
}

export function subscribeAssignments(callback: (asgs: Assignment[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.ASSIGNMENTS),
    (querySnap) => {
      const list: Assignment[] = [];
      querySnap.forEach((d) => list.push(d.data() as Assignment));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => console.warn('[Firestore] Assignments offline:', err.message)
  );
}

export function subscribeAssignmentSubmissions(callback: (subs: AssignmentSubmission[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.ASSIGNMENT_SUBMISSIONS),
    (querySnap) => {
      const list: AssignmentSubmission[] = [];
      querySnap.forEach((d) => list.push(d.data() as AssignmentSubmission));
      callback(list);
    },
    (err) => console.warn('[Firestore] Assignment submissions offline:', err.message)
  );
}

export function subscribeOnlineApplications(callback: (apps: OnlineApplication[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.ONLINE_APPLICATIONS),
    (querySnap) => {
      const list: OnlineApplication[] = [];
      querySnap.forEach((d) => list.push(d.data() as OnlineApplication));
      list.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      callback(list);
    },
    (err) => console.warn('[Firestore] Online applications offline:', err.message)
  );
}

export function subscribeNotices(callback: (notices: InstituteNotice[]) => void) {
  return onSnapshot(
    collection(db, COLLECTIONS.NOTICES),
    (querySnap) => {
      const list: InstituteNotice[] = [];
      querySnap.forEach((d) => list.push(d.data() as InstituteNotice));
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(list);
    },
    (err) => console.warn('[Firestore] Notices offline:', err.message)
  );
}

export async function dbSaveNotice(notice: InstituteNotice) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(notice);
    await setDoc(doc(db, COLLECTIONS.NOTICES, notice.id), cleanData);
  }, `saveNotice ${notice.id}`);
}

export async function dbDeleteNotice(noticeId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.NOTICES, noticeId));
  }, `deleteNotice ${noticeId}`);
}

export async function dbSavePublicStaff(staffMember: PublicStaffMember) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(staffMember);
    await setDoc(doc(db, COLLECTIONS.PUBLIC_STAFF, staffMember.id), cleanData);
  }, `savePublicStaff ${staffMember.id}`);
}

export async function dbDeletePublicStaff(staffId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.PUBLIC_STAFF, staffId));
  }, `deletePublicStaff ${staffId}`);
}

export async function dbSavePublicEvent(eventItem: PublicEvent) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(eventItem);
    await setDoc(doc(db, COLLECTIONS.PUBLIC_EVENTS, eventItem.id), cleanData);
  }, `savePublicEvent ${eventItem.id}`);
}

export async function dbDeletePublicEvent(eventId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.PUBLIC_EVENTS, eventId));
  }, `deletePublicEvent ${eventId}`);
}

export async function dbSaveAssignment(asg: Assignment) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(asg);
    await setDoc(doc(db, COLLECTIONS.ASSIGNMENTS, asg.id), cleanData);
  }, `saveAssignment ${asg.id}`);
}

export async function dbDeleteAssignment(asgId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.ASSIGNMENTS, asgId));
  }, `deleteAssignment ${asgId}`);
}

export async function dbSaveAssignmentSubmission(sub: AssignmentSubmission) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(sub);
    await setDoc(doc(db, COLLECTIONS.ASSIGNMENT_SUBMISSIONS, sub.id), cleanData);
  }, `saveAssignmentSubmission ${sub.id}`);
}

export async function dbSaveOnlineApplication(app: OnlineApplication) {
  await safeFirestoreOperation(async () => {
    const cleanData = sanitizeForFirestore(app);
    await setDoc(doc(db, COLLECTIONS.ONLINE_APPLICATIONS, app.id), cleanData);
  }, `saveOnlineApplication ${app.id}`);
}

export async function dbDeleteOnlineApplication(appId: string) {
  await safeFirestoreOperation(async () => {
    await deleteDoc(doc(db, COLLECTIONS.ONLINE_APPLICATIONS, appId));
  }, `deleteOnlineApplication ${appId}`);
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
      COLLECTIONS.ONLINE_APPLICATIONS,
      COLLECTIONS.ASSIGNMENTS,
      COLLECTIONS.ASSIGNMENT_SUBMISSIONS,
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
