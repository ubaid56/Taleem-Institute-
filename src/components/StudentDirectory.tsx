import React, { useState, useMemo } from 'react';
import { Student, Course, UserRole, StudentStatus, InstituteSettings } from '../types';
import { EditStudentModal } from './EditStudentModal';
import { StudentCardModal } from './StudentCardModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatPKR, exportCourseStudentsPDF, exportCourseStudentsExcel } from '../lib/utils';
import { 
  Users, 
  Search, 
  Filter, 
  Edit3, 
  Trash2, 
  QrCode, 
  CheckCircle, 
  UserX, 
  GraduationCap, 
  Plus, 
  Phone, 
  BookOpen,
  DollarSign,
  FileSpreadsheet,
  FileText,
  Download,
  User,
  X,
  Key,
  MessageCircle,
  Copy,
  ShieldCheck,
  Check
} from 'lucide-react';

interface StudentDirectoryProps {
  students: Student[];
  courses: Course[];
  currentRole: UserRole;
  userPermissions?: {
    canEditStudent?: boolean;
    canDeleteStudent?: boolean;
    canAddStudent?: boolean;
  };
  settings?: InstituteSettings;
  showToast?: (msg: string) => void;
  onUpdateStudent: (student: Student) => void;
  onUpdateStudentStatus?: (studentIds: string[], newStatus: StudentStatus, remarks?: string) => void;
  onDeleteStudent: (studentId: string) => void;
  onClearAllStudents?: () => void;
  onNavigateToAddStudent?: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({
  students,
  courses,
  currentRole,
  userPermissions,
  settings,
  showToast,
  onUpdateStudent,
  onUpdateStudentStatus,
  onDeleteStudent,
  onClearAllStudents,
  onNavigateToAddStudent,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Super Admin Account Credential Recovery Modal State
  const [showCredentialRecoveryModal, setShowCredentialRecoveryModal] = useState<boolean>(false);
  const [recoverySearchQuery, setRecoverySearchQuery] = useState<string>('');
  const [copiedStudentId, setCopiedStudentId] = useState<string | null>(null);

  // Multi-selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [batchActionConfirm, setBatchActionConfirm] = useState<{ action: 'pass_out' | 'suspended' | 'active' | 'delete'; count: number } | null>(null);

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [viewingProfileStudent, setViewingProfileStudent] = useState<Student | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const isSuperAdmin = currentRole === 'super_admin';
  const hasEditPermission = isSuperAdmin || !!userPermissions?.canEditStudent;
  const hasDeletePermission = isSuperAdmin || !!userPermissions?.canDeleteStudent;

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Course filter
      const matchesCourse = selectedCourseFilter === 'ALL' 
        ? true 
        : selectedCourseFilter === 'CATEGORY_OTHER'
          ? s.courses.some(sc => {
              const c = courses.find(cr => cr.id === sc.courseId);
              return c?.baseCourseType === 'Other' || (sc.courseName ? sc.courseName.toLowerCase().includes('other') : false);
            })
          : s.courses.some(c => c.courseId === selectedCourseFilter);

      // Status filter
      const matchesStatus = selectedStatusFilter === 'ALL' || s.status === selectedStatusFilter;

      // Search query
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobileNo.includes(searchQuery) ||
        (s.cnic && s.cnic.includes(searchQuery));

      return matchesCourse && matchesStatus && matchesSearch;
    });
  }, [students, selectedCourseFilter, selectedStatusFilter, searchQuery]);

  const isAllSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every(s => selectedStudentIds.includes(s.id));
  }, [filteredStudents, selectedStudentIds]);

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const executeBatchAction = () => {
    if (!batchActionConfirm || selectedStudentIds.length === 0) return;

    if (batchActionConfirm.action === 'delete') {
      selectedStudentIds.forEach(id => onDeleteStudent(id));
    } else if (onUpdateStudentStatus) {
      onUpdateStudentStatus(
        selectedStudentIds, 
        batchActionConfirm.action, 
        `Batch status update to ${batchActionConfirm.action}`
      );
    } else {
      selectedStudentIds.forEach(id => {
        const target = students.find(st => st.id === id);
        if (target) {
          onUpdateStudent({
            ...target,
            status: batchActionConfirm.action as StudentStatus,
            statusChangeDate: new Date().toISOString().slice(0, 10),
            statusChangeRemarks: `Batch status update to ${batchActionConfirm.action}`,
          });
        }
      });
    }

    setSelectedStudentIds([]);
    setBatchActionConfirm(null);
  };

  // Selected course details
  const activeCourseObj = useMemo(() => {
    if (selectedCourseFilter === 'ALL') return null;
    return courses.find(c => c.id === selectedCourseFilter);
  }, [courses, selectedCourseFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Top Banner */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl sm:text-2xl font-bold">
            St
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">Students List & Course Directory</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Filter by course, search records & manage student details</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full lg:w-auto">
          <button
            type="button"
            onClick={() => {
              if (filteredStudents.length === 0) {
                alert("No students available in current view to export.");
                return;
              }
              const reportTitle = activeCourseObj ? activeCourseObj.name : "All_Courses_Students";
              exportCourseStudentsExcel(reportTitle, filteredStudents);
            }}
            className="flex-1 sm:flex-none justify-center min-h-[42px] px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white font-bold text-xs uppercase tracking-wider border border-emerald-950 flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            title="Download Excel Sheet / CSV of currently listed students"
          >
            <FileSpreadsheet className="w-4 h-4 shrink-0" />
            <span>Excel Sheet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (filteredStudents.length === 0) {
                alert("No students available in current view to export.");
                return;
              }
              const reportTitle = activeCourseObj ? activeCourseObj.name : "All_Courses_Students";
              exportCourseStudentsPDF(reportTitle, filteredStudents);
            }}
            className="flex-1 sm:flex-none justify-center min-h-[42px] px-3.5 py-2 bg-slate-800 hover:bg-slate-900 active:bg-slate-950 text-white font-bold text-xs uppercase tracking-wider border border-slate-950 flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
            title="Download PDF report of currently listed students"
          >
            <FileText className="w-4 h-4 shrink-0" />
            <span>PDF Report</span>
          </button>

          {(isSuperAdmin || userPermissions?.canEditStudent) && (
            <button
              type="button"
              onClick={() => {
                setShowCredentialRecoveryModal(true);
                setRecoverySearchQuery('');
              }}
              className="flex-1 sm:flex-none justify-center min-h-[42px] px-3.5 py-2 bg-amber-700 hover:bg-amber-800 active:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider border border-amber-950 flex items-center space-x-1.5 transition shadow-sm cursor-pointer"
              title="Super Admin tool to lookup student login username and password"
            >
              <Key className="w-4 h-4 shrink-0 text-amber-200" />
              <span>🔑 Recover Credentials</span>
            </button>
          )}

          {(isSuperAdmin || userPermissions?.canAddStudent) && onNavigateToAddStudent && (
            <button
              type="button"
              onClick={onNavigateToAddStudent}
              className="w-full sm:w-auto justify-center min-h-[42px] px-4 py-2 bg-[#1A1A1A] hover:bg-[#333] active:bg-black text-white font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] flex items-center space-x-2 transition shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>New Admission / Add Student</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-3 items-center">
        
        {/* Course Dropdown */}
        <div className="md:col-span-4">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Select Course / Batch:</span>
          </label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full bg-[#FDFCFB] border-2 border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none focus:bg-white"
          >
            <option value="ALL">🎓 All Enrolled Courses ({courses.length})</option>
            <option value="CATEGORY_OTHER">🏷️ Other Category Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.baseCourseType})</option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="md:col-span-3">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Status:</span>
          </label>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none focus:bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">🟢 Active Only</option>
            <option value="pass_out">🎓 Pass Out Only</option>
            <option value="suspended">🔴 Suspended Only</option>
          </select>
        </div>

        {/* Search Bar */}
        <div className="md:col-span-5">
          <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1 flex items-center gap-1">
            <Search className="w-3.5 h-3.5" />
            <span>Search Student:</span>
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-[#1A1A1A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Name, Roll ID (TIST-...), Phone, CNIC..."
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none focus:bg-white"
            />
          </div>
        </div>

      </div>

      {/* Course Info Summary Header if selected */}
      {activeCourseObj && (
        <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <span className="bg-[#1A1A1A] text-white font-mono text-[10px] font-bold px-2 py-0.5 border border-[#1A1A1A]">
              Course Code: {activeCourseObj.code}
            </span>
            <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A] mt-1">{activeCourseObj.name}</h3>
            <p className="text-xs text-[#1A1A1A]/70 font-medium">
              Duration: {activeCourseObj.durationMonths} Months • Monthly Fee: {formatPKR(activeCourseObj.monthlyFee)} • Admission Fee: {formatPKR(activeCourseObj.admissionFee)}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0 w-full sm:w-auto">
            <div className="bg-white px-4 py-2 border border-[#1A1A1A] text-center font-mono shrink-0 w-full sm:w-auto">
              <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">Total Students Enrolled</span>
              <span className="text-xl font-black text-[#1A1A1A]">{filteredStudents.length} Students</span>
            </div>

            <button
              type="button"
              onClick={() => exportCourseStudentsExcel(activeCourseObj.name, filteredStudents)}
              className="flex-1 sm:flex-none justify-center min-h-[42px] px-3.5 py-2 bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider hover:bg-emerald-900 border border-emerald-950 flex items-center space-x-1.5 transition cursor-pointer"
              title="Download Excel Sheet for this Course"
            >
              <FileSpreadsheet className="w-4 h-4 shrink-0" />
              <span>Excel Sheet</span>
            </button>

            <button
              type="button"
              onClick={() => exportCourseStudentsPDF(activeCourseObj.name, filteredStudents)}
              className="flex-1 sm:flex-none justify-center min-h-[42px] px-3.5 py-2 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider hover:bg-[#333] border border-[#1A1A1A] flex items-center space-x-1.5 transition cursor-pointer"
              title="Download PDF Report for this Course"
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>PDF Report</span>
            </button>
          </div>
        </div>
      )}

      {/* Batch Action Bar if items selected */}
      {selectedStudentIds.length > 0 && (
        <div className="bg-[#1A1A1A] text-white p-3.5 border-2 border-[#1A1A1A] flex flex-wrap items-center justify-between gap-3 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold bg-white text-[#1A1A1A] px-2.5 py-1">
              {selectedStudentIds.length} Student(s) Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isSuperAdmin && (
              <>
                <button
                  type="button"
                  onClick={() => setBatchActionConfirm({ action: 'pass_out', count: selectedStudentIds.length })}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 border border-blue-400"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>Pass Out Selected ({selectedStudentIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchActionConfirm({ action: 'suspended', count: selectedStudentIds.length })}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 border border-rose-400"
                >
                  <UserX className="w-4 h-4" />
                  <span>Suspend Selected ({selectedStudentIds.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBatchActionConfirm({ action: 'active', count: selectedStudentIds.length })}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 border border-emerald-400"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>Reactivate Selected ({selectedStudentIds.length})</span>
                </button>
              </>
            )}

            {!isSuperAdmin && (
              <span className="text-xs font-bold text-amber-300 italic px-2">
                🔒 Pass Out & Suspend actions are restricted to Super Admin
              </span>
            )}

            {hasDeletePermission && (
              <button
                type="button"
                onClick={() => setBatchActionConfirm({ action: 'delete', count: selectedStudentIds.length })}
                className="px-3.5 py-1.5 bg-rose-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 border border-rose-500"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Selected</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setSelectedStudentIds([])}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs uppercase"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Student List Count Bar */}
      <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider border-b-2 border-[#1A1A1A] pb-2">
        <span>Showing {filteredStudents.length} Student Records</span>
        {isSuperAdmin ? (
          <span className="text-emerald-800 text-[11px] font-mono">⚡ Super Admin Role: Full Edit, Update & Delete Controls Unlocked</span>
        ) : (hasEditPermission || hasDeletePermission) ? (
          <span className="text-emerald-800 text-[11px] font-mono">
            ⚡ Custom Permissions Granted by Super Admin: {hasEditPermission ? 'Edit / Update' : ''} {hasEditPermission && hasDeletePermission ? '& ' : ''} {hasDeletePermission ? 'Delete' : ''} Unlocked
          </span>
        ) : (
          <span className="text-slate-500 text-[11px] font-mono">🔒 View-Only Directory: Student Edit & Delete access restricted by Super Admin</span>
        )}
      </div>

      {/* Student Cards View (Visible on mobile screens) */}
      <div className="block lg:hidden space-y-3">
        {filteredStudents.length === 0 ? (
          <div className="py-12 bg-white border-2 border-[#1A1A1A] text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-xs space-y-2 p-4">
            <Users className="w-8 h-8 mx-auto text-[#1A1A1A]/40" />
            <p>No students found matching selected course / filter criteria.</p>
          </div>
        ) : (
          filteredStudents.map((s) => {
            const hasDues = s.balanceRemaining > 0;
            const isSelected = selectedStudentIds.includes(s.id);

            return (
              <div key={s.id} className={`bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm transition ${isSelected ? 'bg-blue-50/90 border-blue-600' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectStudent(s.id)}
                      className="w-4 h-4 cursor-pointer accent-blue-600 shrink-0"
                    />
                    <div 
                      onClick={() => setViewingProfileStudent(s)}
                      className="flex items-center space-x-3 cursor-pointer group min-w-0 flex-1"
                      title="Click to open Student Sidebar Profile"
                    >
                      <img
                        src={s.photoUrl}
                        alt={s.name}
                        className="w-12 h-12 object-cover border border-[#1A1A1A] shrink-0 group-hover:scale-105 transition"
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm uppercase text-[#1A1A1A] group-hover:text-emerald-700 transition truncate">{s.name}</h4>
                        <p className="text-xs text-[#1A1A1A]/70 font-medium truncate">S/O: {s.fatherName}</p>
                        <span className="font-mono text-[11px] font-bold text-[#1A1A1A] bg-[#F4F2EE] px-1.5 py-0.5 border border-[#1A1A1A] inline-block mt-1">
                          {s.studentId}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border shrink-0 ${
                    s.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400' 
                      : s.status === 'pass_out'
                      ? 'bg-blue-100 text-blue-900 border-blue-400'
                      : 'bg-rose-100 text-rose-900 border-rose-400'
                  }`}>
                    {s.status === 'active' ? '🟢 Active' : s.status === 'pass_out' ? '🎓 Pass' : '🔴 Suspended'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F2EE] p-2.5 border border-[#1A1A1A]">
                  <div>
                    <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Contact / CNIC</p>
                    <p className="font-mono font-bold text-[#1A1A1A] text-xs">{s.mobileNo}</p>
                    {s.cnic && <p className="font-mono text-[10px] text-[#1A1A1A]/60">{s.cnic}</p>}
                  </div>
                  <div>
                    <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Fee Ledger</p>
                    <p className="text-emerald-800 font-bold font-mono text-xs">Paid: {formatPKR(s.totalFeePaid)}</p>
                    <p className={`font-mono font-bold text-xs ${hasDues ? 'text-rose-800' : 'text-emerald-800'}`}>
                      {hasDues ? `Dues: ${formatPKR(s.balanceRemaining)}` : 'CLEAR (0 Dues)'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <div className="flex flex-wrap gap-1 max-w-[50%]">
                    {s.courses.map((c, idx) => (
                      <span key={idx} className="bg-[#F4F2EE] border border-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-bold text-[#1A1A1A] truncate">
                        {c.courseName}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    <button
                      onClick={() => setViewingProfileStudent(s)}
                      className="px-2.5 py-1.5 bg-[#1A1A1A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A] shadow-xs"
                      title="View Student Sidebar Profile"
                    >
                      <User className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Profile</span>
                    </button>
                    {hasEditPermission && (
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="p-1.5 bg-[#F4F2EE] text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => setCardStudent(s)}
                      className="p-1.5 text-[#1A1A1A] bg-[#F4F2EE] border border-[#1A1A1A]"
                      title="View ID Card"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
                    {hasDeletePermission && (
                      <button
                        onClick={() => setStudentToDelete(s)}
                        className="p-1.5 text-rose-800 bg-rose-50 border border-rose-800"
                        title="Delete Student"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop Student Table */}
      <div className="hidden lg:block bg-white border-2 border-[#1A1A1A] shadow-sm overflow-x-auto">
        {filteredStudents.length === 0 ? (
          <div className="py-20 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-xs space-y-2">
            <Users className="w-10 h-10 mx-auto text-[#1A1A1A]/40" />
            <p>No students found matching selected course / filter criteria.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#1A1A1A] text-white font-mono text-[11px] uppercase tracking-wider">
                <th className="p-3 border-r border-slate-700 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 cursor-pointer accent-blue-600"
                    title="Select / Deselect All Students"
                  />
                </th>
                <th className="p-3 border-r border-slate-700">Roll ID & Photo</th>
                <th className="p-3 border-r border-slate-700">Student Name / Father</th>
                <th className="p-3 border-r border-slate-700">Contact / CNIC</th>
                <th className="p-3 border-r border-slate-700">Enrolled Course(s)</th>
                <th className="p-3 border-r border-slate-700">Fee Ledger</th>
                <th className="p-3 border-r border-slate-700">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y border-b border-[#1A1A1A]">
              {filteredStudents.map((s) => {
                const hasDues = s.balanceRemaining > 0;
                const isSelected = selectedStudentIds.includes(s.id);

                return (
                  <tr key={s.id} className={`transition ${isSelected ? 'bg-blue-50/80' : 'hover:bg-[#FDFCFB]'}`}>
                    
                    {/* Checkbox */}
                    <td className="p-3 border-r border-slate-200 text-center align-top">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectStudent(s.id)}
                        className="w-4 h-4 cursor-pointer accent-blue-600 mt-1"
                      />
                    </td>
                    
                    {/* Roll ID & Photo */}
                    <td className="p-3 border-r border-slate-200 align-top">
                      <div className="flex items-center space-x-3">
                        <img
                          src={s.photoUrl}
                          alt={s.name}
                          className="w-11 h-11 object-cover border border-[#1A1A1A] shrink-0"
                        />
                        <div>
                          <span className="font-mono text-xs font-bold text-[#1A1A1A] bg-[#F4F2EE] px-1.5 py-0.5 border border-[#1A1A1A]">
                            {s.studentId}
                          </span>
                          <p className="text-[10px] text-[#1A1A1A]/60 font-mono mt-1">Adm: {s.admissionDate}</p>
                        </div>
                      </div>
                    </td>

                    {/* Name & Father Name */}
                    <td className="p-3 border-r border-slate-200 align-top">
                      <h4 className="font-bold text-xs uppercase text-[#1A1A1A]">{s.name}</h4>
                      <p className="text-[11px] text-[#1A1A1A]/70 font-medium">S/O: {s.fatherName}</p>
                      <span className="text-[10px] text-[#1A1A1A]/60 italic">{s.gender || 'Male'}</span>
                    </td>

                    {/* Contact & CNIC */}
                    <td className="p-3 border-r border-slate-200 align-top font-mono text-[11px]">
                      <p className="font-bold text-[#1A1A1A]">{s.mobileNo}</p>
                      {s.fatherMobileNo && <p className="text-[10px] text-[#1A1A1A]/70">F: {s.fatherMobileNo}</p>}
                      {s.cnic && <p className="text-[10px] text-[#1A1A1A]/60">CNIC: {s.cnic}</p>}
                    </td>

                    {/* Enrolled Courses */}
                    <td className="p-3 border-r border-slate-200 align-top">
                      <div className="space-y-1">
                        {s.courses.map((c, idx) => (
                          <div key={idx} className="bg-[#F4F2EE] border border-[#1A1A1A] px-2 py-0.5 text-[10px] font-bold text-[#1A1A1A]">
                            {c.courseName}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Fee Ledger */}
                    <td className="p-3 border-r border-slate-200 align-top font-mono text-[11px]">
                      <p className="text-[#1A1A1A]/70">Total: {formatPKR(s.totalFeeCalculated)}</p>
                      <p className="text-emerald-800 font-bold">Paid: {formatPKR(s.totalFeePaid)}</p>
                      <p className={`font-bold text-xs mt-0.5 ${hasDues ? 'text-rose-800 font-black' : 'text-emerald-800'}`}>
                        {hasDues ? `Dues: ${formatPKR(s.balanceRemaining)}` : 'CLEAR (0 Dues)'}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="p-3 border-r border-slate-200 align-top">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        s.status === 'active' 
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-400' 
                          : s.status === 'pass_out'
                          ? 'bg-blue-100 text-blue-900 border-blue-400'
                          : 'bg-rose-100 text-rose-900 border-rose-400'
                      }`}>
                        {s.status === 'active' ? '🟢 Active' : s.status === 'pass_out' ? '🎓 Pass Out' : '🔴 Suspended'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-3 align-top text-right space-y-1">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Profile Sidebar Button */}
                        <button
                          onClick={() => setViewingProfileStudent(s)}
                          className="px-2 py-1 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A] transition shadow-xs"
                          title="View Student Sidebar Profile"
                        >
                          <User className="w-3 h-3 text-emerald-400" />
                          <span>Profile</span>
                        </button>

                        {/* Edit Button */}
                        {hasEditPermission && (
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="p-1 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition"
                            title="Edit Student Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* View ID Card */}
                        <button
                          onClick={() => setCardStudent(s)}
                          className="p-1 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition"
                          title="View ID Card"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Button */}
                        {hasDeletePermission && (
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-1 text-rose-800 hover:bg-rose-50 border border-rose-800 transition rounded"
                            title="Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-800" />
                          </button>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Student Modal */}
      {editingStudent && (
        <EditStudentModal
          student={editingStudent}
          courses={courses}
          currentRole={currentRole}
          onSaveStudent={onUpdateStudent}
          onDeleteStudent={onDeleteStudent}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* ID Card Modal */}
      {cardStudent && (
        <StudentCardModal
          student={cardStudent}
          onClose={() => setCardStudent(null)}
        />
      )}

      {/* Delete Single Student Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Delete Student Record"
        message="Are you sure you want to permanently delete this student from the institute directory?"
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.studentId})` : undefined}
        confirmText="Delete Student"
        onConfirm={() => {
          if (studentToDelete) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />

      {/* Batch Action Confirmation Modal */}
      {batchActionConfirm && (
        <ConfirmDeleteModal
          isOpen={true}
          title={
            batchActionConfirm.action === 'pass_out'
              ? `Pass Out ${batchActionConfirm.count} Student(s)?`
              : batchActionConfirm.action === 'suspended'
              ? `Suspend ${batchActionConfirm.count} Student(s)?`
              : batchActionConfirm.action === 'active'
              ? `Reactivate ${batchActionConfirm.count} Student(s)?`
              : `Delete ${batchActionConfirm.count} Student(s)?`
          }
          message={
            batchActionConfirm.action === 'delete'
              ? `Are you sure you want to permanently delete all ${batchActionConfirm.count} selected student records? This cannot be undone.`
              : `Are you sure you want to change the status of ${batchActionConfirm.count} selected student(s) to ${batchActionConfirm.action.toUpperCase()}?`
          }
          confirmText={`Confirm ${batchActionConfirm.action.toUpperCase()}`}
          onConfirm={executeBatchAction}
          onClose={() => setBatchActionConfirm(null)}
        />
      )}

      {/* Student Profile Sidebar Drawer (Mobile & Tablet optimized, no horizontal scroll) */}
      {viewingProfileStudent && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex justify-end">
          <div className="absolute inset-0" onClick={() => setViewingProfileStudent(null)}></div>

          <div className="relative w-full sm:w-[420px] md:w-[460px] bg-white h-full shadow-2xl border-l-2 border-[#1A1A1A] flex flex-col z-10 animate-in slide-in-from-right duration-200">
            
            {/* Drawer Header */}
            <div className="p-4 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-slate-800 shrink-0">
              <div className="flex items-center space-x-2">
                <User className="w-5 h-5 text-emerald-400" />
                <h3 className="font-serif italic font-bold text-lg">Student Profile Details</h3>
              </div>
              <button
                onClick={() => setViewingProfileStudent(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Content Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Header Card */}
              <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left relative">
                <img
                  src={viewingProfileStudent.photoUrl}
                  alt={viewingProfileStudent.name}
                  className="w-20 h-20 object-cover border-2 border-[#1A1A1A] shrink-0 shadow-sm"
                />
                <div className="space-y-1 min-w-0">
                  <span className="inline-block px-2 py-0.5 bg-[#1A1A1A] text-white font-mono text-xs font-bold border border-[#1A1A1A]">
                    Roll #{viewingProfileStudent.studentId}
                  </span>
                  <h2 className="font-bold text-lg uppercase text-[#1A1A1A] truncate">{viewingProfileStudent.name}</h2>
                  <p className="text-xs text-[#1A1A1A]/80 font-medium">S/O: {viewingProfileStudent.fatherName}</p>
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                    viewingProfileStudent.status === 'active' 
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-400' 
                      : viewingProfileStudent.status === 'pass_out'
                      ? 'bg-blue-100 text-blue-900 border-blue-400'
                      : 'bg-rose-100 text-rose-900 border-rose-400'
                  }`}>
                    {viewingProfileStudent.status === 'active' ? '🟢 Active Student' : viewingProfileStudent.status === 'pass_out' ? '🎓 Pass Out' : '🔴 Suspended'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-2">
                {hasEditPermission && (
                  <button
                    onClick={() => {
                      setEditingStudent(viewingProfileStudent);
                      setViewingProfileStudent(null);
                    }}
                    className="px-3 py-2 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 border border-[#1A1A1A] hover:bg-slate-800 transition"
                  >
                    <Edit3 className="w-4 h-4 text-emerald-400" />
                    <span>Edit Record</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setCardStudent(viewingProfileStudent);
                    setViewingProfileStudent(null);
                  }}
                  className="px-3 py-2 bg-[#F4F2EE] hover:bg-slate-200 text-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center justify-center space-x-1.5 border border-[#1A1A1A] transition"
                >
                  <QrCode className="w-4 h-4 text-[#1A1A1A]" />
                  <span>ID Card</span>
                </button>
              </div>

              {/* Section 1: Personal & Contact Details */}
              <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] pb-2 border-b border-[#1A1A1A] flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Personal & Contact Info</span>
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Gender</p>
                    <p className="font-bold text-slate-900">{viewingProfileStudent.gender || 'Male'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Date of Birth</p>
                    <p className="font-mono font-bold text-slate-900">{viewingProfileStudent.dob || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Student CNIC / B-Form</p>
                    <p className="font-mono font-bold text-slate-900">{viewingProfileStudent.cnic || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Admission Date</p>
                    <p className="font-mono font-bold text-slate-900">{viewingProfileStudent.admissionDate}</p>
                  </div>
                  <div className="col-span-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A]">
                    <p className="text-[10px] uppercase font-bold text-slate-600">Mobile Contact Number</p>
                    <p className="font-mono font-bold text-slate-900 text-sm flex items-center justify-between">
                      <span>{viewingProfileStudent.mobileNo}</span>
                      <a
                        href={`https://wa.me/92${viewingProfileStudent.mobileNo.replace(/[^0-9]/g, '').slice(-10)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-md transition"
                      >
                        WhatsApp
                      </a>
                    </p>
                  </div>
                  {viewingProfileStudent.fatherMobileNo && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Father / Guardian Contact</p>
                      <p className="font-mono font-bold text-slate-900">{viewingProfileStudent.fatherMobileNo}</p>
                    </div>
                  )}
                  {viewingProfileStudent.address && (
                    <div className="col-span-2">
                      <p className="text-[10px] uppercase font-bold text-slate-500">Residential Address</p>
                      <p className="font-medium text-slate-900 text-xs">{viewingProfileStudent.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 2: Enrolled Courses */}
              <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] pb-2 border-b border-[#1A1A1A] flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>Enrolled Courses</span>
                </h4>
                <div className="space-y-2">
                  {viewingProfileStudent.courses.map((c, idx) => (
                    <div key={idx} className="bg-[#F4F2EE] p-3 border border-[#1A1A1A] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase text-[#1A1A1A]">{c.courseName}</span>
                        <span className="text-[10px] bg-white px-2 py-0.5 border border-[#1A1A1A] font-mono font-bold">
                          {c.durationMonths} Months
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 font-mono">
                        <span>Monthly: {formatPKR(c.monthlyFee)}</span>
                        <span>Adm Fee: {formatPKR(c.admissionFee)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Financial Fee Ledger */}
              <div className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] pb-2 border-b border-[#1A1A1A] flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>Fee Ledger & Balance Dues</span>
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-slate-50 p-2.5 border border-slate-200">
                    <p className="text-[9px] uppercase font-bold text-slate-500">Total Calculated Fee</p>
                    <p className="font-bold text-slate-900 text-sm">{formatPKR(viewingProfileStudent.totalFeeCalculated)}</p>
                  </div>
                  <div className="bg-emerald-50 p-2.5 border border-emerald-300">
                    <p className="text-[9px] uppercase font-bold text-emerald-800">Total Fee Paid</p>
                    <p className="font-bold text-emerald-900 text-sm">{formatPKR(viewingProfileStudent.totalFeePaid)}</p>
                  </div>
                  <div className={`col-span-2 p-3 border-2 ${viewingProfileStudent.balanceRemaining > 0 ? 'bg-rose-50 border-rose-600 text-rose-950' : 'bg-emerald-50 border-emerald-600 text-emerald-950'}`}>
                    <p className="text-[10px] uppercase font-bold tracking-wider">Net Balance Dues</p>
                    <p className="font-black text-base">
                      {viewingProfileStudent.balanceRemaining > 0 ? formatPKR(viewingProfileStudent.balanceRemaining) : 'CLEAR (0 Dues)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: LMS Portal Credentials (Super Admin View) */}
              <div className="bg-amber-50 border-2 border-amber-800 p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-950 pb-2 border-b border-amber-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Key className="w-4 h-4 text-amber-700" />
                    <span>LMS Portal Credentials (Admin View)</span>
                  </span>
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-bold px-1.5 py-0.5 rounded">CONFIDENTIAL</span>
                </h4>
                <div className="bg-slate-900 text-white p-3 rounded-lg font-mono text-xs space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Assigned Roll No:</span>
                    <span className="font-bold text-amber-300">{viewingProfileStudent.rollNumber || viewingProfileStudent.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Portal Username:</span>
                    <span className="font-bold text-emerald-400">{viewingProfileStudent.username || viewingProfileStudent.portalUsername || viewingProfileStudent.studentId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Portal Password:</span>
                    <span className="font-bold text-emerald-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                      {viewingProfileStudent.password || viewingProfileStudent.portalPassword || '123456'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const u = viewingProfileStudent.username || viewingProfileStudent.portalUsername || viewingProfileStudent.studentId;
                      const p = viewingProfileStudent.password || viewingProfileStudent.portalPassword || '123456';
                      navigator.clipboard.writeText(`Roll No: ${viewingProfileStudent.rollNumber || viewingProfileStudent.studentId} | Username: ${u} | Password: ${p}`);
                      if (showToast) showToast('Credentials copied to clipboard!');
                      else alert('Credentials copied!');
                    }}
                    className="flex-1 py-1.5 px-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-[11px] rounded transition flex items-center justify-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Login Details</span>
                  </button>
                  {viewingProfileStudent.mobileNo && (
                    <a
                      href={`https://wa.me/92${viewingProfileStudent.mobileNo.replace(/[^0-9]/g, '').slice(-10)}?text=${encodeURIComponent(
                        `Assalam o Alaikum ${viewingProfileStudent.name}!\nHere are your Student Portal login details:\nRoll No: ${viewingProfileStudent.rollNumber || viewingProfileStudent.studentId}\nUsername: ${viewingProfileStudent.username || viewingProfileStudent.portalUsername || viewingProfileStudent.studentId}\nPassword: ${viewingProfileStudent.password || viewingProfileStudent.portalPassword || '123456'}`
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded transition flex items-center justify-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Share via WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="p-3 bg-[#F4F2EE] border-t-2 border-[#1A1A1A] shrink-0 flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-600">TIST Mobile Profile Drawer</span>
              <button
                onClick={() => setViewingProfileStudent(null)}
                className="px-4 py-2 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] hover:bg-slate-800 transition"
              >
                Close Drawer
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Super Admin Credential Recovery Modal */}
      {showCredentialRecoveryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-2xl shadow-2xl border-2 border-[#1A1A1A] max-w-2xl w-full p-6 space-y-4 my-auto relative text-[#1A1A1A]">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-amber-100 rounded-xl text-amber-900 border border-amber-300 shrink-0">
                  <Key className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200 rounded">
                    Super Admin Recovery Panel
                  </span>
                  <h3 className="font-serif italic text-xl font-bold text-[#1A1A1A]">
                    Student Account Credential Recovery
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCredentialRecoveryModal(false)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter a student's <strong>Roll Number</strong>, <strong>Student ID</strong>, <strong>Name</strong>, <strong>Phone Number</strong>, or <strong>CNIC</strong> below to retrieve their Student Portal Username and Password.
            </p>

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                autoFocus
                placeholder="Search student by Name, Roll No (e.g. 101), Student ID (TIST-...), Phone, CNIC..."
                value={recoverySearchQuery}
                onChange={(e) => setRecoverySearchQuery(e.target.value)}
                className="w-full bg-[#FDFCFB] border-2 border-[#1A1A1A] pl-10 pr-3 py-2.5 text-xs font-bold text-[#1A1A1A] focus:outline-none focus:bg-white rounded-lg shadow-xs"
              />
            </div>

            {/* Results List */}
            <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
              {recoverySearchQuery.trim() === '' ? (
                <div className="p-8 text-center text-slate-500 text-xs bg-slate-50 border border-dashed border-slate-300 rounded-xl space-y-1">
                  <p className="font-bold text-slate-700">🔍 Type a search query above</p>
                  <p className="text-[11px]">e.g. Enter "101" or student name or father's mobile number to reveal login details.</p>
                </div>
              ) : (
                (() => {
                  const query = recoverySearchQuery.trim().toLowerCase();
                  const queryDigits = query.replace(/[^0-9]/g, '');
                  const matches = students.filter(s => {
                    const roll = (s.rollNumber || '').toLowerCase();
                    const stId = (s.studentId || '').toLowerCase();
                    const phone = (s.mobileNo || '').replace(/[^0-9]/g, '');
                    const fCnic = (s.fatherCnic || '').replace(/[^0-9]/g, '');
                    const cnic = (s.cnic || '').replace(/[^0-9]/g, '');
                    const name = s.name.toLowerCase();
                    return (
                      roll === query ||
                      stId.includes(query) ||
                      name.includes(query) ||
                      (phone && queryDigits && phone.includes(queryDigits)) ||
                      (fCnic && queryDigits && fCnic.includes(queryDigits)) ||
                      (cnic && queryDigits && cnic.includes(queryDigits))
                    );
                  });

                  if (matches.length === 0) {
                    return (
                      <div className="p-6 text-center text-rose-700 text-xs bg-rose-50 border border-rose-200 rounded-xl font-medium">
                        ⚠️ No student records matched "{recoverySearchQuery}".
                      </div>
                    );
                  }

                  return matches.map(s => {
                    const rollNum = s.rollNumber || s.studentId;
                    const uname = s.username || s.portalUsername || s.studentId;
                    const pass = s.password || s.portalPassword || '123456';
                    const cleanPhone = s.mobileNo ? '92' + s.mobileNo.replace(/[^0-9]/g, '').slice(-10) : '';

                    const isCopied = copiedStudentId === s.id;

                    const shareMsg = `Assalam o Alaikum ${s.name}!\nHere are your Taleem Institute Student LMS Portal login details:\n\n• Roll Number: ${rollNum}\n• Username: ${uname}\n• Password: ${pass}\n\nPlease keep your login details safe.`;

                    return (
                      <div key={s.id} className="p-4 bg-[#FDFCFB] border-2 border-[#1A1A1A] rounded-xl space-y-3">
                        <div className="flex items-start justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center space-x-3">
                            <img src={s.photoUrl} alt={s.name} className="w-11 h-11 object-cover border border-[#1A1A1A] rounded-md shrink-0 shadow-xs" />
                            <div>
                              <h4 className="font-bold text-sm text-[#1A1A1A]">{s.name}</h4>
                              <p className="text-xs text-slate-600 font-medium">S/O: {s.fatherName} • Mobile: {s.mobileNo}</p>
                              <p className="text-[10px] text-slate-500">{s.courses?.[0]?.courseName || 'Enrolled Student'}</p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase border ${
                            s.status === 'active' ? 'bg-emerald-100 text-emerald-900 border-emerald-400' :
                            s.status === 'pass_out' ? 'bg-blue-100 text-blue-900 border-blue-400' :
                            'bg-rose-100 text-rose-900 border-rose-400'
                          }`}>
                            {s.status}
                          </span>
                        </div>

                        {/* Credential Box */}
                        <div className="p-3.5 bg-slate-900 text-white rounded-xl font-mono text-xs space-y-1.5 shadow-inner">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Assigned Roll No:</span>
                            <span className="font-bold text-amber-300">{rollNum}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Portal Username:</span>
                            <span className="font-bold text-emerald-400">{uname}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-slate-400">Portal Password:</span>
                            <span className="font-bold text-emerald-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">{pass}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(`Roll No: ${rollNum} | Username: ${uname} | Password: ${pass}`);
                              setCopiedStudentId(s.id);
                              if (showToast) showToast(`Credentials copied for ${s.name}!`);
                              setTimeout(() => setCopiedStudentId(null), 2500);
                            }}
                            className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                          >
                            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Details'}</span>
                          </button>

                          {cleanPhone && (
                            <a
                              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(shareMsg)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition flex items-center justify-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>Send on WhatsApp</span>
                            </a>
                          )}
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setShowCredentialRecoveryModal(false)}
                className="px-4 py-2 bg-[#1A1A1A] text-white font-bold text-xs rounded-lg uppercase tracking-wider hover:bg-slate-800 transition"
              >
                Close Tool
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
