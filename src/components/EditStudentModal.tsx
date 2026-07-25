import React, { useState } from 'react';
import { Student, Course, StudentStatus, UserRole, StudentCourseEnrollment } from '../types';
import { X, Save, Trash2, AlertTriangle, Upload, RefreshCw, BookOpen, Camera, Check, Tag } from 'lucide-react';
import { formatPKR } from '../lib/utils';

interface EditStudentModalProps {
  student: Student;
  courses: Course[];
  currentRole: UserRole;
  onSaveStudent: (updatedStudent: Student) => void;
  onDeleteStudent: (studentId: string) => void;
  onClose: () => void;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
];

export const EditStudentModal: React.FC<EditStudentModalProps> = ({
  student,
  courses,
  currentRole,
  onSaveStudent,
  onDeleteStudent,
  onClose,
}) => {
  // Personal Details
  const [photoUrl, setPhotoUrl] = useState<string>(student.photoUrl || PRESET_AVATARS[0]);
  const [name, setName] = useState<string>(student.name);
  const [fatherName, setFatherName] = useState<string>(student.fatherName);
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(student.gender || 'Male');
  const [dob, setDob] = useState<string>(student.dob || '2005-01-01');
  const [mobileNo, setMobileNo] = useState<string>(student.mobileNo);
  const [fatherMobileNo, setFatherMobileNo] = useState<string>(student.fatherMobileNo || '');
  const [cnic, setCnic] = useState<string>(student.cnic || '');
  const [fatherCnic, setFatherCnic] = useState<string>(student.fatherCnic || '');
  const [admissionDate, setAdmissionDate] = useState<string>(student.admissionDate || new Date().toISOString().slice(0, 10));

  // Enrolled Courses Selection (by ID)
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    student.courses.map(c => c.courseId)
  );

  // Status
  const [status, setStatus] = useState<StudentStatus>(student.status);
  const [statusChangeRemarks, setStatusChangeRemarks] = useState<string>(student.statusChangeRemarks || '');

  // Financial Ledger Overrides
  const [totalFeeCalculated, setTotalFeeCalculated] = useState<number>(student.totalFeeCalculated);
  const [totalFeePaid, setTotalFeePaid] = useState<number>(student.totalFeePaid);
  const [discountTotal, setDiscountTotal] = useState<number>(student.discountTotal || 0);

  // Custom Assigned Fee Per Student
  const [assignedMonthlyFee, setAssignedMonthlyFee] = useState<number>(
    student.assignedMonthlyFee ?? student.courses?.[0]?.monthlyFee ?? 1500
  );
  const [assignedAdmissionFee, setAssignedAdmissionFee] = useState<number>(
    student.assignedAdmissionFee ?? student.courses?.[0]?.admissionFee ?? 1000
  );

  const [showConfirmDelete, setShowConfirmDelete] = useState<boolean>(false);

  // Local File Photo Upload
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image file is too large (max 5MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoUrl(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Toggle Course Selection
  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        if (prev.length === 1) return prev; // keep at least 1 course
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // Helper: Recalculate fee automatically when switching/migrating courses
  const handleAutoRecalculateCourseFee = () => {
    let newCalculatedTotal = 0;
    selectedCourseIds.forEach(id => {
      const c = courses.find(course => course.id === id);
      if (c) {
        if (c.baseCourseType === 'Course Wise') {
          newCalculatedTotal += (c.totalCourseFee || 0);
        } else {
          const isDit = c.baseCourseType === 'DIT' || c.name.toLowerCase().includes('dit');
          const examFees = isDit ? ((c.examFeeSem1 || 1500) + (c.examFeeSem2 || 1500)) : 0;
          newCalculatedTotal += (c.durationMonths * c.monthlyFee) + c.admissionFee + examFees;
        }
      }
    });
    newCalculatedTotal = Math.max(0, newCalculatedTotal - discountTotal);
    setTotalFeeCalculated(newCalculatedTotal);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Reconstruct course enrollments list
    const updatedEnrollments: StudentCourseEnrollment[] = selectedCourseIds.map(id => {
      const courseObj = courses.find(c => c.id === id);
      const existingEnrollment = student.courses.find(c => c.courseId === id);
      const isCourseWise = courseObj?.baseCourseType === 'Course Wise';

      if (existingEnrollment) {
        return {
          ...existingEnrollment,
          monthlyFee: isCourseWise ? 0 : assignedMonthlyFee,
          admissionFee: isCourseWise ? 0 : assignedAdmissionFee,
          totalCalculatedFee: isCourseWise ? (courseObj?.totalCourseFee || existingEnrollment.totalCalculatedFee) : existingEnrollment.totalCalculatedFee,
        };
      }

      // New enrollment added during edit
      const isDit = courseObj ? ((courseObj.baseCourseType === 'DIT' || courseObj.name.toLowerCase().includes('dit')) && !isCourseWise) : false;
      const examFees = isDit ? ((courseObj?.examFeeSem1 || 1500) + (courseObj?.examFeeSem2 || 1500)) : 0;
      const courseTotal = isCourseWise ? (courseObj?.totalCourseFee || 0) : (courseObj ? (courseObj.durationMonths * assignedMonthlyFee + assignedAdmissionFee + examFees) : 0);

      return {
        courseId: id,
        courseName: courseObj ? courseObj.name : 'Unknown Course',
        durationMonths: courseObj ? courseObj.durationMonths : 1,
        monthlyFee: isCourseWise ? 0 : assignedMonthlyFee,
        admissionFee: isCourseWise ? 0 : assignedAdmissionFee,
        examFeeSem1: isDit ? (courseObj?.examFeeSem1 || 1500) : 0,
        examFeeSem2: isDit ? (courseObj?.examFeeSem2 || 1500) : 0,
        otherFee: 0,
        discountAmount: 0,
        totalCalculatedFee: courseTotal,
        enrollmentDate: admissionDate,
      };
    });

    const newBalance = Math.max(0, totalFeeCalculated - totalFeePaid);

    const updatedStudent: Student = {
      ...student,
      photoUrl,
      name,
      fatherName,
      gender,
      dob,
      mobileNo,
      fatherMobileNo,
      cnic,
      fatherCnic,
      admissionDate,
      assignedMonthlyFee,
      assignedAdmissionFee,
      courses: updatedEnrollments,
      status,
      statusChangeRemarks,
      totalFeeCalculated,
      totalFeePaid,
      discountTotal,
      balanceRemaining: newBalance,
    };

    onSaveStudent(updatedStudent);
    onClose();
  };

  const isSuperAdmin = currentRole === 'super_admin';

  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto text-[#1A1A1A]">
      <div className="bg-white border-2 border-[#1A1A1A] max-w-3xl w-full p-4 sm:p-6 shadow-2xl my-auto max-h-[92vh] overflow-y-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#1A1A1A] gap-2">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-lg sm:text-xl font-bold">
              Edit
            </div>
            <div className="min-w-0">
              <h3 className="font-serif italic font-bold text-lg sm:text-xl text-[#1A1A1A]">
                Edit Full Student Admission Details
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">
                Student ID: <span className="font-mono text-[#1A1A1A]">{student.studentId}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* PHOTO EDIT & UPLOAD SECTION */}
          <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] space-y-3">
            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
              📷 Student Photo / Passport Picture
            </label>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Photo Preview */}
              <div className="relative w-24 h-24 border-2 border-[#1A1A1A] bg-white overflow-hidden shrink-0 shadow-sm">
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Upload Controls */}
              <div className="flex-1 space-y-2 w-full">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-3 py-1.5 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-xs uppercase tracking-wider cursor-pointer border border-[#1A1A1A] flex items-center space-x-1.5">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload New Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLocalImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]/70">Or Photo Web URL:</label>
                  <input
                    type="text"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-white border border-[#1A1A1A] px-2.5 py-1 text-xs font-mono"
                  />
                </div>

                {/* Preset Avatars */}
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[9px] font-bold uppercase text-[#1A1A1A]">Preset Avatars:</span>
                  {PRESET_AVATARS.map((url, i) => (
                    <button
                      type="button"
                      key={i}
                      onClick={() => setPhotoUrl(url)}
                      className="w-6 h-6 border border-[#1A1A1A] rounded-full overflow-hidden hover:scale-110 transition"
                    >
                      <img src={url} alt="preset" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* PERSONAL DETAILS GRID */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] border-b border-[#1A1A1A] pb-1">
              Personal Information
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Father's Name *
                </label>
                <input
                  type="text"
                  required
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Gender
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-bold"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Student Mobile No *
                </label>
                <input
                  type="text"
                  required
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Father Mobile No
                </label>
                <input
                  type="text"
                  value={fatherMobileNo}
                  onChange={(e) => setFatherMobileNo(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  CNIC / B-Form No
                </label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Father CNIC No
                </label>
                <input
                  type="text"
                  value={fatherCnic}
                  onChange={(e) => setFatherCnic(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Admission Date
                </label>
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
              </div>
            </div>
          </div>

          {/* COURSE SELECTION & COURSE MIGRATION / TRANSFER */}
          <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1A1A1A]/30 pb-2">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-[#1A1A1A] flex items-center space-x-2">
                  <BookOpen className="w-4 h-4" />
                  <span>Enrolled Courses & Course Transfer / Switch</span>
                </h4>
                <p className="text-[10px] text-[#1A1A1A]/70">Select or switch courses for this student</p>
              </div>

              <button
                type="button"
                onClick={handleAutoRecalculateCourseFee}
                className="px-2.5 py-1 bg-white border border-[#1A1A1A] hover:bg-slate-100 font-bold text-[10px] uppercase tracking-wider flex items-center space-x-1"
                title="Recalculate expected total fee based on selected courses"
              >
                <RefreshCw className="w-3 h-3 text-[#1A1A1A]" />
                <span>Auto Recalculate Course Fee</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {courses.map((c) => {
                const isSelected = selectedCourseIds.includes(c.id);

                return (
                  <label
                    key={c.id}
                    className={`flex items-start space-x-2.5 p-2.5 border cursor-pointer transition ${
                      isSelected ? 'bg-white border-2 border-[#1A1A1A] shadow-sm' : 'bg-[#FDFCFB] border-slate-300 opacity-70'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleCourseSelection(c.id)}
                      className="w-4 h-4 mt-0.5 accent-[#1A1A1A]"
                    />
                    <div className="flex-1 text-xs">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-bold text-[#1A1A1A] block">{c.name}</span>
                        {c.baseCourseType === 'Course Wise' && (
                          <span className="text-[9px] font-bold px-1 bg-amber-100 text-amber-900 border border-amber-600 font-mono">
                            CW
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#1A1A1A]/70 font-mono block">
                        {c.baseCourseType === 'Course Wise'
                          ? `Duration: ${c.durationMonths}m • Package: ${formatPKR(c.totalCourseFee || 0)}`
                          : `Duration: ${c.durationMonths}m • Fee: ${formatPKR(c.monthlyFee)}/mo`}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* STATUS SELECTION */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Student Status {currentRole !== 'super_admin' && <span className="text-rose-700 font-mono">(Super Admin required for Pass Out / Suspend)</span>}
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as StudentStatus)}
                className="w-full bg-[#FDFCFB] border-2 border-[#1A1A1A] px-3 py-1.5 text-xs font-bold uppercase"
              >
                <option value="active">🟢 Active Student</option>
                <option value="pass_out" disabled={currentRole !== 'super_admin'}>
                  🎓 Pass Out / Graduated {currentRole !== 'super_admin' ? '(Super Admin Only)' : ''}
                </option>
                <option value="suspended" disabled={currentRole !== 'super_admin'}>
                  🔴 Suspended / Left {currentRole !== 'super_admin' ? '(Super Admin Only)' : ''}
                </option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Status Change Remarks / Reason
              </label>
              <input
                type="text"
                value={statusChangeRemarks}
                onChange={(e) => setStatusChangeRemarks(e.target.value)}
                placeholder="Reason for pass out / left"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A]"
              />
            </div>
          </div>

          {/* FINANCIAL LEDGER OVERRIDES */}
          <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] space-y-3">
            <div className="flex items-center justify-between border-b border-[#1A1A1A]/30 pb-1">
              <span className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]">
                Financial Fee Ledger Adjustments
              </span>
              <span className="font-mono text-xs font-bold text-rose-800">
                Current Remaining Balance: {formatPKR(Math.max(0, totalFeeCalculated - totalFeePaid))}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-300">
              <div className="bg-emerald-50 p-2.5 border border-emerald-700">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-950 mb-1 flex items-center justify-between">
                  <span>Assigned Monthly Fee (PKR)</span>
                  <span className="text-[9px] bg-emerald-800 text-white px-1 font-mono">EDITABLE</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={assignedMonthlyFee}
                  onChange={(e) => setAssignedMonthlyFee(Number(e.target.value))}
                  className="w-full bg-white border border-emerald-800 px-2.5 py-1.5 text-xs text-emerald-950 font-mono font-extrabold focus:outline-none"
                />
                <p className="text-[9px] text-emerald-800 mt-1">Default monthly fee used for all future fee submissions for this student (e.g. 1200)</p>
              </div>

              <div className="bg-white p-2.5 border border-[#1A1A1A]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Assigned Admission Fee (PKR)
                </label>
                <input
                  type="number"
                  min="0"
                  value={assignedAdmissionFee}
                  onChange={(e) => setAssignedAdmissionFee(Number(e.target.value))}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono font-bold text-[#1A1A1A]"
                />
                <p className="text-[9px] text-[#1A1A1A]/70 mt-1">Custom admission fee for this student</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-bold uppercase text-[#1A1A1A] mb-1">
                  Total Calculated Fee (PKR)
                </label>
                <input
                  type="number"
                  value={totalFeeCalculated}
                  onChange={(e) => setTotalFeeCalculated(Number(e.target.value))}
                  className="w-full bg-white border border-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-emerald-800 mb-1">
                  Total Fee Paid Till Date (PKR)
                </label>
                <input
                  type="number"
                  value={totalFeePaid}
                  onChange={(e) => setTotalFeePaid(Number(e.target.value))}
                  className="w-full bg-white border border-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="block text-[9px] font-bold uppercase text-[#1A1A1A] mb-1">
                  Special Concession / Discount
                </label>
                <input
                  type="number"
                  value={discountTotal}
                  onChange={(e) => setDiscountTotal(Number(e.target.value))}
                  className="w-full bg-white border border-[#1A1A1A] px-2.5 py-1.5 text-xs font-mono font-bold"
                />
              </div>
            </div>
          </div>

          {/* DANGER ZONE (SUPER ADMIN) */}
          {isSuperAdmin && (
            <div className="pt-2 border-t border-[#1A1A1A]/30">
              {!showConfirmDelete ? (
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(true)}
                  className="px-3 py-1.5 bg-rose-50 text-rose-800 border border-rose-800 hover:bg-rose-100 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Student Record</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-100 border-2 border-rose-800 text-rose-900 space-y-2">
                  <div className="flex items-center space-x-2 text-xs font-bold uppercase">
                    <AlertTriangle className="w-4 h-4 text-rose-800" />
                    <span>Permanently delete {student.name} ({student.studentId})?</span>
                  </div>
                  <p className="text-[11px]">This action will delete the student permanently from database.</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onDeleteStudent(student.id);
                        onClose();
                      }}
                      className="px-3 py-1 bg-rose-800 text-white font-bold text-xs uppercase"
                    >
                      Yes, Delete Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowConfirmDelete(false)}
                      className="px-3 py-1 bg-white border border-[#1A1A1A] font-bold text-xs uppercase"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* FOOTER BUTTONS */}
          <div className="pt-4 border-t-2 border-[#1A1A1A] flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#1A1A1A] font-bold text-xs uppercase tracking-wider"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#1A1A1A] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 hover:bg-[#333]"
            >
              <Save className="w-4 h-4" />
              <span>Save Student Changes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
