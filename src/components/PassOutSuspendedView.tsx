import React, { useState, useMemo } from 'react';
import { Student, StudentStatus, Course, UserRole, InstituteSettings } from '../types';
import { GraduationCap, UserX, CheckSquare, Square, RefreshCw, Edit3, Trash2, QrCode, Barcode } from 'lucide-react';
import { EditStudentModal } from './EditStudentModal';
import { StudentCardModal } from './StudentCardModal';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface PassOutSuspendedViewProps {
  students: Student[];
  courses: Course[];
  activeModule: 'pass_out' | 'suspended';
  currentRole?: UserRole;
  userPermissions?: {
    canEditStudent?: boolean;
    canDeleteStudent?: boolean;
  };
  settings?: InstituteSettings;
  onUpdateStudentStatus: (studentIds: string[], newStatus: StudentStatus, remarks?: string) => void;
  onUpdateStudent?: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
  onClearAllStudents?: () => void;
}

export const PassOutSuspendedView: React.FC<PassOutSuspendedViewProps> = ({
  students,
  courses,
  activeModule,
  currentRole,
  userPermissions,
  settings,
  onUpdateStudentStatus,
  onUpdateStudent,
  onDeleteStudent,
  onClearAllStudents,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [statusChangeRemarks, setStatusChangeRemarks] = useState<string>('');
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);

  // Modals state
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [studentToReactivate, setStudentToReactivate] = useState<Student | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState<boolean>(false);

  // Module students multi-select state
  const [moduleSelectedIds, setModuleSelectedIds] = useState<string[]>([]);
  const [batchReactivateConfirm, setBatchReactivateConfirm] = useState<boolean>(false);

  const isSuperAdmin = currentRole === 'super_admin';
  const hasEditPermission = isSuperAdmin || !!userPermissions?.canEditStudent;
  const hasDeletePermission = isSuperAdmin || !!userPermissions?.canDeleteStudent;

  // Active students for moving to pass out / suspended
  const activeStudents = useMemo(() => {
    return students.filter(s => {
      if (s.status !== 'active') return false;

      const matchesCourse = selectedCourseFilter === 'ALL' || s.courses.some(c => c.courseId === selectedCourseFilter);
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCourse && matchesSearch;
    });
  }, [students, selectedCourseFilter, searchQuery]);

  // Students in current view module (Pass Out or Suspended)
  const moduleStudents = useMemo(() => {
    return students.filter(s => s.status === activeModule);
  }, [students, activeModule]);

  const toggleSelectStudent = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedStudentIds.length === activeStudents.length) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(activeStudents.map(s => s.id));
    }
  };

  const isAllModuleSelected = useMemo(() => {
    if (moduleStudents.length === 0) return false;
    return moduleStudents.every(s => moduleSelectedIds.includes(s.id));
  }, [moduleStudents, moduleSelectedIds]);

  const toggleSelectAllModule = () => {
    if (isAllModuleSelected) {
      setModuleSelectedIds([]);
    } else {
      setModuleSelectedIds(moduleStudents.map(s => s.id));
    }
  };

  const toggleSelectModuleStudent = (id: string) => {
    setModuleSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchReactivate = () => {
    if (moduleSelectedIds.length === 0) return;
    onUpdateStudentStatus(moduleSelectedIds, 'active', 'Bulk reactivated to active status');
    setModuleSelectedIds([]);
    setBatchReactivateConfirm(false);
  };

  const handleConfirmMove = () => {
    if (selectedStudentIds.length === 0) return;

    onUpdateStudentStatus(selectedStudentIds, activeModule, statusChangeRemarks);
    setSelectedStudentIds([]);
    setStatusChangeRemarks('');
    setShowMoveModal(false);
  };

  const isPassOutMode = activeModule === 'pass_out';

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1a365d] text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold rounded">
            {isPassOutMode ? 'Po' : 'Su'}
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">
              {isPassOutMode ? 'Pass Out Students Module' : 'Suspended Students Module'}
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">
              {isPassOutMode 
                ? 'Manage graduated students who completed their diploma/certificate courses.' 
                : 'Manage suspended students with pending dues or attendance issues.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(isSuperAdmin || userPermissions?.canManageStatus) ? (
            <button
              onClick={() => setShowMoveModal(true)}
              className="px-5 py-2.5 bg-[#1a365d] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-widest border border-blue-950 flex items-center space-x-2 transition rounded shadow-sm"
            >
              {isPassOutMode ? <GraduationCap className="w-4 h-4" /> : <UserX className="w-4 h-4" />}
              <span>Move Active Students to {isPassOutMode ? 'Pass Out' : 'Suspended'}</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-rose-800 bg-rose-50 px-3 py-1.5 border border-rose-300 rounded">
              🔒 Permission required to alter student status
            </span>
          )}
        </div>
      </div>

      {/* MOVE STUDENTS MODAL */}
      {showMoveModal && (
        <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 text-[#1A1A1A]">
          <div className="bg-white border-2 border-[#1A1A1A] max-w-2xl w-full p-6 shadow-2xl space-y-4 rounded-lg">
            
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                Select Active Students to Move to {isPassOutMode ? 'Pass Out' : 'Suspended'} Module
              </h3>
              <button onClick={() => setShowMoveModal(false)} className="text-[#1A1A1A] hover:bg-[#F4F2EE] px-2 py-1 font-bold">✕</button>
            </div>

            {/* Filter */}
            <div className="flex items-center space-x-3 text-xs">
              <select
                value={selectedCourseFilter}
                onChange={(e) => setSelectedCourseFilter(e.target.value)}
                className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 font-bold uppercase text-[#1A1A1A]"
              >
                <option value="ALL">All Active Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={toggleSelectAll}
                className="px-3 py-1.5 bg-[#F4F2EE] hover:bg-white text-[#1A1A1A] border border-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex items-center space-x-1"
              >
                {selectedStudentIds.length === activeStudents.length ? <CheckSquare className="w-4 h-4 text-emerald-800" /> : <Square className="w-4 h-4" />}
                <span>Select All ({activeStudents.length})</span>
              </button>
            </div>

            {/* Active Students Checklist */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {activeStudents.map(s => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelectStudent(s.id)}
                    className={`p-3 border cursor-pointer transition flex items-center space-x-3 rounded ${
                      isSelected
                        ? 'bg-[#1a365d] text-white border-blue-900'
                        : 'bg-[#FDFCFB] border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F4F2EE]'
                    }`}
                  >
                    <div className="shrink-0">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-white" />
                      ) : (
                        <Square className="w-5 h-5 text-[#1A1A1A]/40" />
                      )}
                    </div>
                    <img src={s.photoUrl} alt="" className="w-8 h-8 object-cover border border-white/40 rounded" />
                    <div className="flex-1 min-w-0 text-xs">
                      <p className="font-bold uppercase">{s.name} ({s.studentId})</p>
                      <p className="text-[10px] opacity-80">{s.courses.map(c => c.courseName).join(', ')}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Remarks */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Remarks / Notes
              </label>
              <input
                type="text"
                value={statusChangeRemarks}
                onChange={(e) => setStatusChangeRemarks(e.target.value)}
                placeholder={isPassOutMode ? "e.g. Completed DIT Course with Grade A+" : "e.g. Uninformed absence & unpaid fees"}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none rounded"
              />
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t-2 border-[#1A1A1A]">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 bg-[#F4F2EE] text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmMove}
                disabled={selectedStudentIds.length === 0}
                className="px-5 py-2 bg-[#1a365d] hover:bg-blue-900 text-white border border-blue-900 text-xs font-bold uppercase tracking-widest transition disabled:opacity-50 rounded"
              >
                Confirm Move ({selectedStudentIds.length} Selected)
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Module Students Table */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
            {isPassOutMode ? 'Graduated / Pass Out Students List' : 'Suspended Students List'} ({moduleStudents.length})
          </h3>

          <span className="text-[11px] font-mono text-slate-600">
            {isSuperAdmin
              ? '⚡ Super Admin: Full Reactivate, Edit & Delete Actions'
              : (hasEditPermission || hasDeletePermission)
              ? `⚡ Custom Permissions: ${hasEditPermission ? 'Edit' : ''} ${hasDeletePermission ? 'Delete' : ''}`
              : '🔒 Standard View Mode'}
          </span>
        </div>

        {/* Batch Action Toolbar for Module Students */}
        {moduleSelectedIds.length > 0 && (
          <div className="bg-[#1a365d] text-white p-3.5 border border-blue-950 flex flex-wrap items-center justify-between gap-3 rounded shadow">
            <span className="font-mono text-xs font-bold bg-white text-[#1a365d] px-2.5 py-1 rounded">
              {moduleSelectedIds.length} Student(s) Selected
            </span>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setBatchReactivateConfirm(true)}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider transition flex items-center space-x-1.5 rounded shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reactivate Selected ({moduleSelectedIds.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setModuleSelectedIds([])}
                className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-100 font-bold text-xs uppercase rounded"
              >
                Deselect All
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllModuleSelected}
                    onChange={toggleSelectAllModule}
                    className="w-4 h-4 cursor-pointer accent-blue-900"
                    title="Select / Deselect All"
                  />
                </th>
                <th className="py-3 px-3">#</th>
                <th className="py-3 px-3">Student Info</th>
                <th className="py-3 px-3">Father Name</th>
                <th className="py-3 px-3">Course(s)</th>
                <th className="py-3 px-3">Status Change Date</th>
                <th className="py-3 px-3">Remarks</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/20">
              {moduleStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                    No students currently listed under {isPassOutMode ? 'Pass Out' : 'Suspended'} status.
                  </td>
                </tr>
              ) : (
                moduleStudents.map((s, idx) => {
                  const isSelected = moduleSelectedIds.includes(s.id);

                  return (
                    <tr key={s.id} className={`transition ${isSelected ? 'bg-blue-50/80' : 'hover:bg-[#F4F2EE]/50'}`}>
                      <td className="py-3 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectModuleStudent(s.id)}
                          className="w-4 h-4 cursor-pointer accent-blue-900"
                        />
                      </td>
                      <td className="py-3 px-3 font-mono text-[#1A1A1A]/60">{idx + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center space-x-3">
                        <img src={s.photoUrl} alt="" className="w-8 h-8 object-cover border border-[#1A1A1A] rounded" />
                        <div>
                          <p className="font-bold text-[#1A1A1A] uppercase">{s.name}</p>
                          <p className="font-mono text-[10px] text-[#1A1A1A]/70">{s.studentId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-[#1A1A1A]/80">{s.fatherName}</td>
                    <td className="py-3 px-3 text-[#1A1A1A]/80">{s.courses.map(c => c.courseName).join(', ')}</td>
                    <td className="py-3 px-3 font-mono text-[#1A1A1A]/80">{s.statusChangeDate || 'N/A'}</td>
                    <td className="py-3 px-3 text-[#1A1A1A]/80 max-w-[180px] truncate">{s.statusChangeRemarks || '-'}</td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Reactivate Button */}
                        {(isSuperAdmin || userPermissions?.canManageStatus) && (
                          <button
                            onClick={() => setStudentToReactivate(s)}
                            className="px-2.5 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 border border-emerald-900 transition rounded"
                            title="Reactivate Student to Active Status"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Reactivate</span>
                          </button>
                        )}

                        {/* Edit Button */}
                        {hasEditPermission && onUpdateStudent && (
                          <button
                            onClick={() => setEditingStudent(s)}
                            className="px-2 py-1 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A] transition rounded"
                            title="Edit Student Details"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                        )}

                        {/* ID Card Button */}
                        <button
                          onClick={() => setCardStudent(s)}
                          className="p-1 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition rounded"
                          title="View Official ID Card"
                        >
                          <Barcode className="w-3.5 h-3.5 text-blue-900" />
                        </button>

                        {/* Delete Button */}
                        {hasDeletePermission && onDeleteStudent && (
                          <button
                            onClick={() => setStudentToDelete(s)}
                            className="p-1 text-rose-800 hover:bg-rose-50 border border-rose-800 transition rounded"
                            title="Permanently Delete Student"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-800" />
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

      {/* Edit Student Modal */}
      {editingStudent && onUpdateStudent && (
        <EditStudentModal
          student={editingStudent}
          courses={courses}
          onSave={(updated) => {
            onUpdateStudent(updated);
            setEditingStudent(null);
          }}
          onClose={() => setEditingStudent(null)}
        />
      )}

      {/* ID Card Modal */}
      {cardStudent && (
        <StudentCardModal
          student={cardStudent}
          settings={settings}
          onClose={() => setCardStudent(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToDelete}
        title="Delete Student Record"
        message="Are you sure you want to permanently delete this student record?"
        itemName={studentToDelete ? `${studentToDelete.name} (${studentToDelete.studentId})` : undefined}
        confirmText="Delete Student"
        onConfirm={() => {
          if (studentToDelete && onDeleteStudent) {
            onDeleteStudent(studentToDelete.id);
            setStudentToDelete(null);
          }
        }}
        onClose={() => setStudentToDelete(null)}
      />

      {/* Reactivate Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!studentToReactivate}
        title="Reactivate Student"
        message="Reactivate this student back to Active status in the main institute directory?"
        itemName={studentToReactivate ? `${studentToReactivate.name} (${studentToReactivate.studentId})` : undefined}
        confirmText="Reactivate Student"
        isDanger={false}
        onConfirm={() => {
          if (studentToReactivate) {
            onUpdateStudentStatus([studentToReactivate.id], 'active', 'Reactivated back to Active status');
            setStudentToReactivate(null);
          }
        }}
        onClose={() => setStudentToReactivate(null)}
      />

      {/* Batch Reactivate Modal */}
      <ConfirmDeleteModal
        isOpen={batchReactivateConfirm}
        title={`Reactivate ${moduleSelectedIds.length} Student(s)`}
        message={`Are you sure you want to reactivate all ${moduleSelectedIds.length} selected student(s) back to Active status?`}
        confirmText="Reactivate Selected"
        isDanger={false}
        onConfirm={handleBatchReactivate}
        onClose={() => setBatchReactivateConfirm(false)}
      />

    </div>
  );
};
