import React, { useState, useMemo } from 'react';
import { Student, Course, UserRole, StudentStatus } from '../types';
import { EditStudentModal } from './EditStudentModal';
import { StudentCardModal } from './StudentCardModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatPKR } from '../lib/utils';
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
  DollarSign
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
  onUpdateStudent,
  onUpdateStudentStatus,
  onDeleteStudent,
  onClearAllStudents,
  onNavigateToAddStudent,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Multi-selection state
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [batchActionConfirm, setBatchActionConfirm] = useState<{ action: 'pass_out' | 'suspended' | 'active' | 'delete'; count: number } | null>(null);

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);

  const isSuperAdmin = currentRole === 'super_admin';
  const hasEditPermission = isSuperAdmin || !!userPermissions?.canEditStudent;
  const hasDeletePermission = isSuperAdmin || !!userPermissions?.canDeleteStudent;

  // Filtered students list
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // Course filter
      const matchesCourse = selectedCourseFilter === 'ALL' || s.courses.some(c => c.courseId === selectedCourseFilter);

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
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold">
            St
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Students List & Course Directory</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Filter by course, search records & manage student details</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {(isSuperAdmin || userPermissions?.canAddStudent) && onNavigateToAddStudent && (
            <button
              onClick={onNavigateToAddStudent}
              className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
            >
              <Plus className="w-4 h-4" />
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

          <div className="bg-white px-4 py-2 border border-[#1A1A1A] text-center font-mono shrink-0">
            <span className="text-[10px] font-bold text-[#1A1A1A] uppercase tracking-wider block">Total Students Enrolled</span>
            <span className="text-xl font-black text-[#1A1A1A]">{filteredStudents.length} Students</span>
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
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectStudent(s.id)}
                      className="w-4 h-4 cursor-pointer accent-blue-600 shrink-0"
                    />
                    <img
                      src={s.photoUrl}
                      alt={s.name}
                      className="w-12 h-12 object-cover border border-[#1A1A1A] shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-sm uppercase text-[#1A1A1A]">{s.name}</h4>
                      <p className="text-xs text-[#1A1A1A]/70 font-medium">S/O: {s.fatherName}</p>
                      <span className="font-mono text-[11px] font-bold text-[#1A1A1A] bg-[#F4F2EE] px-1.5 py-0.5 border border-[#1A1A1A] inline-block mt-1">
                        {s.studentId}
                      </span>
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
                  <div className="flex flex-wrap gap-1 max-w-[60%]">
                    {s.courses.map((c, idx) => (
                      <span key={idx} className="bg-[#F4F2EE] border border-[#1A1A1A] px-1.5 py-0.5 text-[9px] font-bold text-[#1A1A1A] truncate">
                        {c.courseName}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                    {hasEditPermission && (
                      <button
                        onClick={() => setEditingStudent(s)}
                        className="px-3 py-1.5 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A]"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
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
                        
                        {/* Edit Button */}
                        {hasEditPermission && (
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="px-2.5 py-1 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A] transition"
                            title="Edit Student Details"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
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

    </div>
  );
};
