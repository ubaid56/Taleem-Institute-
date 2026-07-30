import React, { useState } from 'react';
import { Course, OnlineApplication } from '../../types';
import { X, Send, User, Phone, Mail, MapPin, BookOpen, CheckCircle } from 'lucide-react';

interface OnlineApplyModalProps {
  courses: Course[];
  initialCourseId?: string;
  onClose: () => void;
  onSubmitApplication: (app: OnlineApplication) => void;
  showToast: (msg: string) => void;
}

export const OnlineApplyModal: React.FC<OnlineApplyModalProps> = ({
  courses,
  initialCourseId,
  onClose,
  onSubmitApplication,
  showToast,
}) => {
  const activeCourses = courses.filter(c => c.active !== false);

  const [applicantName, setApplicantName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(initialCourseId || activeCourses[0]?.id || '');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !fatherName.trim() || !mobileNo.trim() || !address.trim() || !selectedCourseId) {
      showToast('Please fill in all required fields (Name, Father Name, Mobile, Address & Course).');
      return;
    }

    const selectedCourse = courses.find(c => c.id === selectedCourseId);

    const newApp: OnlineApplication = {
      id: `app-${Date.now()}`,
      applicantName: applicantName.trim(),
      fatherName: fatherName.trim(),
      gender,
      mobileNo: mobileNo.trim(),
      email: email.trim() || undefined,
      address: address.trim(),
      courseId: selectedCourseId,
      courseName: selectedCourse ? selectedCourse.name : 'Unknown Course',
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };

    onSubmitApplication(newApp);
    setIsSubmitted(true);
    showToast('Online admission application submitted successfully!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl border border-emerald-100 max-w-xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-700 p-6 text-white flex justify-between items-start">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-200">Online Admissions 2026</span>
            <h2 className="font-serif italic text-2xl font-bold mt-1">Apply Online for Admission</h2>
            <p className="text-xs text-emerald-100 mt-1">Fill in the application form below. Our admissions office will contact you on WhatsApp/Phone.</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="font-serif italic text-2xl font-bold text-slate-900">Application Submitted!</h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you <strong>{applicantName}</strong>! Your application for admission has been received. Our team will review your application and reach out to you at <strong>{mobileNo}</strong>.
            </p>
            <div className="pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm shadow-md transition-all"
              >
                Close & Return to Website
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Course Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>Select Course *</span>
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium text-slate-800 bg-slate-50"
              >
                {activeCourses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.durationMonths} Months • Monthly Fee: PKR {c.monthlyFee || c.totalCourseFee})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Applicant Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Student Full Name *</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                />
              </div>

              {/* Father Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Father / Guardian Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Khan"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Gender */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender *
                </label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800 bg-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Mobile No */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Mobile / WhatsApp No *</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 03481064487"
                  value={mobileNo}
                  onChange={(e) => setMobileNo(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>Email Address (Optional)</span>
              </label>
              <input
                type="email"
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              />
            </div>

            {/* Address Field (EXPLICITLY REQUESTED BY USER!) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Home / Postal Address *</span>
              </label>
              <textarea
                required
                rows={2}
                placeholder="Street address, Village/Town, City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
              ></textarea>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-semibold text-sm shadow-md flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Submit Application</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
