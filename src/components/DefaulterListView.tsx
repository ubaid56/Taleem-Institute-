import React, { useState } from 'react';
import { Student, Course, FeeTransaction, UserRole } from '../types';
import { formatPKR } from '../lib/utils';
import { AlertTriangle, ShieldCheck, CheckCircle2, Search, Filter, Phone, UserX } from 'lucide-react';

interface DefaulterListViewProps {
  students: Student[];
  courses: Course[];
  transactions: FeeTransaction[];
  currentRole: UserRole;
  onUpdateStudent: (updatedStudent: Student) => void;
}

export const DefaulterListView: React.FC<DefaulterListViewProps> = ({
  students,
  courses,
  transactions,
  currentRole,
  onUpdateStudent,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Current date info
  const currentDate = new Date();
  const currentDay = currentDate.getDate();
  const currentMonthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Filter active students who have unpaid balances / pending monthly fees
  const defaulterStudents = students.filter(s => {
    if (s.status !== 'active') return false;
    if (s.isDefaulterExempted) return false;

    const matchesCourse = selectedCourseFilter === 'ALL' || s.courses.some(c => c.courseId === selectedCourseFilter);
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobileNo.includes(searchQuery);

    // Defaulter condition: balanceRemaining > 0 (or has not paid current month fee)
    const hasUnpaidBalance = s.balanceRemaining > 0;

    return matchesCourse && matchesSearch && hasUnpaidBalance;
  });

  const handleExemptStudent = (student: Student) => {
    if (currentRole !== 'super_admin') {
      alert('Access Denied: Only Super Admin can remove/exempt students from the defaulter list.');
      return;
    }
    const updated: Student = {
      ...student,
      isDefaulterExempted: true,
    };
    onUpdateStudent(updated);
  };

  const handleUnExemptStudent = (student: Student) => {
    if (currentRole !== 'super_admin') {
      alert('Access Denied: Only Super Admin can manage defaulter exemptions.');
      return;
    }
    const updated: Student = {
      ...student,
      isDefaulterExempted: false,
    };
    onUpdateStudent(updated);
  };

  // Exempted students list for Super Admin review
  const exemptedStudents = students.filter(s => s.status === 'active' && s.isDefaulterExempted);

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-rose-700 text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold">
            !
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Fee Defaulters & Due Tracker</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">
              Automatic 5th of Month Due Cutoff • {currentMonthName} • Only Super Admin can exempt/remove from defaulters
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="px-4 py-2 bg-rose-50 border-2 border-rose-700 text-rose-900 text-xs font-bold font-mono">
            Defaulters Count: {defaulterStudents.length}
          </div>
        </div>
      </div>

      {/* Notice Banner */}
      <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 flex items-center justify-between text-xs font-medium">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>
            Monthly fees are automatically issued on the 30th. Students who have not submitted their fees until the <strong>5th date</strong> of every month appear here automatically. Once they submit their monthly fees, their balance updates and they are removed.
          </span>
        </div>
        <span className="font-bold font-mono uppercase bg-white border border-[#1A1A1A] px-2 py-1">
          Current Day: {currentDay}
        </span>
      </div>

      {/* Filter Controls */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-1/3">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Filter by Course</label>
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
          >
            <option value="ALL">All Courses & Batches</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="w-full sm:w-1/2">
          <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Search Defaulters</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-[#1A1A1A]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, ID or mobile..."
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] font-medium focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Defaulters Mobile Cards (Visible on mobile) */}
      <div className="block lg:hidden space-y-3">
        {defaulterStudents.length > 0 ? (
          defaulterStudents.map((student) => (
            <div key={student.id} className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm">
              <div className="flex items-center space-x-3">
                <img
                  src={student.photoUrl}
                  alt=""
                  className="w-10 h-10 object-cover border border-[#1A1A1A] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-[#1A1A1A] uppercase truncate">{student.name}</p>
                  <p className="text-xs text-[#1A1A1A]/70 font-mono">ID: {student.studentId} • S/O: {student.fatherName}</p>
                  <p className="text-xs font-mono font-bold text-[#1A1A1A] mt-0.5"><Phone className="w-3 h-3 inline mr-1 text-[#1A1A1A]/60" />{student.mobileNo || 'N/A'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] font-mono">
                <div>
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Total Paid</p>
                  <p className="text-emerald-800 font-bold">{formatPKR(student.totalFeePaid)}</p>
                </div>
                <div className="bg-rose-50 p-1 border border-rose-300">
                  <p className="text-[9px] uppercase font-bold text-rose-800">Remaining Due</p>
                  <p className="text-rose-800 font-black">{formatPKR(student.balanceRemaining)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="text-[10px] font-bold text-[#1A1A1A]/80">
                  {student.courses.map(c => c.courseName).join(', ')}
                </div>
                {currentRole === 'super_admin' ? (
                  <button
                    onClick={() => handleExemptStudent(student)}
                    className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider border border-[#1A1A1A]"
                  >
                    Exempt / Remove
                  </button>
                ) : (
                  <span className="text-[10px] text-[#1A1A1A]/60 italic font-bold">Super Admin Only</span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-white border-2 border-[#1A1A1A] text-xs text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
            🎉 No fee defaulters found! All active students have cleared their dues.
          </div>
        )}
      </div>

      {/* Defaulter Desktop Table */}
      <div className="hidden lg:block bg-white border-2 border-[#1A1A1A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1A1A1A] text-white text-[10px] uppercase tracking-widest font-bold">
                <th className="p-3 border-r border-[#1A1A1A]">Student Details</th>
                <th className="p-3 border-r border-[#1A1A1A]">Enrolled Course(s)</th>
                <th className="p-3 border-r border-[#1A1A1A]">Contact No</th>
                <th className="p-3 border-r border-[#1A1A1A]">Total Calculated</th>
                <th className="p-3 border-r border-[#1A1A1A]">Total Paid</th>
                <th className="p-3 border-r border-[#1A1A1A] bg-rose-900">Remaining Due</th>
                <th className="p-3 text-center">Super Admin Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]">
              {defaulterStudents.length > 0 ? (
                defaulterStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-[#F4F2EE] transition text-xs">
                    <td className="p-3 border-r border-[#1A1A1A]">
                      <div className="flex items-center space-x-3">
                        <img
                          src={student.photoUrl}
                          alt=""
                          className="w-9 h-9 object-cover border border-[#1A1A1A]"
                        />
                        <div>
                          <p className="font-bold text-[#1A1A1A]">{student.name}</p>
                          <p className="text-[10px] text-[#1A1A1A]/70 font-mono">ID: {student.studentId} • S/O: {student.fatherName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3 border-r border-[#1A1A1A]">
                      {student.courses.map(c => (
                        <div key={c.courseId} className="font-medium text-[11px] truncate max-w-[200px]">
                          • {c.courseName} <span className="font-mono text-emerald-800 font-bold">({formatPKR(c.monthlyFee)}/m)</span>
                        </div>
                      ))}
                    </td>

                    <td className="p-3 border-r border-[#1A1A1A] font-mono text-[11px]">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3 text-[#1A1A1A]/60" />
                        <span>{student.mobileNo || 'N/A'}</span>
                      </div>
                    </td>

                    <td className="p-3 border-r border-[#1A1A1A] font-mono font-bold">
                      {formatPKR(student.totalFeeCalculated)}
                    </td>

                    <td className="p-3 border-r border-[#1A1A1A] font-mono font-bold text-emerald-800">
                      {formatPKR(student.totalFeePaid)}
                    </td>

                    <td className="p-3 border-r border-[#1A1A1A] font-mono font-extrabold text-rose-700 bg-rose-50">
                      {formatPKR(student.balanceRemaining)}
                    </td>

                    <td className="p-3 text-center">
                      {currentRole === 'super_admin' ? (
                        <button
                          onClick={() => handleExemptStudent(student)}
                          className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#333] text-white text-[10px] font-bold uppercase tracking-wider transition border border-[#1A1A1A]"
                        >
                          Exempt / Remove
                        </button>
                      ) : (
                        <span className="text-[10px] text-[#1A1A1A]/60 italic font-bold">Super Admin Only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                    🎉 No fee defaulters found! All active students have cleared their dues.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exempted Defaulters Section (Super Admin visible) */}
      {exemptedStudents.length > 0 && currentRole === 'super_admin' && (
        <div className="bg-white border-2 border-[#1A1A1A] p-5 space-y-3">
          <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>Exempted / Managed Defaulters ({exemptedStudents.length})</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {exemptedStudents.map(student => (
              <div key={student.id} className="p-3 bg-[#F4F2EE] border border-[#1A1A1A] flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs">{student.name} ({student.studentId})</p>
                  <p className="text-[10px] text-rose-700 font-mono">Due: {formatPKR(student.balanceRemaining)}</p>
                </div>
                <button
                  onClick={() => handleUnExemptStudent(student)}
                  className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-800 border border-[#1A1A1A] text-[10px] font-bold uppercase"
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
