import React from 'react';
import { Student, Course, FeeTransaction, UserRole, StaffUser } from '../types';
import { formatPKR } from '../lib/utils';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { 
  Users, 
  GraduationCap, 
  UserX, 
  BookOpen, 
  DollarSign, 
  UserPlus, 
  Receipt, 
  QrCode, 
  ArrowUpRight, 
  CheckCircle2, 
  Building2,
  TrendingUp,
  Award,
  Tag
} from 'lucide-react';

interface DashboardProps {
  students: Student[];
  courses: Course[];
  transactions: FeeTransaction[];
  currentRole: UserRole;
  userPermissions?: StaffUser['permissions'];
  onNavigate: (tab: any) => void;
  onOpenReceipt: (tx: FeeTransaction) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  students,
  courses,
  transactions,
  currentRole,
  userPermissions,
  onNavigate,
  onOpenReceipt,
}) => {
  // Key Metrics
  const activeStudents = students.filter(s => s.status === 'active');
  const totalActiveCount = activeStudents.length;

  const boysCount = activeStudents.filter(s => s.gender === 'Male').length;
  const girlsCount = activeStudents.filter(s => s.gender === 'Female').length;

  const passOutCount = students.filter(s => s.status === 'pass_out').length;
  const suspendedCount = students.filter(s => s.status === 'suspended').length;

  // Students in "Other" category
  const otherCategoryStudents = activeStudents.filter(s =>
    s.courses.some(sc => {
      const c = courses.find(cr => cr.id === sc.courseId);
      return c?.baseCourseType === 'Other' || (sc.courseName ? sc.courseName.toLowerCase().includes('other') : false);
    })
  );
  const otherCategoryCount = otherCategoryStudents.length;

  // Today's fee collection
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayTransactions = transactions.filter(t => t.paymentDate.startsWith(todayStr));
  const todayFeeCollection = todayTransactions.reduce((sum, t) => sum + t.amountPaid, 0);

  // Total Outstanding Dues
  const totalDuesRemaining = activeStudents.reduce((sum, s) => sum + s.balanceRemaining, 0);

  // Course wise breakdown for active students
  const courseBreakdownData = courses.map(course => {
    const enrolledCount = activeStudents.filter(s => 
      s.courses.some(c => c.courseId === course.id)
    ).length;

    return {
      name: course.name.split(' ')[0], // short label
      fullName: course.name,
      students: enrolledCount,
      type: course.baseCourseType,
    };
  });

  // Gender Chart Data
  const genderData = [
    { name: 'Boys ♂', value: boysCount, color: '#0284c7' },
    { name: 'Girls ♀', value: girlsCount, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-sky-500/10 via-blue-50/70 to-indigo-50/50 border-2 border-sky-600/30 p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-sky-400/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 bg-sky-600 text-white rounded-md shadow-xs shadow-sky-500/20">
                ADMINISTRATION DASHBOARD
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-sky-900 opacity-80">Taleem Institute System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 mt-1 tracking-tight">
              Welcome to Taleem Institute of Science & Technology
            </h2>
            <p className="text-xs uppercase tracking-wider font-semibold text-slate-600 mt-1">
              Director / Owner: <strong className="text-sky-900 underline decoration-sky-400">Ubaid Ahmad</strong> • Real-time Institute Management Ledger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(currentRole === 'super_admin' || currentRole === 'accountant' || !!userPermissions?.canAddStudent) && (
              <button
                onClick={() => onNavigate('add_student')}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition shadow-sm shadow-sky-600/30"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Admission</span>
              </button>
            )}

            {(currentRole === 'super_admin' || currentRole === 'accountant' || !!userPermissions?.canSubmitFee) && (
              <button
                onClick={() => onNavigate('submit_fee')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition shadow-sm shadow-emerald-600/30"
              >
                <Receipt className="w-4 h-4" />
                <span>Submit Fee</span>
              </button>
            )}

            {(currentRole === 'super_admin' || currentRole === 'teacher' || !!userPermissions?.canTakeAttendance) && (
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center space-x-2 transition shadow-sm shadow-indigo-600/30"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Attendance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
        
        {/* Total Active Students */}
        <div className="bg-gradient-to-br from-sky-50 to-blue-100/70 border-2 border-sky-400/80 p-4 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-sky-800">
            <span className="text-[10px] font-bold uppercase tracking-widest text-sky-900">Total Active</span>
            <Users className="w-4 h-4 text-sky-600" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-sky-950">{totalActiveCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-sky-700 bg-sky-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Enrolled
            </span>
          </div>
        </div>

        {/* Other Category Students */}
        <div 
          onClick={() => onNavigate('student_directory')}
          className="bg-gradient-to-br from-purple-50 to-indigo-100/70 border-2 border-purple-400/80 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-md transition shadow-xs"
        >
          <div className="flex items-center justify-between text-purple-900">
            <span className="text-[10px] font-bold uppercase tracking-widest">Other Category</span>
            <Tag className="w-4 h-4 text-purple-700" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-purple-950">{otherCategoryCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-purple-700 bg-purple-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Custom / Other
            </span>
          </div>
        </div>

        {/* Boys Count */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-100/70 border-2 border-blue-400/80 p-4 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-blue-900">
            <span className="text-[10px] font-bold uppercase tracking-widest">Boys ♂</span>
            <div className="w-2.5 h-2.5 bg-blue-600 rounded-sm"></div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-blue-950">{boysCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-blue-700 bg-blue-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Male Students
            </span>
          </div>
        </div>

        {/* Girls Count */}
        <div className="bg-gradient-to-br from-pink-50 to-rose-100/70 border-2 border-pink-400/80 p-4 rounded-2xl flex flex-col justify-between shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-pink-900">
            <span className="text-[10px] font-bold uppercase tracking-widest">Girls ♀</span>
            <div className="w-2.5 h-2.5 bg-pink-500 rounded-full"></div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-pink-950">{girlsCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-pink-700 bg-pink-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Female Students
            </span>
          </div>
        </div>

        {/* Pass Out Students */}
        <div 
          onClick={() => onNavigate('pass_out')}
          className="bg-gradient-to-br from-emerald-50 to-teal-100/70 border-2 border-emerald-400/80 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-md transition shadow-xs"
        >
          <div className="flex items-center justify-between text-emerald-900">
            <span className="text-[10px] font-bold uppercase tracking-widest">Pass Out</span>
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-emerald-950">{passOutCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Graduated
            </span>
          </div>
        </div>

        {/* Suspended Students */}
        <div 
          onClick={() => onNavigate('suspended')}
          className="bg-gradient-to-br from-rose-50 to-red-100/70 border-2 border-rose-400/80 p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:shadow-md transition shadow-xs"
        >
          <div className="flex items-center justify-between text-rose-900">
            <span className="text-[10px] font-bold uppercase tracking-widest">Suspended</span>
            <UserX className="w-4 h-4 text-rose-700" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-display font-black text-rose-950">{suspendedCount}</p>
            <span className="inline-block mt-1 text-[9px] uppercase font-bold text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-full tracking-wider">
              Inactive
            </span>
          </div>
        </div>

        {/* Today's Fee Collection */}
        <div 
          onClick={() => onNavigate('fee_records')}
          className="bg-gradient-to-br from-slate-900 via-sky-950 to-blue-900 border-2 border-sky-400 text-white p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:scale-[1.02] transition shadow-md"
        >
          <div className="flex items-center justify-between text-sky-300">
            <span className="text-[10px] font-bold uppercase tracking-widest">Today's Fee</span>
            <TrendingUp className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-mono font-black text-sky-200">{formatPKR(todayFeeCollection)}</p>
            <p className="text-[9px] uppercase font-bold tracking-wider text-sky-300/80 mt-0.5">{todayTransactions.length} Paid Receipts</p>
          </div>
        </div>

      </div>

      {/* COURSE-WISE STUDENT DISTRIBUTION GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b-2 border-sky-600/30 pb-2">
          <h3 className="text-xs font-bold text-sky-950 uppercase tracking-[0.2em] flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-sky-600" />
            <span>Course Enrollment Matrix</span>
          </h3>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold uppercase tracking-wider text-sky-700 hover:text-sky-900 hover:underline flex items-center space-x-1"
          >
            <span>Manage Courses</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {courses.map(course => {
            const enrolled = activeStudents.filter(s => 
              s.courses.some(c => c.courseId === course.id)
            );
            const enrolledCount = enrolled.length;
            const isLumpSum = course.baseCourseType === 'Course Wise' || course.baseCourseType === 'Other';

            return (
              <div
                key={course.id}
                className="bg-white border-2 border-sky-100 hover:border-sky-400 p-4 rounded-2xl flex items-center justify-between hover:bg-sky-50/40 transition shadow-xs hover:shadow-md"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-wider rounded-md ${
                      course.baseCourseType === 'Other' ? 'bg-purple-900 text-white' : 'bg-sky-800 text-white'
                    }`}>
                      {course.code}
                    </span>
                    {course.baseCourseType === 'Other' && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-900 border border-purple-300 rounded uppercase">
                        OTHER
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 mt-1.5">{course.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mt-0.5 font-semibold">
                    {isLumpSum 
                      ? `${course.durationMonths} Mo • ${formatPKR(course.totalCourseFee || 0)} Total Package`
                      : `${course.durationMonths} Mo • ${formatPKR(course.monthlyFee)}/mo`
                    }
                  </p>
                </div>

                <div className="text-right pl-3 border-l-2 border-sky-200 my-1">
                  <span className="text-3xl font-display font-black text-sky-900">
                    {enrolledCount}
                  </span>
                  <p className="text-[9px] uppercase font-bold text-sky-700">Students</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARTS & RECENT RECEIPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        
        {/* Student Enrollment Chart */}
        <div className="lg:col-span-8 bg-white border-2 border-sky-100 p-4 sm:p-5 rounded-2xl space-y-4 shadow-xs min-w-0">
          <div className="border-b border-sky-100 pb-2 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-widest text-sky-950 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span>Course Strength Analytics</span>
            </h3>
            <span className="text-[10px] font-mono font-bold text-sky-700 uppercase bg-sky-50 px-2 py-0.5 rounded border border-sky-200">Bar Scale</span>
          </div>
          
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseBreakdownData}>
                <XAxis dataKey="name" stroke="#0284c7" fontSize={11} tickLine={false} />
                <YAxis stroke="#0284c7" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c4a6e', borderColor: '#0284c7', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="students" fill="#0284c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Ratio Donut Chart */}
        <div className="lg:col-span-4 bg-white border-2 border-sky-100 p-4 sm:p-5 rounded-2xl space-y-4 flex flex-col justify-between shadow-xs min-w-0">
          <div className="border-b border-sky-100 pb-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-sky-950 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
              <span>Gender Ratio</span>
            </h3>
          </div>

          <div className="h-44 w-full min-w-0 my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell fill="#0284c7" />
                  <Cell fill="#ec4899" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0c4a6e', borderColor: '#0284c7', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs border-t border-sky-100 pt-3 font-bold uppercase tracking-wider text-[10px]">
            <div className="flex items-center space-x-1.5 text-sky-900">
              <div className="w-3 h-3 bg-sky-600 rounded-sm"></div>
              <span>Boys ({boysCount})</span>
            </div>
            <div className="flex items-center space-x-1.5 text-pink-900">
              <div className="w-3 h-3 bg-pink-500 rounded-sm"></div>
              <span>Girls ({girlsCount})</span>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT FEE TRANSACTIONS TABLE */}
      <div className="bg-white border-2 border-sky-100 p-4 sm:p-6 rounded-2xl space-y-4 shadow-xs min-w-0">
        <div className="flex items-center justify-between border-b-2 border-sky-100 pb-3">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-sky-950 flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-sky-600" />
            <span>Recent Fee Receipts</span>
          </h3>

          <button
            onClick={() => onNavigate('fee_records')}
            className="text-xs font-bold uppercase tracking-wider text-sky-700 hover:text-sky-900 hover:underline flex items-center space-x-1"
          >
            <span>View All Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-sky-200 bg-sky-50/80 text-sky-950 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">Receipt #</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Course(s)</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Paid Amount</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Thermal Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sky-100">
              {transactions.slice(0, 5).map(tx => (
                <tr key={tx.id} className="hover:bg-sky-50/40 transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-sky-950">{tx.receiptNo}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-800 uppercase">{tx.studentName} ({tx.studentId})</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-[180px] truncate">{tx.courseNames.join(', ')}</td>
                  <td className="py-2.5 px-3 text-slate-600 font-mono">{tx.paymentDate}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 border border-sky-300 text-[9px] font-bold uppercase bg-sky-50 text-sky-900 rounded-md">
                      {tx.paymentSource}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">{formatPKR(tx.amountPaid)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onOpenReceipt(tx)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white font-bold uppercase tracking-wider text-[10px] rounded-lg transition shadow-xs shadow-sky-600/20"
                    >
                      Print POS
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
