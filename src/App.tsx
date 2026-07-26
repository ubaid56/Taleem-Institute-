import React, { useState, useEffect } from 'react';
import { UserRole, Course, Student, FeeTransaction, AttendanceRecord, StaffUser, StudentStatus, InstituteSettings, Expense, StaffSalaryRecord } from './types';
import { 
  getCourses, saveCourses,
  getStudents, saveStudents,
  getTransactions, saveTransactions,
  getAttendance, saveAttendance,
  getUsers, saveUsers,
  getExpenses, saveExpenses,
  getSalaryRecords, saveSalaryRecords,
  getCurrentRole, setCurrentRole,
  getSettings, saveSettings,
  getIsLoggedIn, setIsLoggedInState, updateLastActiveTime,
  resetToDefaultData
} from './lib/storage';
import {
  seedInitialFirestoreDataIfEmpty,
  subscribeSettings,
  subscribeCourses,
  subscribeStudents,
  subscribeTransactions,
  subscribeAttendance,
  subscribeUsers,
  dbSaveSettings,
  dbSaveStudent,
  dbSaveStudents,
  dbDeleteStudent,
  dbClearAllStudents,
  dbSaveTransaction,
  dbDeleteTransaction,
  dbSaveCourse,
  dbDeleteCourse,
  dbSaveAttendance,
  dbSaveUser,
  dbDeleteUser
} from './lib/firebase';

import { Header } from './components/Header';
import { Sidebar, TabType } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { StudentDirectory } from './components/StudentDirectory';
import { AddStudentForm } from './components/AddStudentForm';
import { SubmitFee } from './components/SubmitFee';
import { ThermalReceipt } from './components/ThermalReceipt';
import { CourseManager } from './components/CourseManager';
import { AttendanceSystem } from './components/AttendanceSystem';
import { FeeRecords } from './components/FeeRecords';
import { DefaulterListView } from './components/DefaulterListView';
import { StudentCardList } from './components/StudentCardList';
import { PassOutSuspendedView } from './components/PassOutSuspendedView';
import { UserAccessManager } from './components/UserAccessManager';
import { GeneralSettings } from './components/GeneralSettings';
import { ExpenseManager } from './components/ExpenseManager';
import { StaffPayrollManager } from './components/StaffPayrollManager';
import { ProfitLossReport } from './components/ProfitLossReport';
import { LoginForm } from './components/LoginForm';
import { BackupManager } from './components/BackupManager';

export default function App() {
  // Application Persistence State
  const [courses, setCoursesState] = useState<Course[]>(getCourses);
  const [students, setStudentsState] = useState<Student[]>(getStudents);
  const [transactions, setTransactionsState] = useState<FeeTransaction[]>(getTransactions);
  const [attendanceRecords, setAttendanceState] = useState<AttendanceRecord[]>(getAttendance);
  const [users, setUsersState] = useState<StaffUser[]>(getUsers);
  const [expenses, setExpensesState] = useState<Expense[]>(getExpenses);
  const [salaryRecords, setSalaryRecordsState] = useState<StaffSalaryRecord[]>(getSalaryRecords);
  const [currentRole, setRoleState] = useState<UserRole>(getCurrentRole);
  const [settings, setSettingsState] = useState<InstituteSettings>(getSettings);

  // Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(getIsLoggedIn);

  // Active View Tab
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Mobile Navigation Drawer State
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Thermal Receipt Modal
  const [activeReceiptTx, setActiveReceiptTx] = useState<FeeTransaction | null>(null);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Setup Firestore real-time cross-device synchronization
  useEffect(() => {
    // Perform one-time auto-purge of old demo records across storage and Firestore for fresh final data entry
    const isCleaned = localStorage.getItem('tist_db_cleared_v5');
    if (!isCleaned) {
      localStorage.setItem('tist_db_cleared_v5', 'true');
      setStudentsState([]);
      saveStudents([]);
      setTransactionsState([]);
      saveTransactions([]);
      setAttendanceState([]);
      saveAttendance([]);
      setExpensesState([]);
      saveExpenses([]);
      setSalaryRecordsState([]);
      saveSalaryRecords([]);
      dbClearAllStudents();
    }

    // Seed Firestore if empty
    seedInitialFirestoreDataIfEmpty();

    // Subscribe to Firestore collections for live real-time sync across devices
    const unsubSettings = subscribeSettings((data) => {
      setSettingsState(data);
      saveSettings(data);
    });

    const unsubCourses = subscribeCourses((data) => {
      if (data.length > 0) {
        setCoursesState(data);
        saveCourses(data);
      }
    });

    const unsubStudents = subscribeStudents((data) => {
      setStudentsState(data);
      saveStudents(data);
    });

    const unsubTx = subscribeTransactions((data) => {
      setTransactionsState(data);
      saveTransactions(data);
    });

    const unsubAtt = subscribeAttendance((data) => {
      setAttendanceState(data);
      saveAttendance(data);
    });

    const unsubUsers = subscribeUsers((data) => {
      if (data.length > 0) {
        setUsersState(data);
        saveUsers(data);
      }
    });

    return () => {
      unsubSettings();
      unsubCourses();
      unsubStudents();
      unsubTx();
      unsubAtt();
      unsubUsers();
    };
  }, []);

  // Activity / Sleep / Screen-lock session expiration handler
  useEffect(() => {
    if (!isLoggedIn) return;

    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes timeout

    const checkInactivity = () => {
      const lastActiveStr = sessionStorage.getItem('tist_last_active_v1');
      if (lastActiveStr) {
        const lastActive = Number(lastActiveStr);
        if (Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
          setIsLoggedInState(false);
          setIsLoggedIn(false);
          showToast('Session expired due to closing Chrome, sleep, or inactivity. Please log in.');
          return true;
        }
      } else {
        setIsLoggedInState(false);
        setIsLoggedIn(false);
        return true;
      }
      return false;
    };

    const handleUserActivity = () => {
      if (!checkInactivity()) {
        updateLastActiveTime();
      }
    };

    const handleVisibilityOrFocusChange = () => {
      checkInactivity();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('click', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('touchstart', handleUserActivity);
    window.addEventListener('focus', handleVisibilityOrFocusChange);
    document.addEventListener('visibilitychange', handleVisibilityOrFocusChange);

    updateLastActiveTime();

    const intervalId = setInterval(checkInactivity, 30000); // Check every 30s

    return () => {
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('touchstart', handleUserActivity);
      window.removeEventListener('focus', handleVisibilityOrFocusChange);
      document.removeEventListener('visibilitychange', handleVisibilityOrFocusChange);
      clearInterval(intervalId);
    };
  }, [isLoggedIn]);

  const handleUpdateSettings = (updated: InstituteSettings) => {
    setSettingsState(updated);
    saveSettings(updated);
    dbSaveSettings(updated);
    showToast('Institute settings and branding updated!');
  };

  // Expenses Handlers
  const handleAddExpense = (newExpData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newExpense, ...expenses];
    setExpensesState(updated);
    saveExpenses(updated);
    showToast(`Expense voucher #${newExpense.voucherNo} recorded successfully!`);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = expenses.filter(e => e.id !== id);
    setExpensesState(updated);
    saveExpenses(updated);
    showToast('Expense record deleted.');
  };

  // Salary & Payroll Handlers
  const handleAddSalaryRecord = (newRecData: Omit<StaffSalaryRecord, 'id' | 'createdAt'>) => {
    const newRecord: StaffSalaryRecord = {
      ...newRecData,
      id: `sal-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...salaryRecords];
    setSalaryRecordsState(updated);
    saveSalaryRecords(updated);
    showToast(`${newRecord.type === 'advance' ? 'Advance loan' : 'Salary payment'} recorded for ${newRecord.staffName}`);
  };

  const handleDeleteSalaryRecord = (id: string) => {
    const updated = salaryRecords.filter(r => r.id !== id);
    setSalaryRecordsState(updated);
    saveSalaryRecords(updated);
    showToast('Salary record deleted.');
  };

  const handleUpdateStaffBaseSalary = (staffId: string, newBaseSalary: number) => {
    const updatedUsers = users.map(u => u.id === staffId ? { ...u, baseSalary: newBaseSalary } : u);
    setUsersState(updatedUsers);
    saveUsers(updatedUsers);
    const targetUser = updatedUsers.find(u => u.id === staffId);
    if (targetUser) dbSaveUser(targetUser);
    showToast('Staff base salary updated.');
  };

  // State Updaters with storage sync
  const handleRoleChange = (newRole: UserRole) => {
    setRoleState(newRole);
    setCurrentRole(newRole);
    showToast(`Access role changed to ${newRole.toUpperCase().replace('_', ' ')}`);
  };

  const handleAddStudent = (newStudent: Student, initialTx?: FeeTransaction, shouldPrint: boolean = true) => {
    const updatedStudents = [newStudent, ...students];
    setStudentsState(updatedStudents);
    saveStudents(updatedStudents);
    dbSaveStudent(newStudent);

    let updatedTxs = transactions;
    if (initialTx) {
      updatedTxs = [initialTx, ...transactions];
      setTransactionsState(updatedTxs);
      saveTransactions(updatedTxs);
      dbSaveTransaction(initialTx);
      if (shouldPrint) {
        setActiveReceiptTx(initialTx); // Open receipt immediately if print requested
      }
    }

    showToast(`Student ${newStudent.name} (${newStudent.studentId}) registered successfully!`);
    setActiveTab('id_cards');
  };

  const handleSubmitFee = (newTx: FeeTransaction, updatedStudent: Student) => {
    const updatedTxs = [newTx, ...transactions];
    setTransactionsState(updatedTxs);
    saveTransactions(updatedTxs);
    dbSaveTransaction(newTx);

    const updatedStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudentsState(updatedStudents);
    saveStudents(updatedStudents);
    dbSaveStudent(updatedStudent);

    setActiveReceiptTx(newTx); // Auto-open thermal receipt preview!
    showToast(`Fee submission recorded! Receipt #: ${newTx.receiptNo}`);
  };

  const handleDeleteTransaction = (txId: string) => {
    const tx = transactions.find(t => t.id === txId);
    if (!tx) return;

    const updatedTxs = transactions.filter(t => t.id !== txId);
    setTransactionsState(updatedTxs);
    saveTransactions(updatedTxs);
    dbDeleteTransaction(txId);

    // Recalculate student balance if student exists
    const targetStudent = students.find(s => s.id === tx.studentId || s.studentId === tx.studentId);
    if (targetStudent) {
      const newPaid = Math.max(0, targetStudent.totalFeePaid - tx.amountPaid);
      const newBalance = targetStudent.totalFeeCalculated - newPaid;
      const updatedStudent = {
        ...targetStudent,
        totalFeePaid: newPaid,
        balanceRemaining: newBalance,
      };
      handleUpdateStudent(updatedStudent);
    }

    showToast(`Receipt #${tx.receiptNo} deleted!`);
  };

const DEFAULT_BASE_CATEGORIES = ['DIT', 'CIT', 'English Language', 'Web Development', 'Graphics Designing', 'YouTube Automation', 'Course Wise', 'Other'];

const getEffectiveBaseCategories = (settings: InstituteSettings): string[] => {
  if (settings.customBaseCategories && settings.customBaseCategories.length > 0) {
    return settings.customBaseCategories;
  }
  return DEFAULT_BASE_CATEGORIES;
};

  const handleAddBaseCategory = (catName: string) => {
    if (currentRole !== 'super_admin') {
      showToast('Access Denied: Only Super Admin can add base categories.');
      return;
    }
    const currentCats = getEffectiveBaseCategories(settings);
    const trimmed = catName.trim();
    if (!trimmed) return;
    if (currentCats.map(c => c.toLowerCase()).includes(trimmed.toLowerCase())) {
      showToast('Base category already exists!');
      return;
    }
    const updatedCats = [...currentCats, trimmed];
    const updatedSettings = {
      ...settings,
      customBaseCategories: updatedCats,
    };
    setSettingsState(updatedSettings);
    saveSettings(updatedSettings);
    dbSaveSettings(updatedSettings).catch(err => console.error(err));
    showToast(`Base category "${trimmed}" added successfully!`);
  };

  const handleUpdateBaseCategory = (oldName: string, newName: string) => {
    if (currentRole !== 'super_admin') {
      showToast('Access Denied: Only Super Admin can edit base categories.');
      return;
    }
    const currentCats = getEffectiveBaseCategories(settings);
    const trimmedNew = newName.trim();
    if (!trimmedNew || trimmedNew === oldName) return;

    const updatedCats = currentCats.map(c => c === oldName ? trimmedNew : c);
    const updatedSettings = {
      ...settings,
      customBaseCategories: updatedCats,
    };
    setSettingsState(updatedSettings);
    saveSettings(updatedSettings);
    dbSaveSettings(updatedSettings).catch(err => console.error(err));

    // Also update any courses using oldName
    const updatedCoursesList = courses.map(c => {
      if (c.baseCourseType === oldName) {
        const updatedCourse = { ...c, baseCourseType: trimmedNew };
        dbSaveCourse(updatedCourse);
        return updatedCourse;
      }
      return c;
    });
    setCoursesState(updatedCoursesList);
    saveCourses(updatedCoursesList);

    showToast(`Base category updated from "${oldName}" to "${trimmedNew}"`);
  };

  const handleDeleteBaseCategory = (catName: string) => {
    if (currentRole !== 'super_admin') {
      showToast('Access Denied: Only Super Admin can delete base categories.');
      return;
    }
    const currentCats = getEffectiveBaseCategories(settings);
    let updatedCats = currentCats.filter(c => c !== catName);
    if (updatedCats.length === 0) {
      updatedCats = ['Other'];
    }
    const fallbackCategory = updatedCats.find(c => c === 'Other') || updatedCats[0];

    const updatedSettings = {
      ...settings,
      customBaseCategories: updatedCats,
    };
    setSettingsState(updatedSettings);
    saveSettings(updatedSettings);
    dbSaveSettings(updatedSettings).catch(err => console.error(err));

    // Reassign affected courses to fallback category
    const updatedCoursesList = courses.map(c => {
      if (c.baseCourseType === catName) {
        const updatedCourse = { ...c, baseCourseType: fallbackCategory };
        dbSaveCourse(updatedCourse);
        return updatedCourse;
      }
      return c;
    });
    setCoursesState(updatedCoursesList);
    saveCourses(updatedCoursesList);

    showToast(`Base category "${catName}" deleted. Affected courses moved to "${fallbackCategory}".`);
  };

  const handleAddCourse = (newCourse: Course) => {
    const updated = [newCourse, ...courses];
    setCoursesState(updated);
    saveCourses(updated);
    dbSaveCourse(newCourse);
    showToast(`New Course "${newCourse.name}" added successfully!`);
  };

  const handleUpdateCourse = (updatedCourse: Course) => {
    const updated = courses.map(c => c.id === updatedCourse.id ? updatedCourse : c);
    setCoursesState(updated);
    saveCourses(updated);
    dbSaveCourse(updatedCourse);
    showToast(`Course "${updatedCourse.name}" updated!`);
  };

  const handleDeleteCourse = (courseId: string) => {
    const updated = courses.filter(c => c.id !== courseId);
    setCoursesState(updated);
    saveCourses(updated);
    dbDeleteCourse(courseId);
    showToast('Course removed.');
  };

  const handleSaveAttendance = (newRecord: AttendanceRecord) => {
    const updated = [newRecord, ...attendanceRecords.filter(r => !(r.courseId === newRecord.courseId && r.date === newRecord.date))];
    setAttendanceState(updated);
    saveAttendance(updated);
    dbSaveAttendance(newRecord);
    showToast(`Attendance record saved for ${newRecord.courseName}!`);
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    const updatedStudents = students.map(s => s.id === updatedStudent.id ? updatedStudent : s);
    setStudentsState(updatedStudents);
    saveStudents(updatedStudents);
    dbSaveStudent(updatedStudent);
    showToast(`Student ${updatedStudent.name} (${updatedStudent.studentId}) updated!`);
  };

  const handleDeleteStudent = (studentId: string) => {
    const targetStudent = students.find(s => s.id === studentId || s.studentId === studentId);
    const primaryId = targetStudent?.id || studentId;
    const secondaryId = targetStudent?.studentId;

    const updatedStudents = students.filter(s => s.id !== primaryId && s.studentId !== primaryId && (secondaryId ? (s.id !== secondaryId && s.studentId !== secondaryId) : true));
    setStudentsState(updatedStudents);
    saveStudents(updatedStudents);

    if (primaryId) dbDeleteStudent(primaryId);
    if (secondaryId && secondaryId !== primaryId) dbDeleteStudent(secondaryId);

    showToast(`Student ${targetStudent?.name || studentId} permanently deleted!`);
  };

  const handleClearAllStudents = () => {
    if (currentRole !== 'super_admin') {
      showToast('Access Denied: Only Super Admin can clear all records.');
      return;
    }
    localStorage.setItem('tist_explicitly_cleared', 'true');
    setStudentsState([]);
    saveStudents([]);
    setTransactionsState([]);
    saveTransactions([]);
    setAttendanceState([]);
    saveAttendance([]);
    dbClearAllStudents();
    showToast('Database cleared! All old student records and associated data have been removed.');
  };

  const handleUpdateStudentStatus = (studentIds: string[], newStatus: StudentStatus, remarks?: string) => {
    const today = new Date().toISOString().slice(0, 10);
    const updatedStudents = students.map(s => {
      if (studentIds.includes(s.id) || studentIds.includes(s.studentId)) {
        return {
          ...s,
          status: newStatus,
          statusChangeDate: today,
          statusChangeRemarks: remarks || `Moved to ${newStatus}`,
        };
      }
      return s;
    });

    setStudentsState(updatedStudents);
    saveStudents(updatedStudents);
    
    const changedStudents = updatedStudents.filter(s => studentIds.includes(s.id) || studentIds.includes(s.studentId));
    dbSaveStudents(changedStudents);

    showToast(`Updated ${studentIds.length} student(s) status to ${newStatus.toUpperCase()}`);
  };

  const handleAddUser = (user: StaffUser) => {
    const updated = [...users, user];
    setUsersState(updated);
    saveUsers(updated);
    dbSaveUser(user);
    showToast(`Staff account for ${user.name} created!`);
  };

  const handleUpdateUser = (updatedUser: StaffUser) => {
    const updated = users.map(u => u.id === updatedUser.id ? updatedUser : u);
    setUsersState(updated);
    saveUsers(updated);
    dbSaveUser(updatedUser);
    showToast(`Account updated for ${updatedUser.name}`);
  };

  const handleDeleteUser = (userId: string) => {
    const updated = users.filter(u => u.id !== userId);
    setUsersState(updated);
    saveUsers(updated);
    dbDeleteUser(userId);
    showToast('Staff account removed.');
  };

  const handleResetDemoData = () => {
    resetToDefaultData();
    setCoursesState(getCourses());
    setStudentsState(getStudents());
    setTransactionsState(getTransactions());
    setAttendanceState(getAttendance());
    setUsersState(getUsers());
    setRoleState(getCurrentRole());
    setSettingsState(getSettings());
    showToast('Demo data reset successfully.');
  };

  const passOutCount = students.filter(s => s.status === 'pass_out').length;
  const suspendedCount = students.filter(s => s.status === 'suspended').length;
  const activeStudentsCount = students.filter(s => s.status === 'active').length;

  const currentUser = users.find(u => u.role === currentRole) || users[0];
  const activePermissions = currentRole === 'super_admin' ? {
    canAddStudent: true,
    canEditStudent: true,
    canDeleteStudent: true,
    canSubmitFee: true,
    canManageCourses: true,
    canViewFinancials: true,
    canTakeAttendance: true,
    canManageStatus: true,
    canManageUsers: true,
  } : (currentUser?.permissions || {
    canAddStudent: false,
    canEditStudent: false,
    canDeleteStudent: false,
    canSubmitFee: false,
    canManageCourses: false,
    canViewFinancials: false,
    canTakeAttendance: false,
    canManageStatus: false,
    canManageUsers: false,
  });

  if (!isLoggedIn) {
    return (
      <LoginForm
        users={users}
        settings={settings}
        onLoginSuccess={(user) => {
          setRoleState(user.role);
          setCurrentRole(user.role);
          setIsLoggedInState(true);
          setIsLoggedIn(true);
          showToast(`Welcome back, ${user.name}! Access role: ${user.role.toUpperCase().replace('_', ' ')}`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-slate-100 text-slate-900 font-sans selection:bg-indigo-600 selection:text-white flex flex-col">
      
      {/* Top Navigation Header */}
      <Header
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        users={users}
        settings={settings}
        onResetData={handleResetDemoData}
        onLogout={() => {
          setIsLoggedInState(false);
          setIsLoggedIn(false);
          showToast('Logged out successfully.');
        }}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isMobileMenuOpen={isMobileMenuOpen}
      />

      {/* Main Body Layout */}
      <div className="flex-1 flex overflow-hidden relative max-w-full">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentRole={currentRole}
          userPermissions={activePermissions}
          activeStudentsCount={activeStudentsCount}
          passOutCount={passOutCount}
          suspendedCount={suspendedCount}
          isMobileMenuOpen={isMobileMenuOpen}
          onCloseMobileMenu={() => setIsMobileMenuOpen(false)}
        />

        {/* Content Canvas */}
        <main className="flex-1 min-w-0 p-3 sm:p-6 md:p-8 overflow-y-auto bg-slate-50/80">
          
          {/* Toast Notification */}
          {toastMessage && (
            <div className="fixed bottom-12 right-8 z-50 bg-slate-900 text-white rounded-2xl border border-slate-700 px-5 py-3 shadow-2xl text-xs font-bold flex items-center space-x-3">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{toastMessage}</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              students={students}
              courses={courses}
              transactions={transactions}
              currentRole={currentRole}
              userPermissions={activePermissions}
              onNavigate={setActiveTab}
              onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
            />
          )}

          {activeTab === 'students_list' && (
            <StudentDirectory
              students={students}
              courses={courses}
              currentRole={currentRole}
              userPermissions={activePermissions}
              onUpdateStudent={handleUpdateStudent}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onDeleteStudent={handleDeleteStudent}
              onClearAllStudents={handleClearAllStudents}
              onNavigateToAddStudent={() => setActiveTab('add_student')}
            />
          )}

          {activeTab === 'add_student' && (
            <AddStudentForm
              courses={courses}
              existingStudents={students}
              existingTxs={transactions}
              onAddStudent={handleAddStudent}
              onAddCourse={handleAddCourse}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'submit_fee' && (
            <SubmitFee
              students={students}
              courses={courses}
              existingTxs={transactions}
              currentRole={currentRole}
              onSubmitFee={handleSubmitFee}
              onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
            />
          )}

          {activeTab === 'courses' && (
            <CourseManager
              courses={courses}
              students={students}
              currentRole={currentRole}
              customBaseCategories={getEffectiveBaseCategories(settings)}
              onAddCourse={handleAddCourse}
              onUpdateCourse={handleUpdateCourse}
              onDeleteCourse={handleDeleteCourse}
              onAddBaseCategory={handleAddBaseCategory}
              onUpdateBaseCategory={handleUpdateBaseCategory}
              onDeleteBaseCategory={handleDeleteBaseCategory}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceSystem
              courses={courses}
              students={students}
              attendanceRecords={attendanceRecords}
              onSaveAttendance={handleSaveAttendance}
            />
          )}

          {activeTab === 'fee_records' && (
            <FeeRecords
              transactions={transactions}
              students={students}
              courses={courses}
              onOpenReceipt={(tx) => setActiveReceiptTx(tx)}
              onClearAllRecords={currentRole === 'super_admin' ? handleClearAllStudents : undefined}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'defaulter_list' && (
            <DefaulterListView
              students={students}
              courses={courses}
              transactions={transactions}
              currentRole={currentRole}
              onUpdateStudent={handleUpdateStudent}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpenseManager
              expenses={expenses}
              currentRole={currentRole}
              userPermissions={activePermissions}
              currentUserName={users.find(u => u.role === currentRole)?.name || 'Accountant'}
              settings={settings}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
            />
          )}

          {activeTab === 'staff_payroll' && (
            <StaffPayrollManager
              staffList={users}
              salaryRecords={salaryRecords}
              currentRole={currentRole}
              userPermissions={activePermissions}
              currentUserName={users.find(u => u.role === currentRole)?.name || 'Admin'}
              settings={settings}
              onAddSalaryRecord={handleAddSalaryRecord}
              onDeleteSalaryRecord={handleDeleteSalaryRecord}
              onUpdateStaffBaseSalary={handleUpdateStaffBaseSalary}
            />
          )}

          {activeTab === 'financial_statement' && (
            <ProfitLossReport
              transactions={transactions}
              salaryRecords={salaryRecords}
              expenses={expenses}
              currentRole={currentRole}
              settings={settings}
            />
          )}

          {activeTab === 'id_cards' && (
            <StudentCardList
              students={students}
              courses={courses}
            />
          )}

          {(activeTab === 'pass_out' || activeTab === 'suspended') && (
            <PassOutSuspendedView
              students={students}
              courses={courses}
              activeModule={activeTab}
              currentRole={currentRole}
              userPermissions={activePermissions}
              settings={settings}
              onUpdateStudentStatus={handleUpdateStudentStatus}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
              onClearAllStudents={currentRole === 'super_admin' ? handleClearAllStudents : undefined}
            />
          )}

          {activeTab === 'access_control' && (
            <UserAccessManager
              users={users}
              courses={courses}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {activeTab === 'general_settings' && (
            <GeneralSettings
              settings={settings}
              onSaveSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'backup' && (
            <BackupManager
              showToast={showToast}
              onRefreshData={() => {
                setCoursesState(getCourses());
                setStudentsState(getStudents());
                setTransactionsState(getTransactions());
                setAttendanceState(getAttendance());
                setUsersState(getUsers());
                setExpensesState(getExpenses());
                setSalaryRecordsState(getSalaryRecords());
                setSettingsState(getSettings());
              }}
            />
          )}

        </main>
      </div>

      {/* Footer Status Bar */}
      <footer className="h-10 border-t border-slate-200 bg-white flex items-center px-8 justify-between text-[11px] font-semibold text-slate-500 shrink-0 print:hidden shadow-inner">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>System: <strong className="text-slate-800">Operational</strong></span>
        </div>
        <div className="hidden sm:block text-slate-600">
          Campus: <strong className="text-slate-800">{settings.instituteName}</strong> • {settings.address} • Ph: {settings.phone}
        </div>
        <div className="text-slate-400">v4.5-POS</div>
      </footer>

      {/* Thermal POS Receipt Modal */}
      {activeReceiptTx && (
        <ThermalReceipt
          transaction={activeReceiptTx}
          student={students.find(s => s.studentId === activeReceiptTx.studentId)}
          settings={settings}
          onClose={() => setActiveReceiptTx(null)}
        />
      )}

    </div>
  );
}

