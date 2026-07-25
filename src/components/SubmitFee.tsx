import React, { useState, useMemo } from 'react';
import { Student, Course, FeeTransaction, UserRole } from '../types';
import { generateNextReceiptNo, formatPKR } from '../lib/utils';
import { Receipt, Search, CreditCard, CheckCircle2, History, AlertCircle, ArrowRight, Printer } from 'lucide-react';

interface SubmitFeeProps {
  students: Student[];
  courses: Course[];
  existingTxs: FeeTransaction[];
  currentRole: UserRole;
  onSubmitFee: (newTx: FeeTransaction, updatedStudent: Student) => void;
  onOpenReceipt: (tx: FeeTransaction) => void;
}

export const SubmitFee: React.FC<SubmitFeeProps> = ({
  students,
  courses,
  existingTxs,
  currentRole,
  onSubmitFee,
  onOpenReceipt,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  // Payment Form Fields
  const [payAmount, setPayAmount] = useState<number>(1500);
  const [isManualAmount, setIsManualAmount] = useState<boolean>(false);
  const [paymentSource, setPaymentSource] = useState<'cash' | 'bank'>('cash');
  const [remarks, setRemarks] = useState<string>('Monthly Fee Submission');
  const [successTx, setSuccessTx] = useState<FeeTransaction | null>(null);

  // Itemized Fee Breakdown Fields
  const [includeMonthly, setIncludeMonthly] = useState<boolean>(true);
  const [monthlyFeeAmount, setMonthlyFeeAmount] = useState<number>(1500);
  const [monthlyFeeMonth, setMonthlyFeeMonth] = useState<string>('July 2026');

  const [includeExam, setIncludeExam] = useState<boolean>(false);
  const [examFeeAmount, setExamFeeAmount] = useState<number>(5000);

  const [includeAdmission, setIncludeAdmission] = useState<boolean>(false);
  const [admissionFeeAmount, setAdmissionFeeAmount] = useState<number>(1000);

  const [includeOther, setIncludeOther] = useState<boolean>(false);
  const [otherFeeTitle, setOtherFeeTitle] = useState<string>('Late Fee / Fine');
  const [otherFeeAmount, setOtherFeeAmount] = useState<number>(500);

  const [discountAmount, setDiscountAmount] = useState<number>(0);

  // Auto calculate sum of breakdown
  const computedBreakdownTotal = useMemo(() => {
    let sum = 0;
    if (includeMonthly) sum += Number(monthlyFeeAmount) || 0;
    if (includeExam) sum += Number(examFeeAmount) || 0;
    if (includeAdmission) sum += Number(admissionFeeAmount) || 0;
    if (includeOther) sum += Number(otherFeeAmount) || 0;
    sum -= Number(discountAmount) || 0;
    return Math.max(0, sum);
  }, [includeMonthly, monthlyFeeAmount, includeExam, examFeeAmount, includeAdmission, admissionFeeAmount, includeOther, otherFeeAmount, discountAmount]);

  // Sync payAmount with computed total unless user typed manually
  React.useEffect(() => {
    if (!isManualAmount) {
      setPayAmount(computedBreakdownTotal);
    }
  }, [computedBreakdownTotal, isManualAmount]);

  // Active students filtered by course and search
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (s.status !== 'active') return false;

      const matchesCourse = selectedCourseFilter === 'ALL' || s.courses.some(c => c.courseId === selectedCourseFilter);
      const matchesSearch = 
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.mobileNo.includes(searchQuery) ||
        s.cnic.includes(searchQuery);

      return matchesCourse && matchesSearch;
    });
  }, [students, selectedCourseFilter, searchQuery]);

  const selectedStudent = useMemo(() => {
    return students.find(s => s.studentId === selectedStudentId || s.id === selectedStudentId);
  }, [students, selectedStudentId]);

  const isCourseWiseStudent = useMemo(() => {
    if (!selectedStudent) return false;
    return selectedStudent.courses.some(sc => {
      const foundCourse = courses.find(c => c.id === sc.courseId);
      return foundCourse?.baseCourseType === 'Course Wise' || (sc.monthlyFee === 0 && sc.admissionFee === 0 && sc.totalCalculatedFee > 0);
    });
  }, [selectedStudent, courses]);

  // Sync selected student's custom assigned fees automatically
  React.useEffect(() => {
    if (selectedStudent) {
      if (isCourseWiseStudent) {
        setIncludeMonthly(false);
        setIncludeAdmission(false);
      }
      const customMonthly = selectedStudent.assignedMonthlyFee ?? selectedStudent.courses?.[0]?.monthlyFee ?? 1500;
      const customAdmission = selectedStudent.assignedAdmissionFee ?? selectedStudent.courses?.[0]?.admissionFee ?? 1000;
      const customExam = selectedStudent.assignedExamFee ?? selectedStudent.courses?.[0]?.examFeeSem1 ?? 5000;

      setMonthlyFeeAmount(customMonthly);
      setAdmissionFeeAmount(customAdmission);
      setExamFeeAmount(customExam);
      setIsManualAmount(false);
    }
  }, [selectedStudent, isCourseWiseStudent]);

  // Selected student's past transactions
  const studentHistory = useMemo(() => {
    if (!selectedStudent) return [];
    return existingTxs.filter(t => t.studentId === selectedStudent.studentId);
  }, [existingTxs, selectedStudent]);

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const currentPay = Number(payAmount) || 0;
    if (currentPay <= 0) {
      alert('Please enter a valid payment amount greater than 0.');
      return;
    }

    const previousBalance = selectedStudent.balanceRemaining;
    const newBalance = Math.max(0, previousBalance - currentPay);
    const newPaidTotal = selectedStudent.totalFeePaid + currentPay;

    const receiptNo = generateNextReceiptNo(existingTxs);
    const dateStr = `${new Date().toISOString().slice(0, 10)} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

    const feeBreakdown = {
      monthlyFee: includeMonthly ? Number(monthlyFeeAmount) : undefined,
      monthlyFeeMonth: includeMonthly ? monthlyFeeMonth : undefined,
      examFee: includeExam ? Number(examFeeAmount) : undefined,
      admissionFee: includeAdmission ? Number(admissionFeeAmount) : undefined,
      otherFee: includeOther ? Number(otherFeeAmount) : undefined,
      otherFeeTitle: includeOther ? otherFeeTitle : undefined,
      discountAmount: discountAmount > 0 ? Number(discountAmount) : undefined,
    };

    const newTx: FeeTransaction = {
      id: `tx-${Date.now()}`,
      receiptNo,
      studentId: selectedStudent.studentId,
      studentName: selectedStudent.name,
      fatherName: selectedStudent.fatherName,
      courseNames: selectedStudent.courses.map(c => c.courseName),
      paymentDate: dateStr,
      amountPaid: currentPay,
      previousBalance,
      remainingBalance: newBalance,
      paymentSource,
      feeBreakdown,
      remarks,
      collectedByRole: currentRole,
      collectedByName: currentRole === 'super_admin' ? 'Ubaid Ahmad (Owner)' : 'Sajid Khan (Accountant)',
    };

    const updatedStudent: Student = {
      ...selectedStudent,
      totalFeePaid: newPaidTotal,
      balanceRemaining: newBalance,
    };

    onSubmitFee(newTx, updatedStudent);
    setSuccessTx(newTx);
    onOpenReceipt(newTx);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Top Banner */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl sm:text-2xl font-bold">
            Rs
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">Fee Submission Desk</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Collect fee, auto calculate remaining dues & print thermal receipt</p>
          </div>
        </div>

        <div className="text-left md:text-right shrink-0">
          <span className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold block">Auto Thermal Format</span>
          <p className="text-xs font-bold text-[#1A1A1A] flex items-center md:justify-end gap-1">
            <Printer className="w-3.5 h-3.5 shrink-0" /> 80mm Dual Copy (Student & Institute)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Student Selector & Search */}
        <div className="lg:col-span-5 bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] pb-1 border-b border-[#1A1A1A] flex items-center justify-between">
            <span>1. Select Student</span>
            <span className="text-[#1A1A1A] font-mono">{filteredStudents.length} Found</span>
          </h3>

          {/* Filter by Course */}
          <div>
            <label className="block text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] mb-1">Filter by Course</label>
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
            >
              <option value="ALL">All Courses</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#1A1A1A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, ID (TIST-...), Phone, CNIC..."
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder-slate-400 focus:bg-white focus:outline-none"
            />
          </div>

          {/* Student List */}
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {filteredStudents.length === 0 ? (
              <div className="p-8 text-center text-[#1A1A1A]/60 text-xs font-bold uppercase tracking-wider">
                No active students matching criteria.
              </div>
            ) : (
              filteredStudents.map(student => {
                const isSelected = selectedStudent?.studentId === student.studentId;
                const hasDues = student.balanceRemaining > 0;

                return (
                  <div
                    key={student.id}
                    onClick={() => {
                      setSelectedStudentId(student.studentId);
                      setSuccessTx(null);
                      const assignedMonthly = student.courses[0]?.monthlyFee || 1500;
                      setMonthlyFeeAmount(assignedMonthly);
                      setPayAmount(assignedMonthly);
                    }}
                    className={`p-3 border cursor-pointer transition flex items-center space-x-3 ${
                      isSelected
                        ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        : 'bg-[#F4F2EE] border-[#1A1A1A] hover:bg-white text-[#1A1A1A]'
                    }`}
                  >
                    <img
                      src={student.photoUrl}
                      alt={student.name}
                      className="w-10 h-10 object-cover border border-[#1A1A1A] shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`}>{student.name}</p>
                        <span className={`font-mono text-[10px] font-bold ${isSelected ? 'text-slate-300' : 'text-[#1A1A1A]'}`}>{student.studentId}</span>
                      </div>
                      <p className={`text-[10px] ${isSelected ? 'text-slate-300' : 'text-[#1A1A1A]/70'}`}>S/O: {student.fatherName}</p>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className={`truncate max-w-[140px] ${isSelected ? 'text-slate-400' : 'text-[#1A1A1A]/60'}`}>
                          {student.courses.map(c => c.courseName.split(' ')[0]).join(', ')}
                        </span>
                        <span className={`font-mono font-bold ${hasDues ? (isSelected ? 'text-rose-300' : 'text-rose-800') : (isSelected ? 'text-emerald-300' : 'text-emerald-800')}`}>
                          Dues: {formatPKR(student.balanceRemaining)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Fee Details, Payment Form & Printable Receipt */}
        <div className="lg:col-span-7 bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
          
          {!selectedStudent ? (
            <div className="py-20 text-center space-y-3 text-[#1A1A1A]/60">
              <Receipt className="w-12 h-12 mx-auto text-[#1A1A1A]/40" />
              <p className="text-sm font-bold uppercase tracking-wider">Please select a student from the left panel to submit fee.</p>
            </div>
          ) : (
            <>
              {/* Selected Student Card Summary */}
              <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedStudent.photoUrl}
                    alt={selectedStudent.name}
                    className="w-12 h-12 object-cover border border-[#1A1A1A] shrink-0"
                  />
                  <div>
                    <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] uppercase">{selectedStudent.name}</h3>
                    <p className="text-xs text-[#1A1A1A]/70 font-medium">Father: {selectedStudent.fatherName} • Mobile: {selectedStudent.mobileNo}</p>
                    <p className="text-[11px] text-[#1A1A1A] font-bold mt-0.5">
                      Enrolled: {selectedStudent.courses.map(c => c.courseName).join(' + ')}
                    </p>
                  </div>
                </div>

                <span className="bg-[#1A1A1A] text-white font-mono text-xs px-3 py-1 border border-[#1A1A1A] font-bold self-start sm:self-auto">
                  {selectedStudent.studentId}
                </span>
              </div>

              {/* Financial Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Total Course Fee</p>
                  <p className="text-sm font-bold text-[#1A1A1A] font-mono mt-0.5">{formatPKR(selectedStudent.totalFeeCalculated)}</p>
                </div>

                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <p className="text-[10px] text-emerald-800 uppercase tracking-widest font-bold">Total Paid To Date</p>
                  <p className="text-sm font-bold text-emerald-800 font-mono mt-0.5">{formatPKR(selectedStudent.totalFeePaid)}</p>
                </div>

                <div className="bg-white p-3 border-2 border-rose-800">
                  <p className="text-[10px] text-rose-800 uppercase tracking-widest font-bold">Remaining Balance</p>
                  <p className="text-base font-black text-rose-800 font-mono mt-0.5">{formatPKR(selectedStudent.balanceRemaining)}</p>
                </div>
              </div>

              {/* Payment Entry Form */}
              <form onSubmit={handleSubmitPayment} className="space-y-4 pt-2 border-t-2 border-[#1A1A1A]">
                <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-[#1A1A1A]" />
                  <span>Itemized Fee Submission Breakdown</span>
                </h4>

                {/* Breakdown Item Checkboxes & Inputs */}
                <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A]">Select Fee Types Collected:</p>
                    {isCourseWiseStudent && (
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-600 uppercase tracking-wider">
                        Course Wise Student
                      </span>
                    )}
                  </div>

                  {isCourseWiseStudent && (
                    <div className="bg-amber-50 border border-amber-600 p-2.5 rounded text-xs text-amber-950 font-medium leading-relaxed">
                      📌 <strong>Course Wise Enrolled:</strong> Monthly tuition fees and admission fees are disabled for course-wise students. Submitted amounts are credited toward the total course package balance.
                    </div>
                  )}
                  
                  {/* 1. Monthly Tuition Fee */}
                  <div className={`p-2.5 bg-white border border-[#1A1A1A] space-y-2 ${isCourseWiseStudent ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isCourseWiseStudent}
                          checked={includeMonthly && !isCourseWiseStudent}
                          onChange={(e) => {
                            setIncludeMonthly(e.target.checked);
                            setIsManualAmount(false);
                          }}
                          className="w-4 h-4 accent-[#1A1A1A]"
                        />
                        <span>📅 Monthly Tuition Fee</span>
                        {isCourseWiseStudent && <span className="text-[9px] text-amber-800 font-normal">(N/A for Course Wise)</span>}
                      </label>
                      <span className="text-[10px] text-[#1A1A1A]/70 font-mono">Month:</span>
                    </div>

                    {includeMonthly && !isCourseWiseStudent && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Month Name</label>
                          <input
                            type="text"
                            value={monthlyFeeMonth}
                            onChange={(e) => setMonthlyFeeMonth(e.target.value)}
                            placeholder="e.g. July 2026"
                            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-bold text-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Amount (PKR)</label>
                          <input
                            type="number"
                            min="0"
                            value={monthlyFeeAmount}
                            onChange={(e) => {
                              setMonthlyFeeAmount(Number(e.target.value));
                              setIsManualAmount(false);
                            }}
                            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-mono font-bold text-[#1A1A1A]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Examination Fee */}
                  <div className="p-2.5 bg-white border border-[#1A1A1A] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeExam}
                          onChange={(e) => {
                            setIncludeExam(e.target.checked);
                            setIsManualAmount(false);
                          }}
                          className="w-4 h-4 accent-[#1A1A1A]"
                        />
                        <span>📝 Examination Fee (Board / Semester)</span>
                      </label>
                    </div>

                    {includeExam && (
                      <div className="pt-1 border-t border-slate-200">
                        <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Exam Fee Amount (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={examFeeAmount}
                          onChange={(e) => {
                            setExamFeeAmount(Number(e.target.value));
                            setIsManualAmount(false);
                          }}
                          placeholder="e.g. 5000"
                          className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-mono font-bold text-[#1A1A1A]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 3. Admission / Registration Fee */}
                  <div className={`p-2.5 bg-white border border-[#1A1A1A] space-y-2 ${isCourseWiseStudent ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                        <input
                          type="checkbox"
                          disabled={isCourseWiseStudent}
                          checked={includeAdmission && !isCourseWiseStudent}
                          onChange={(e) => {
                            setIncludeAdmission(e.target.checked);
                            setIsManualAmount(false);
                          }}
                          className="w-4 h-4 accent-[#1A1A1A]"
                        />
                        <span>🎓 Admission / Registration Fee</span>
                        {isCourseWiseStudent && <span className="text-[9px] text-amber-800 font-normal">(N/A for Course Wise)</span>}
                      </label>
                    </div>

                    {includeAdmission && !isCourseWiseStudent && (
                      <div className="pt-1 border-t border-slate-200">
                        <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Admission Fee Amount (PKR)</label>
                        <input
                          type="number"
                          min="0"
                          value={admissionFeeAmount}
                          onChange={(e) => {
                            setAdmissionFeeAmount(Number(e.target.value));
                            setIsManualAmount(false);
                          }}
                          placeholder="e.g. 1000"
                          className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-mono font-bold text-[#1A1A1A]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 4. Other / Miscellaneous Fee */}
                  <div className="p-2.5 bg-white border border-[#1A1A1A] space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="flex items-center space-x-2 text-xs font-bold text-[#1A1A1A] cursor-pointer">
                        <input
                          type="checkbox"
                          checked={includeOther}
                          onChange={(e) => {
                            setIncludeOther(e.target.checked);
                            setIsManualAmount(false);
                          }}
                          className="w-4 h-4 accent-[#1A1A1A]"
                        />
                        <span>🏷️ Other / Fine / Late Fee / Notes</span>
                      </label>
                    </div>

                    {includeOther && (
                      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200">
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Fee Title / Label</label>
                          <input
                            type="text"
                            value={otherFeeTitle}
                            onChange={(e) => setOtherFeeTitle(e.target.value)}
                            placeholder="e.g. Late Fine"
                            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-bold text-[#1A1A1A]"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] uppercase font-bold text-[#1A1A1A]">Amount (PKR)</label>
                          <input
                            type="number"
                            min="0"
                            value={otherFeeAmount}
                            onChange={(e) => {
                              setOtherFeeAmount(Number(e.target.value));
                              setIsManualAmount(false);
                            }}
                            className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-mono font-bold text-[#1A1A1A]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Discount / Concession */}
                  <div className="p-2.5 bg-emerald-50 border border-emerald-800 space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-emerald-900">
                      🎁 Discount / Fee Waiver Amount (PKR)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={discountAmount}
                      onChange={(e) => {
                        setDiscountAmount(Number(e.target.value));
                        setIsManualAmount(false);
                      }}
                      placeholder="e.g. 0"
                      className="w-full bg-white border border-emerald-800 px-2 py-1 text-xs font-mono font-bold text-emerald-900"
                    />
                  </div>

                </div>

                {/* Final Total and Payment Source */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Total Amount to Collect */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1 flex items-center justify-between">
                      <span>Total Collection Amount (PKR) *</span>
                      <span className="text-[9px] text-[#1A1A1A]/70 italic">Calculated: {formatPKR(computedBreakdownTotal)}</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={payAmount}
                      onChange={(e) => {
                        setPayAmount(Number(e.target.value));
                        setIsManualAmount(true);
                      }}
                      className="w-full bg-[#FDFCFB] border-2 border-[#1A1A1A] px-3.5 py-2.5 text-lg font-mono font-black text-[#1A1A1A] focus:outline-none focus:bg-white"
                    />
                  </div>

                  {/* Payment Source */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                      Payment Source *
                    </label>
                    <select
                      value={paymentSource}
                      onChange={(e) => setPaymentSource(e.target.value as any)}
                      className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none focus:bg-white"
                    >
                      <option value="cash">💵 Cash Payment</option>
                      <option value="bank">🏦 Bank Transfer / EasyPaisa / JazzCash</option>
                    </select>
                  </div>

                  {/* Remarks / Description */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                      Payment Remarks / Note
                    </label>
                    <input
                      type="text"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      placeholder="e.g. Monthly Fee + Exam Fee Submission"
                      className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:bg-white"
                    />
                  </div>

                </div>

                {/* Auto Calculated Balance Preview */}
                <div className="p-3 bg-[#F4F2EE] border border-[#1A1A1A] flex items-center justify-between text-xs">
                  <span className="text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">New Balance after this payment:</span>
                  <span className="font-mono font-bold text-[#1A1A1A] text-sm">
                    {formatPKR(Math.max(0, selectedStudent.balanceRemaining - Number(payAmount)))}
                  </span>
                </div>

                {/* Submit Fee Button */}
                <button
                  type="submit"
                  className="w-full py-3 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center justify-center space-x-2 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Fee & Thermal Print</span>
                </button>
              </form>

              {/* Success Notification Box */}
              {successTx && (
                <div className="p-4 bg-[#F4F2EE] border-2 border-[#1A1A1A] flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[#1A1A1A] text-xs">
                    <CheckCircle2 className="w-5 h-5 text-[#1A1A1A] shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider">Fee Payment Submitted!</p>
                      <p className="text-[11px] font-mono">Receipt #: {successTx.receiptNo}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onOpenReceipt(successTx)}
                    className="px-3 py-1.5 bg-[#1A1A1A] text-white rounded-none text-xs font-bold uppercase tracking-wider flex items-center space-x-1 border border-[#1A1A1A]"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Thermal Receipt</span>
                  </button>
                </div>
              )}

              {/* Past Transactions for this student */}
              {studentHistory.length > 0 && (
                <div className="pt-2 border-t-2 border-[#1A1A1A] space-y-2">
                  <h4 className="text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A] font-bold flex items-center space-x-1">
                    <History className="w-3.5 h-3.5 text-[#1A1A1A]" />
                    <span>Payment History for {selectedStudent.name}</span>
                  </h4>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {studentHistory.map(tx => (
                      <div key={tx.id} className="p-2.5 bg-[#FDFCFB] border border-[#1A1A1A] flex items-center justify-between text-xs">
                        <div>
                          <p className="font-mono font-bold text-[#1A1A1A] text-[11px]">{tx.receiptNo} • {tx.paymentDate}</p>
                          <p className="text-[10px] text-[#1A1A1A]/70">{tx.remarks} ({tx.paymentSource.toUpperCase()})</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-mono font-bold text-emerald-800">{formatPKR(tx.amountPaid)}</span>
                          <button
                            onClick={() => onOpenReceipt(tx)}
                            className="p-1 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition"
                            title="Print Receipt"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </>
          )}

        </div>

      </div>

    </div>
  );
};
