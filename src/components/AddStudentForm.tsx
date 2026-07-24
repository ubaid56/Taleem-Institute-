import React, { useState, useMemo, useEffect } from 'react';
import { Course, Student, StudentCourseEnrollment, FeeTransaction } from '../types';
import { generateNextStudentId, generateNextReceiptNo, formatPKR } from '../lib/utils';
import { 
  UserPlus, 
  BookOpen, 
  Calculator, 
  CreditCard, 
  CheckCircle2, 
  Camera, 
  Sparkles, 
  FileText,
  User,
  Phone,
  Calendar,
  AlertCircle,
  Upload,
  Percent,
  Tag,
  Image as ImageIcon,
  Printer
} from 'lucide-react';

interface AddStudentFormProps {
  courses: Course[];
  existingStudents: Student[];
  existingTxs: FeeTransaction[];
  onAddStudent: (newStudent: Student, initialTx?: FeeTransaction, shouldPrint?: boolean) => void;
  onCancel?: () => void;
}

export const AddStudentForm: React.FC<AddStudentFormProps> = ({
  courses,
  existingStudents,
  existingTxs,
  onAddStudent,
  onCancel,
}) => {
  // Form Fields
  const [photoUrl, setPhotoUrl] = useState<string>('https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80');
  const [name, setName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dob, setDob] = useState('2005-01-01');
  const [mobileNo, setMobileNo] = useState('');
  const [fatherMobileNo, setFatherMobileNo] = useState('');
  const [cnic, setCnic] = useState('');
  const [fatherCnic, setFatherCnic] = useState('');
  const [admissionDate, setAdmissionDate] = useState(new Date().toISOString().slice(0, 10));

  // Multi-Course Selection
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(
    courses.length > 0 ? [courses[0].id] : []
  );

  // Fee Particulars & Discount
  const [examFeeSem1, setExamFeeSem1] = useState<number>(1500);
  const [examFeeSem2, setExamFeeSem2] = useState<number>(1500);
  const [otherFee, setOtherFee] = useState<number>(0);
  const [otherFeeRemarks, setOtherFeeRemarks] = useState<string>('');
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountRemarks, setDiscountRemarks] = useState<string>('');
  const [payAmountNow, setPayAmountNow] = useState<number>(0);
  const [paymentSource, setPaymentSource] = useState<'cash' | 'bank'>('cash');

  const [errorMsg, setErrorMsg] = useState<string>('');

  // Local Image Upload Handler from PC / Device
  const handleLocalImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Selected image is larger than 5MB. Please choose a smaller photo.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if DIT course is selected
  const isDitSelected = useMemo(() => {
    return selectedCourseIds.some(id => {
      const c = courses.find(course => course.id === id);
      return c?.baseCourseType === 'DIT' || c?.name.toLowerCase().includes('dit');
    });
  }, [selectedCourseIds, courses]);

  // Sync exam fees from selected course settings
  useEffect(() => {
    const firstDit = courses.find(c => selectedCourseIds.includes(c.id) && (c.baseCourseType === 'DIT' || c.name.toLowerCase().includes('dit')));
    if (firstDit) {
      setExamFeeSem1(firstDit.examFeeSem1 ?? 1500);
      setExamFeeSem2(firstDit.examFeeSem2 ?? 1500);
    }
  }, [selectedCourseIds, courses]);

  // Calculate live Total Fee across all selected courses + Discount
  const calculatedFeeSummary = useMemo(() => {
    let grossTotal = 0;
    const enrollments: StudentCourseEnrollment[] = [];

    selectedCourseIds.forEach(id => {
      const course = courses.find(c => c.id === id);
      if (!course) return;

      const isThisDit = course.baseCourseType === 'DIT' || course.name.toLowerCase().includes('dit');
      
      const sem1 = isThisDit ? (Number(course.examFeeSem1) || Number(examFeeSem1) || 0) : 0;
      const sem2 = isThisDit ? (Number(course.examFeeSem2) || Number(examFeeSem2) || 0) : 0;
      const other = Number(otherFee) || 0;

      const courseSubtotal = (course.durationMonths * course.monthlyFee) + course.admissionFee + sem1 + sem2 + other;

      grossTotal += courseSubtotal;

      enrollments.push({
        courseId: course.id,
        courseName: course.name,
        durationMonths: course.durationMonths,
        monthlyFee: course.monthlyFee,
        admissionFee: course.admissionFee,
        examFeeSem1: sem1,
        examFeeSem2: sem2,
        otherFee: other,
        otherFeeRemarks,
        discountAmount: Number(discountAmount) || 0,
        discountRemarks,
        totalCalculatedFee: courseSubtotal,
        enrollmentDate: admissionDate,
      });
    });

    const discount = Math.min(grossTotal, Math.max(0, Number(discountAmount) || 0));
    const netTotal = Math.max(0, grossTotal - discount);

    return { grossTotal, discount, netTotal, enrollments };
  }, [selectedCourseIds, courses, examFeeSem1, examFeeSem2, otherFee, otherFeeRemarks, discountAmount, discountRemarks, admissionDate]);

  const toggleCourseSelection = (courseId: string) => {
    setSelectedCourseIds(prev => {
      if (prev.includes(courseId)) {
        if (prev.length === 1) return prev; // Keep at least 1 course
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  const handleProcessSubmission = (shouldPrint: boolean) => {
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Student Name is required.');
      return;
    }
    if (!fatherName.trim()) {
      setErrorMsg('Father Name is required.');
      return;
    }
    if (!mobileNo.trim()) {
      setErrorMsg('Student Mobile Number is required.');
      return;
    }
    if (selectedCourseIds.length === 0) {
      setErrorMsg('Please select at least one course.');
      return;
    }

    const nextStudentId = generateNextStudentId(existingStudents);
    const paidNow = Number(payAmountNow) || 0;
    const netTotal = calculatedFeeSummary.netTotal;
    const balance = Math.max(0, netTotal - paidNow);

    const newStudent: Student = {
      id: `std-${Date.now()}`,
      studentId: nextStudentId,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      name: name.trim(),
      fatherName: fatherName.trim(),
      gender,
      dob,
      mobileNo: mobileNo.trim(),
      fatherMobileNo: fatherMobileNo.trim() || mobileNo.trim(),
      cnic: cnic.trim() || '17301-0000000-0',
      fatherCnic: fatherCnic.trim() || '17301-0000000-0',
      admissionDate,
      courses: calculatedFeeSummary.enrollments,
      discountTotal: calculatedFeeSummary.discount,
      discountRemarks: discountRemarks.trim() || undefined,
      totalFeeCalculated: netTotal,
      totalFeePaid: paidNow,
      balanceRemaining: balance,
      status: 'active',
      qrCodeData: nextStudentId,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    let initialTx: FeeTransaction | undefined = undefined;

    if (paidNow > 0) {
      const nextReceiptNo = generateNextReceiptNo(existingTxs);
      const discountNote = calculatedFeeSummary.discount > 0 ? ` [Discount Applied: ${formatPKR(calculatedFeeSummary.discount)}]` : '';
      initialTx = {
        id: `tx-${Date.now()}`,
        receiptNo: nextReceiptNo,
        studentId: nextStudentId,
        studentName: newStudent.name,
        fatherName: newStudent.fatherName,
        courseNames: newStudent.courses.map(c => c.courseName),
        paymentDate: `${admissionDate} ${new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`,
        amountPaid: paidNow,
        previousBalance: netTotal,
        remainingBalance: balance,
        paymentSource,
        remarks: `Admission Fee Payment (${paymentSource.toUpperCase()})${discountNote}`,
        collectedByRole: 'accountant',
        collectedByName: 'TIST Accounts Desk',
      };
    }

    onAddStudent(newStudent, initialTx, shouldPrint);
  };

  // Sample Avatar presets
  const avatarSamples = [
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-md max-w-5xl mx-auto text-[#1A1A1A]">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b-2 border-[#1A1A1A] mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl">
            TI
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Student Registration Form</h2>
            <p className="text-[10px] uppercase tracking-widest opacity-70 font-bold">Taleem Institute of Science & Technology • Admission Module</p>
          </div>
        </div>

        <span className="text-xs px-3 py-1 bg-[#F4F2EE] text-[#1A1A1A] border border-[#1A1A1A] font-mono font-bold">
          ROLL ID: <strong className="underline">{generateNextStudentId(existingStudents)}</strong>
        </span>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border-2 border-rose-800 text-rose-900 text-xs font-bold uppercase tracking-wider flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={(e) => { e.preventDefault(); handleProcessSubmission(true); }} className="space-y-8">
        
        {/* SECTION 1: Personal Details */}
        <div>
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold mb-4 pb-1 border-b border-[#1A1A1A] flex items-center space-x-2 text-[#1A1A1A]">
            <User className="w-4 h-4 text-[#1A1A1A]" />
            <span>1. Personal & Contact Details</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            
            {/* Student Photo with PC Upload Support */}
            <div className="md:col-span-3 bg-[#F4F2EE] p-4 border border-[#1A1A1A] flex flex-col md:flex-row items-center space-y-3 md:space-y-0 md:space-x-5">
              <div className="w-24 h-24 bg-white border-2 border-[#1A1A1A] shrink-0 overflow-hidden relative group">
                <img src={photoUrl} alt="Preview" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-[#1A1A1A]" />
                    <span>Student Photo (PC Upload / URL / Preset)</span>
                  </label>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest bg-emerald-100 px-2 py-0.5 border border-emerald-300">
                    PC Upload Enabled
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="cursor-pointer px-4 py-2 bg-[#1A1A1A] hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] inline-flex items-center justify-center space-x-2 shrink-0 transition">
                    <Upload className="w-4 h-4 text-emerald-400" />
                    <span>Upload From PC</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLocalImageUpload} 
                      className="hidden" 
                    />
                  </label>

                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="Or paste photo URL link here"
                      className="w-full bg-white border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-[10px] font-bold uppercase opacity-60">Sample Avatars:</span>
                  {avatarSamples.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoUrl(sample)}
                      className={`w-7 h-7 overflow-hidden border-2 transition ${photoUrl === sample ? 'border-[#1A1A1A] scale-105' : 'border-[#1A1A1A]/30 opacity-60'}`}
                    >
                      <img src={sample} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Student Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muhammad Ali"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

            {/* Father Name */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Father Name *
              </label>
              <input
                type="text"
                required
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Gender *
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              >
                <option value="Male">Male ♂</option>
                <option value="Female">Female ♀</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Date of Birth (DOB)
              </label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

            {/* Mobile No */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Mobile No *
              </label>
              <input
                type="text"
                required
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                placeholder="03481064487"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

            {/* Father Mobile No */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Father Mobile No
              </label>
              <input
                type="text"
                value={fatherMobileNo}
                onChange={(e) => setFatherMobileNo(e.target.value)}
                placeholder="0301-7654321"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

            {/* CNIC */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Student CNIC / B-Form
              </label>
              <input
                type="text"
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="17301-1234567-1"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Father CNIC */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Father CNIC
              </label>
              <input
                type="text"
                value={fatherCnic}
                onChange={(e) => setFatherCnic(e.target.value)}
                placeholder="17301-7654321-3"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
              />
            </div>

            {/* Admission Date */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Admission Date
              </label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
              />
            </div>

          </div>
        </div>

        {/* SECTION 2: Course Selection */}
        <div>
          <div className="flex items-center justify-between mb-3 border-b border-[#1A1A1A] pb-1">
            <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center space-x-2">
              <BookOpen className="w-4 h-4 text-[#1A1A1A]" />
              <span>2. Select Enrolled Course(s) [Multiple Selection]</span>
            </h3>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]">
              Selected: {selectedCourseIds.length} course(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {courses.map(course => {
              const isSelected = selectedCourseIds.includes(course.id);
              const isDit = course.baseCourseType === 'DIT' || course.name.toLowerCase().includes('dit');

              return (
                <div
                  key={course.id}
                  onClick={() => toggleCourseSelection(course.id)}
                  className={`p-3.5 border-2 cursor-pointer transition flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                      : 'bg-[#F4F2EE] border-[#1A1A1A] text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  <div className={`w-5 h-5 border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected ? 'bg-white text-[#1A1A1A] border-white' : 'border-[#1A1A1A] bg-white'
                  }`}>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1A1A1A]" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-[#1A1A1A]'}`}>
                        {course.name}
                      </h4>
                      {isDit && (
                        <span className={`text-[9px] px-1.5 py-0.5 font-bold uppercase border ${
                          isSelected ? 'bg-white text-[#1A1A1A] border-white' : 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                        }`}>
                          DIT
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-1 ${isSelected ? 'text-slate-300' : 'text-[#1A1A1A]/70'}`}>
                      Duration: <strong>{course.durationMonths} Months</strong> • Monthly: <strong className="font-mono">{formatPKR(course.monthlyFee)}</strong>
                    </p>
                    <p className={`text-[10px] ${isSelected ? 'text-slate-400' : 'text-[#1A1A1A]/60'}`}>
                      Admission Fee: {formatPKR(course.admissionFee)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Fee Structure, Discounts & Auto Calculations */}
        <div className="bg-[#F4F2EE] p-5 border-2 border-[#1A1A1A] space-y-4">
          <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#1A1A1A] flex items-center space-x-2 border-b border-[#1A1A1A] pb-1">
            <Calculator className="w-4 h-4 text-[#1A1A1A]" />
            <span>3. Fee Particulars & Concession / Discount</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Show Exam Fees ONLY IF DIT Course is Selected! */}
            {isDitSelected && (
              <>
                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                    Exam Fee 1st Sem (DIT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={examFeeSem1}
                    onChange={(e) => setExamFeeSem1(Number(e.target.value))}
                    className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-mono font-bold"
                  />
                  <p className="text-[9px] text-[#1A1A1A]/60 mt-1 uppercase">1st Sem Board exam fee</p>
                </div>

                <div className="bg-white p-3 border border-[#1A1A1A]">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                    Exam Fee 2nd Sem (DIT)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={examFeeSem2}
                    onChange={(e) => setExamFeeSem2(Number(e.target.value))}
                    className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-mono font-bold"
                  />
                  <p className="text-[9px] text-[#1A1A1A]/60 mt-1 uppercase">2nd Sem Board exam fee</p>
                </div>
              </>
            )}

            {/* Other Fee & Remarks */}
            <div className="bg-white p-3 border border-[#1A1A1A]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Other Fee Amount
              </label>
              <input
                type="number"
                min="0"
                value={otherFee}
                onChange={(e) => setOtherFee(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-mono font-bold"
              />
            </div>

            <div className="bg-white p-3 border border-[#1A1A1A]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Other Fee Remarks
              </label>
              <input
                type="text"
                value={otherFeeRemarks}
                onChange={(e) => setOtherFeeRemarks(e.target.value)}
                placeholder="e.g. Prospectus, Lab Badge"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A]"
              />
            </div>

            {/* DISCOUNT / CONCESSION SECTION */}
            <div className="bg-emerald-50 p-3 border-2 border-emerald-700">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-emerald-700" />
                  Admission Discount / Concession (PKR)
                </span>
                <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-mono font-bold">
                  OFF
                </span>
              </label>
              <input
                type="number"
                min="0"
                max={calculatedFeeSummary.grossTotal}
                value={discountAmount}
                onChange={(e) => setDiscountAmount(Number(e.target.value))}
                placeholder="0"
                className="w-full bg-white border border-emerald-700 px-3 py-1.5 text-xs text-emerald-950 font-mono font-extrabold focus:outline-none"
              />
              <p className="text-[9px] text-emerald-800 font-medium mt-1">Special concession or waiver given during admission</p>
            </div>

            <div className="bg-white p-3 border border-[#1A1A1A] md:col-span-2">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                Discount Concession Remarks
              </label>
              <input
                type="text"
                value={discountRemarks}
                onChange={(e) => setDiscountRemarks(e.target.value)}
                placeholder="e.g. Needys Concession / Staff Reference / Early Bird Special"
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A]"
              />
            </div>

          </div>

          {/* Calculated Grand Total Banner with Discount breakdown */}
          <div className="p-5 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-[10px] text-white uppercase tracking-[0.2em] font-bold">Auto-Calculated Total Payable Course Fee</p>
              <div className="text-xs text-slate-300 font-mono space-x-2">
                <span>Gross Total: <strong>{formatPKR(calculatedFeeSummary.grossTotal)}</strong></span>
                {calculatedFeeSummary.discount > 0 && (
                  <span className="text-emerald-400 font-bold">
                    − Discount: <strong>{formatPKR(calculatedFeeSummary.discount)}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] uppercase tracking-widest text-slate-400">Net Calculated Fee</p>
              <span className="text-3xl font-serif italic font-bold text-emerald-300 font-mono">
                {formatPKR(calculatedFeeSummary.netTotal)}
              </span>
            </div>
          </div>

          {/* SECTION 4: Payment on Admission Date */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="bg-white p-3 border border-[#1A1A1A]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Pay Amount on Admission *
              </label>
              <input
                type="number"
                min="0"
                max={calculatedFeeSummary.netTotal}
                value={payAmountNow}
                onChange={(e) => setPayAmountNow(Number(e.target.value))}
                placeholder="Enter paid amount"
                className="w-full bg-[#FDFCFB] border-2 border-[#1A1A1A] px-3.5 py-2.5 text-sm text-[#1A1A1A] font-mono font-bold focus:outline-none"
              />
            </div>

            <div className="bg-white p-3 border border-[#1A1A1A]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">
                Payment Source *
              </label>
              <select
                value={paymentSource}
                onChange={(e) => setPaymentSource(e.target.value as any)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2.5 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
              >
                <option value="cash">💵 Cash Payment</option>
                <option value="bank">🏦 Bank Transfer / EasyPaisa / JazzCash</option>
              </select>
            </div>

            <div className="bg-white p-3 border border-[#1A1A1A] flex flex-col justify-center">
              <p className="text-[10px] uppercase text-[#1A1A1A] font-bold tracking-wider">Remaining Balance Dues</p>
              <p className="text-xl font-bold text-rose-800 font-mono">
                {formatPKR(Math.max(0, calculatedFeeSummary.netTotal - Number(payAmountNow)))}
              </p>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t-2 border-[#1A1A1A]">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F4F2EE] text-xs font-bold uppercase tracking-wider transition"
            >
              Cancel
            </button>
          )}

          <button
            type="button"
            onClick={() => handleProcessSubmission(false)}
            className="px-5 py-2.5 bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] flex items-center space-x-2 transition shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Submit Only</span>
          </button>

          <button
            type="button"
            onClick={() => handleProcessSubmission(true)}
            className="px-6 py-2.5 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition shadow-sm"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Complete Admission & Thermal Print</span>
          </button>
        </div>

      </form>

    </div>
  );
};

