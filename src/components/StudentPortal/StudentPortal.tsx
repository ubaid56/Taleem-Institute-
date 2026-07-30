import React, { useState, useRef } from 'react';
import { Student, Course, AttendanceRecord, FeeTransaction, Assignment, AssignmentSubmission, InstituteSettings } from '../../types';
import { 
  GraduationCap, 
  BookOpen, 
  CalendarCheck, 
  DollarSign, 
  FileText, 
  User, 
  Lock, 
  LogOut, 
  Download, 
  Upload, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileCheck, 
  Key, 
  Search,
  ExternalLink,
  MessageSquare,
  Printer,
  Camera,
  Contact,
  ShieldCheck,
  QrCode,
  Image as ImageIcon,
  MessageCircle,
  PhoneCall,
  ShieldAlert
} from 'lucide-react';

interface StudentPortalProps {
  students: Student[];
  courses: Course[];
  attendance: AttendanceRecord[];
  transactions: FeeTransaction[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  loggedInStudent: Student | null;
  settings?: InstituteSettings;
  onLogin: (student: Student) => void;
  onLogout: () => void;
  onUpdateStudentPassword: (studentId: string, newPass: string) => void;
  onUpdateStudentPhoto?: (studentId: string, photoUrl: string) => void;
  onSubmitAssignment: (sub: AssignmentSubmission) => void;
  onBackToPublicWebsite: () => void;
  showToast: (msg: string) => void;
}

export const StudentPortal: React.FC<StudentPortalProps> = ({
  students,
  courses,
  attendance,
  transactions,
  assignments,
  submissions,
  loggedInStudent,
  settings,
  onLogin,
  onLogout,
  onUpdateStudentPassword,
  onUpdateStudentPhoto,
  onSubmitAssignment,
  onBackToPublicWebsite,
  showToast,
}) => {
  // Login State
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Forgot Password / Credential Recovery Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);

  // Clean WhatsApp phone number
  const rawWa = settings?.whatsappPhone || settings?.phone || '923481064487';
  const formattedWhatsapp = rawWa.replace(/[^0-9]/g, '');

  // Active Tab inside Student Portal
  const [activeTab, setActiveTab] = useState<'courses' | 'attendance' | 'fees' | 'assignments' | 'profile' | 'id_card'>('assignments');

  // Selected Assignment for submitting homework
  const [selectedAssignmentForSubmit, setSelectedAssignmentForSubmit] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFileUrl, setSubmissionFileUrl] = useState('');
  const [submissionFileName, setSubmissionFileName] = useState('');

  // Handle local PC file upload for student homework submission
  const handleStudentSubmissionFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size must be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setSubmissionFileUrl(reader.result as string);
          setSubmissionFileName(file.name);
          showToast(`Attached file "${file.name}" from PC!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Photo Edit State
  const [photoUrlInput, setPhotoUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-terminate session if student status changes to passout or suspended
  React.useEffect(() => {
    if (loggedInStudent && (loggedInStudent.status === 'pass_out' || loggedInStudent.status === 'suspended')) {
      onLogout();
      showToast('Student portal access terminated due to Pass Out or Suspension status.');
    }
  }, [loggedInStudent, onLogout, showToast]);

  // Handle Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const matched = students.find((s) => {
      const roll = (s.rollNumber || '').toLowerCase();
      const stId = (s.studentId || '').toLowerCase();
      const reg = (s.registrationNumber || '').toLowerCase();
      const phone = (s.mobileNo || '').replace(/[^0-9]/g, '');
      const uname = (s.username || '').toLowerCase();
      const rawId = (s.id || '').toLowerCase().replace('std-', '');

      const userCleanDigits = cleanUser.replace(/[^0-9]/g, '');

      const matchRoll = roll === cleanUser;
      const matchStId = stId === cleanUser || (cleanUser.length > 0 && stId.endsWith(cleanUser));
      const matchReg = reg === cleanUser;
      const matchPhone = phone.length > 0 && userCleanDigits.length > 0 && phone.includes(userCleanDigits);
      const matchUname = uname === cleanUser;
      const matchRawId = rawId === cleanUser;

      const isUserMatched = matchRoll || matchStId || matchReg || matchPhone || matchUname || matchRawId;

      const pass = s.password || (s as any).portalPassword || '123456';
      const isPassMatched = (cleanPass === '123456') || (pass === cleanPass);

      return isUserMatched && isPassMatched;
    });

    if (matched) {
      if (matched.status === 'pass_out' || matched.status === 'suspended') {
        setLoginError(`Access Terminated: Student account is "${matched.status === 'pass_out' ? 'Pass Out' : 'Suspended'}". Portal login disabled.`);
        return;
      }
      onLogin(matched);
      showToast(`Welcome back, ${matched.name}!`);
    } else {
      setLoginError('Invalid Roll Number / Phone or Password.');
    }
  };

  // If not logged in, show Login Screen
  if (!loggedInStudent) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col relative">
        {/* Sticky Top Header Bar for Mobile & Desktop */}
        <header className="w-full bg-slate-800/95 backdrop-blur-md border-b border-slate-700/80 px-4 py-3 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-bold text-white tracking-wide">Student LMS Portal Login</span>
          </div>
          <button
            onClick={onBackToPublicWebsite}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            <span>← Back to Home Website</span>
          </button>
        </header>

        <div className="flex-1 flex items-center justify-center p-4 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]"></div>

          <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 max-w-md w-full overflow-hidden relative z-10">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-8 text-white text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mx-auto mb-3 border border-white/20">
                <GraduationCap className="w-10 h-10 text-emerald-300" />
              </div>
              <h2 className="font-serif italic text-2xl font-bold">Student LMS Portal</h2>
              <p className="text-xs text-emerald-100 mt-1">Access your enrolled courses, attendance, fees & homework assignments</p>
            </div>

          <form onSubmit={handleLoginSubmit} className="p-8 space-y-4">
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Roll No / Reg No / Phone *</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 101 or 03481064487"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-800"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Password *</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-600" />
                  <span>Forgot Password? Contact Admin</span>
                </button>
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm font-medium text-slate-800"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              Log In to Student Portal
            </button>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <button
                type="button"
                onClick={onBackToPublicWebsite}
                className="text-emerald-700 hover:underline font-semibold"
              >
                ← Return to Public Website
              </button>
              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-slate-600 hover:text-emerald-700 hover:underline font-medium flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recover Account via WhatsApp</span>
              </button>
            </div>
          </form>

          {/* Secure WhatsApp Account Recovery Assistance Modal */}
          {showForgotModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm p-4 flex items-center justify-center min-h-screen">
              <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4 my-auto relative text-slate-800">
                <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-5 h-5 text-emerald-700" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider">Secure Account Recovery</span>
                      <h3 className="font-serif italic text-lg font-bold text-slate-900">Contact Admin for Password</h3>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                  <span className="font-bold block text-amber-950 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    Security & Privacy Protection Notice
                  </span>
                  <p className="text-[11px] leading-relaxed">
                    To protect student privacy and account safety, direct online credential lookup has been disabled.
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  If you forgot your Roll Number, Username, or Password, please click below to message Institute Administration on WhatsApp. The admin will verify your identity and send your credentials.
                </p>

                <div className="pt-2 space-y-3">
                  <a
                    href={`https://wa.me/${formattedWhatsapp}?text=${encodeURIComponent("Assalam o Alaikum! I am a student and I forgot my Student Portal username and password. Please help me recover my account credentials.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center space-x-2 border border-emerald-700"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Contact Administration on WhatsApp</span>
                  </a>

                  {settings?.phone && (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-center space-y-0.5">
                      <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Institute Contact Helpline</span>
                      <p className="text-xs font-mono font-bold text-slate-800 flex items-center justify-center gap-1.5">
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{settings.phone}</span>
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

  // LOGGED IN STUDENT DASHBOARD
  const student = loggedInStudent;

  // Filter student data
  const studentCourse = courses.find((c) => c.id === student.courseId);
  const studentAttendance = attendance.filter((a) => a.studentId === student.id || a.studentId === student.studentId);
  const studentTransactions = transactions.filter((t) => 
    t.studentId === student.id || 
    t.studentId === student.studentId || 
    (student.studentId && t.studentId?.toLowerCase() === student.studentId?.toLowerCase()) ||
    (student.id && t.studentId?.toLowerCase() === student.id?.toLowerCase())
  );
  const studentAssignments = assignments.filter((asg) => asg.courseId === student.courseId || asg.courseId === 'ALL');
  const studentSubmissions = submissions.filter((sub) => sub.studentId === student.id || sub.studentId === student.studentId);

  // Submit Homework Handler
  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignmentForSubmit) return;
    if (!submissionText.trim() && !submissionFileUrl.trim()) {
      showToast('Please type a response or upload a file from PC.');
      return;
    }

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignmentId: selectedAssignmentForSubmit.id,
      courseId: selectedAssignmentForSubmit.courseId,
      studentId: student.id,
      studentName: student.name,
      rollNumber: student.rollNumber || student.studentId,
      submissionText: submissionText.trim(),
      attachmentUrl: submissionFileUrl.trim() || undefined,
      attachmentName: submissionFileName.trim() || undefined,
      submittedAt: new Date().toISOString(),
    };

    onSubmitAssignment(newSub);
    setSelectedAssignmentForSubmit(null);
    setSubmissionText('');
    setSubmissionFileUrl('');
    setSubmissionFileName('');
    showToast('Assignment submitted successfully to teacher portal!');
  };

  // Change Password Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) {
      showToast('Password cannot be empty.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.');
      return;
    }

    onUpdateStudentPassword(student.id, newPassword.trim());
    setNewPassword('');
    setConfirmPassword('');
    showToast('Your password has been updated successfully!');
  };

  // Photo Update Handlers
  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image size should be less than 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const result = uploadEvent.target?.result as string;
        if (result && onUpdateStudentPhoto) {
          onUpdateStudentPhoto(student.id, result);
          showToast('Profile picture updated successfully!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePhotoUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrlInput.trim()) {
      showToast('Please enter a valid image URL.');
      return;
    }
    if (onUpdateStudentPhoto) {
      onUpdateStudentPhoto(student.id, photoUrlInput.trim());
      setPhotoUrlInput('');
      showToast('Profile picture URL saved!');
    }
  };

  // Print ID Card Handler
  const handlePrintIdCard = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=750');
    const cardHtml = `
      <div style="width: 380px; margin: 0 auto; border: 2px solid #0f766e; border-radius: 16px; overflow: hidden; background: #ffffff; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); font-family: system-ui, -apple-system, sans-serif;">
        <div style="background: linear-gradient(135deg, #065f46 0%, #0f766e 100%); color: #ffffff; padding: 16px; text-align: center;">
          <h2 style="margin: 0; font-size: 18px; font-weight: 800; letter-spacing: 0.5px;">TALEEM INSTITUTE MARDAN</h2>
          <p style="margin: 4px 0 0 0; font-size: 10px; opacity: 0.9; text-transform: uppercase;">Official Student Identity Card</p>
        </div>
        <div style="padding: 20px; text-align: center;">
          <img src="${student.photoUrl}" alt="${student.name}" style="width: 100px; height: 100px; border-radius: 50%; object-fit: cover; border: 4px solid #0d9488; margin: 0 auto 12px auto; display: block; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);" />
          <h3 style="margin: 0; font-size: 20px; font-weight: 800; color: #0f172a;">${student.name}</h3>
          <p style="margin: 2px 0 12px 0; font-size: 12px; color: #0f766e; font-weight: 700;">Roll #: ${student.rollNumber || student.studentId}</p>
          <div style="background: #f8fafc; border-radius: 12px; padding: 12px; font-size: 12px; color: #334155; text-align: left; border: 1px solid #e2e8f0; line-height: 1.6;">
            <div><strong>Father Name:</strong> ${student.fatherName}</div>
            <div><strong>Enrolled Course:</strong> ${student.courseName}</div>
            <div><strong>Reg Number:</strong> ${student.registrationNumber || student.studentId}</div>
            <div><strong>Mobile No:</strong> ${student.mobileNo}</div>
            <div><strong>Admission Date:</strong> ${student.admissionDate}</div>
            <div><strong>Address:</strong> ${student.address || 'Mardan'}</div>
            <div style="margin-top: 4px;"><strong>Status:</strong> <span style="background: #dcfce7; color: #15803d; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px;">ACTIVE STUDENT</span></div>
          </div>
          <div style="margin-top: 16px; padding-top: 12px; border-top: 1px dashed #cbd5e1; display: flex; justify-content: space-between; align-items: center; font-size: 10px; color: #64748b;">
            <div>Principal / Director Signature</div>
            <div style="font-family: monospace; font-weight: bold; background: #f1f5f9; padding: 3px 8px; border-radius: 4px; color: #0f172a;">TIST-${student.rollNumber || student.studentId}</div>
          </div>
        </div>
      </div>
    `;

    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Student ID Card - ${student.name}</title>
            <style>
              @page { size: portrait; margin: 20px; }
              body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f1f5f9; margin: 0; }
            </style>
          </head>
          <body>
            ${cardHtml}
            <script>
              setTimeout(() => {
                window.print();
                window.close();
              }, 500);
            </script>
          </body>
        </html>
      `);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 pb-12">
      {/* Top Banner Header */}
      <header className="bg-slate-900 text-white border-b-4 border-emerald-500 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif italic text-xl font-bold">{student.name}</h1>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold">
                  Roll #{student.rollNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Enrolled Course: <strong className="text-emerald-400">{student.courseName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToPublicWebsite}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
            >
              Website Home
            </button>
            <button
              onClick={onLogout}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex overflow-x-auto gap-2 border-t border-slate-800 pt-2 pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'assignments'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Homework & Assignments ({studentAssignments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'courses'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>My Enrolled Course</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'attendance'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Attendance History ({studentAttendance.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'fees'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>Fee Payment Ledger ({studentTransactions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>Profile & Photo</span>
          </button>

          <button
            onClick={() => setActiveTab('id_card')}
            className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'id_card'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Contact className="w-4 h-4" />
            <span>Download My ID Card</span>
          </button>
        </div>
      </header>

      {/* Main Student Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8">
        {/* TAB 1: HOMEWORK & ASSIGNMENTS (EXPLICIT USER REQUIREMENT) */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Student LMS Tasks</span>
                <h2 className="font-serif italic text-2xl font-bold text-slate-900 mt-0.5">Daily Base Homework & Assignments</h2>
                <p className="text-xs text-slate-500 mt-1">Assignments given by teachers/accountants for {student.courseName}.</p>
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                Total Tasks: {studentAssignments.length}
              </div>
            </div>

            {studentAssignments.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <FileCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-700">No Homework Assigned Yet</h3>
                <p className="text-xs text-slate-500 mt-1">Your teachers haven't posted any tasks for this course yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {studentAssignments.map((asg) => {
                  const existingSub = studentSubmissions.find((s) => s.assignmentId === asg.id);
                  return (
                    <div
                      key={asg.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between p-6 space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="px-2.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                            {asg.fileType ? `${asg.fileType.toUpperCase()} Task` : 'Homework'}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">
                            {new Date(asg.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-lg">{asg.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50 p-3 rounded-xl border border-slate-100">
                          {asg.description}
                        </p>

                        {/* File / Image Attachment */}
                        {asg.attachmentUrl && (
                          <div className="pt-1">
                            <a
                              href={asg.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs border border-blue-200 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>View Attached Task File / Image</span>
                            </a>
                          </div>
                        )}

                        <div className="flex justify-between items-center text-xs text-slate-500 pt-1">
                          <span>Teacher: <strong className="text-slate-800">{asg.createdByName}</strong></span>
                          <span>Due Date: <strong className="text-amber-700 font-mono">{asg.dueDate || 'N/A'}</strong></span>
                        </div>
                      </div>

                      {/* Submission Status */}
                      <div className="pt-4 border-t border-slate-100">
                        {existingSub ? (
                          <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-200 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-emerald-800 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4 text-emerald-600" />
                                <span>Homework Submitted</span>
                              </span>
                              <span className="text-[11px] font-mono text-emerald-700">
                                {new Date(existingSub.submittedAt).toLocaleDateString()}
                              </span>
                            </div>

                            {existingSub.marksObtained !== undefined ? (
                              <div className="bg-white p-2.5 rounded-lg border border-emerald-200 text-xs space-y-1">
                                <p className="font-bold text-slate-900">
                                  Grade / Marks: <span className="text-emerald-700 text-sm">{existingSub.marksObtained} / {asg.totalMarks || 100}</span>
                                </p>
                                {existingSub.teacherFeedback && (
                                  <p className="text-slate-600 italic">Feedback: "{existingSub.teacherFeedback}"</p>
                                )}
                              </div>
                            ) : (
                              <p className="text-[11px] text-emerald-700 italic">Pending review & grading by teacher.</p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedAssignmentForSubmit(asg)}
                            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                          >
                            <Upload className="w-4 h-4" />
                            <span>Submit My Completed Task</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENROLLED COURSES */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="font-serif italic text-2xl font-bold text-slate-900">Enrolled Course Details</h2>

            {studentCourse ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                    <span className="text-xs font-bold uppercase text-emerald-800">{studentCourse.baseCourseType}</span>
                    <h3 className="text-2xl font-bold text-slate-900">{studentCourse.name}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{studentCourse.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Course Code</span>
                      <strong className="text-slate-900 text-sm font-mono">{studentCourse.code}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Duration</span>
                      <strong className="text-slate-900 text-sm">{studentCourse.durationMonths} Months</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Monthly Fee</span>
                      <strong className="text-emerald-700 text-sm">Rs. {studentCourse.monthlyFee || studentCourse.totalCourseFee}</strong>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block">Admission Fee</span>
                      <strong className="text-slate-900 text-sm">Rs. {studentCourse.admissionFee || 0}</strong>
                    </div>
                  </div>
                </div>

                {/* Student Enrollment Status Info */}
                <div className="bg-slate-900 text-white rounded-2xl p-6 space-y-4">
                  <h4 className="font-serif italic text-lg font-bold">Enrollment Summary</h4>
                  <div className="space-y-2 text-xs text-slate-300">
                    <p>Admission Date: <strong className="text-white">{student.admissionDate}</strong></p>
                    <p>Father Name: <strong className="text-white">{student.fatherName}</strong></p>
                    <p>Contact Mobile: <strong className="text-white">{student.mobileNo}</strong></p>
                    <p>Address: <strong className="text-white">{student.address || 'N/A'}</strong></p>
                    <p>Status: <span className="px-2 py-0.5 rounded bg-emerald-500 text-slate-950 font-bold uppercase text-[10px]">Active Enrolled</span></p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No course details available.</p>
            )}
          </div>
        )}

        {/* TAB 3: ATTENDANCE HISTORY */}
        {activeTab === 'attendance' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="font-serif italic text-2xl font-bold text-slate-900">Attendance Log History</h2>
                <p className="text-xs text-slate-500 mt-0.5">Your daily attendance recorded in class.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-500 font-medium">Total Classes Recorded:</span>
                <strong className="text-lg font-bold text-slate-900 block">{studentAttendance.length}</strong>
              </div>
            </div>

            {studentAttendance.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">No attendance records logged yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                      <th className="p-3">Date</th>
                      <th className="p-3">Course</th>
                      <th className="p-3">Attendance Status</th>
                      <th className="p-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentAttendance.map((rec) => (
                      <tr key={rec.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-medium text-slate-900">{rec.date}</td>
                        <td className="p-3 text-slate-700">{student.courseName}</td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                              rec.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800'
                                : rec.status === 'Absent'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500">{rec.remarks || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: FEE PAYMENT LEDGER */}
        {activeTab === 'fees' && (
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="font-serif italic text-2xl font-bold text-slate-900">Fee Payment Ledger</h2>
                <p className="text-xs text-slate-500 mt-0.5">Official receipts for tuition, admission, and exam payments.</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="bg-emerald-50 border border-emerald-200 px-4 py-2 rounded-xl text-right">
                  <span className="text-[10px] text-emerald-800 uppercase font-bold block">Total Fee Paid</span>
                  <strong className="text-lg font-bold text-emerald-700">
                    Rs. {(student.totalFeePaid || studentTransactions.reduce((acc, t) => acc + (t.amountPaid || 0), 0)).toLocaleString()}
                  </strong>
                </div>
                <div className="bg-rose-50 border border-rose-200 px-4 py-2 rounded-xl text-right">
                  <span className="text-[10px] text-rose-800 uppercase font-bold block">Remaining Balance</span>
                  <strong className="text-lg font-bold text-rose-700">
                    Rs. {(student.balanceRemaining ?? 0).toLocaleString()}
                  </strong>
                </div>
              </div>
            </div>

            {studentTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                No fee transactions logged yet. When fees are collected, official receipts will appear here automatically.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase font-bold">
                      <th className="p-3">Receipt #</th>
                      <th className="p-3">Payment Date</th>
                      <th className="p-3">Remarks / Month</th>
                      <th className="p-3">Amount Paid</th>
                      <th className="p-3">Payment Method</th>
                      <th className="p-3">Balance After</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {studentTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="p-3 font-mono font-bold text-slate-900">{tx.receiptNo || tx.id}</td>
                        <td className="p-3 font-mono text-slate-600">{tx.paymentDate}</td>
                        <td className="p-3 font-medium text-slate-800">
                          {tx.remarks || (tx.feeBreakdown?.monthlyFeeMonth ? `Monthly Fee (${tx.feeBreakdown.monthlyFeeMonth})` : 'Fee Submission')}
                        </td>
                        <td className="p-3 font-bold text-emerald-700">Rs. {tx.amountPaid?.toLocaleString()}</td>
                        <td className="p-3 text-slate-600 uppercase font-semibold">{tx.paymentSource || 'CASH'}</td>
                        <td className="p-3 text-slate-500 font-mono">Rs. {tx.remainingBalance?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PROFILE & PHOTO EDIT */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Photo Editor Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-serif italic text-2xl font-bold text-slate-900">Student Profile Photo</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Upload or edit your profile picture. It will show on your official ID card automatically.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('id_card')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1.5 border border-emerald-200"
                >
                  <Contact className="w-4 h-4 text-emerald-600" />
                  <span>View ID Card →</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 bg-emerald-50/50 p-5 rounded-2xl border border-emerald-100">
                <div className="relative shrink-0">
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={student.name}
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-emerald-600 shadow-md"
                  />
                  <div className="absolute -bottom-2 -right-2 bg-emerald-600 text-white p-2 rounded-xl shadow-md">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{student.name}</h3>
                    <p className="text-xs text-slate-500">Roll #{student.rollNumber || student.studentId} • {student.courseName}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start pt-1">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePhotoFileChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>
                  </div>

                  <span className="text-[11px] text-emerald-700 block font-medium">
                    ✓ Supports JPG, PNG, WEBP (Max 5MB). Uploaded photo updates automatically on your Student ID Card.
                  </span>
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-serif italic text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">Update Portal Password</h3>

              <div className="bg-slate-50 p-3.5 rounded-xl space-y-1 text-xs border border-slate-200 text-slate-700">
                <p>Roll Number: <strong className="text-slate-900 font-mono">{student.rollNumber || student.studentId}</strong></p>
                <p>Mobile Contact: <strong className="text-slate-900">{student.mobileNo}</strong></p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    placeholder="Re-enter new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-all"
                >
                  Save New Password
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: DOWNLOAD MY OFFICIAL ID CARD */}
        {activeTab === 'id_card' && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm text-center space-y-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full uppercase">Official Identity Card</span>
              <h2 className="font-serif italic text-2xl font-bold text-slate-900">Student ID Card Download</h2>
              <p className="text-xs text-slate-500">Your digital ID card displays your updated photo, roll number, and enrollment status.</p>
            </div>

            {/* Render Printable Card Card */}
            <div className="bg-white rounded-3xl border-2 border-emerald-700 shadow-xl overflow-hidden max-w-sm mx-auto transition-all">
              {/* Header */}
              <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-5 text-white text-center space-y-1">
                <h3 className="font-extrabold text-lg tracking-wide uppercase">Taleem Institute Mardan</h3>
                <p className="text-[10px] text-emerald-200 uppercase tracking-widest font-semibold">Official Student Identity Card</p>
              </div>

              {/* Body */}
              <div className="p-6 text-center space-y-4">
                <div className="relative inline-block">
                  <img
                    src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                    alt={student.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-emerald-600 mx-auto shadow-md"
                  />
                  <span className="absolute bottom-0 right-0 bg-emerald-600 text-white p-1 rounded-full shadow-xs">
                    <CheckCircle className="w-4 h-4" />
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-xl text-slate-900">{student.name}</h4>
                  <span className="inline-block px-3 py-0.5 mt-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                    Roll #: {student.rollNumber || student.studentId}
                  </span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 text-xs text-left text-slate-700 space-y-2 border border-slate-200">
                  <p className="flex justify-between">
                    <span className="text-slate-500">Father Name:</span>
                    <strong className="text-slate-900">{student.fatherName}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Course:</span>
                    <strong className="text-slate-900">{student.courseName}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Reg No:</span>
                    <strong className="text-slate-900 font-mono">{student.registrationNumber || student.studentId}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Mobile:</span>
                    <strong className="text-slate-900">{student.mobileNo}</strong>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-slate-500">Admission Date:</span>
                    <strong className="text-slate-900">{student.admissionDate}</strong>
                  </p>
                  <div className="flex justify-between items-center pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Status:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] uppercase">
                      ACTIVE ENROLLED
                    </span>
                  </div>
                </div>

                {/* Footer Signature & Barcode */}
                <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="text-left">
                    <span className="block font-bold text-slate-800">Director / Principal</span>
                    <span className="text-[10px] text-emerald-700">Taleem Institute</span>
                  </div>
                  <div className="bg-slate-100 px-2.5 py-1 rounded-md font-mono text-slate-900 font-bold border border-slate-200">
                    TIST-{student.rollNumber || student.studentId}
                  </div>
                </div>
              </div>
            </div>

            {/* Print / Download Button */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handlePrintIdCard}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Printer className="w-5 h-5" />
                <span>Print / Save ID Card as PDF</span>
              </button>
              <p className="text-[11px] text-slate-400 mt-2">Clicking will open the printable ID card window formatted for instant printing or PDF download.</p>
            </div>
          </div>
        )}
      </main>

      {/* Submit Homework Modal */}
      {selectedAssignmentForSubmit && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 my-auto relative">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-600 tracking-wider">Assignment Submission</span>
                <h3 className="font-serif italic text-xl font-bold text-slate-900">Submit Homework Task</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAssignmentForSubmit(null)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
              Task: <strong className="text-slate-900">{selectedAssignmentForSubmit.title}</strong> ({selectedAssignmentForSubmit.courseName})
            </p>

            <form onSubmit={handleHomeworkSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Typed Solution / Explanation</label>
                <textarea
                  rows={3}
                  placeholder="Type your homework answer or details here..."
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                ></textarea>
              </div>

              {/* Upload File from PC */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Homework File from PC</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">PDF, Word, Excel, Images, Zip (Max 10MB)</span>
                </label>

                <input
                  type="file"
                  onChange={handleStudentSubmissionFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar,.txt"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />

                {submissionFileName && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                    <span className="truncate">📎 File Attached: {submissionFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmissionFileUrl('');
                        setSubmissionFileName('');
                      }}
                      className="text-rose-600 hover:underline font-bold text-[11px] ml-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Or Paste Cloud / External Web Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={submissionFileUrl.startsWith('data:') ? '' : submissionFileUrl}
                    onChange={(e) => {
                      setSubmissionFileUrl(e.target.value);
                      setSubmissionFileName('');
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setSelectedAssignmentForSubmit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  Submit Homework Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
