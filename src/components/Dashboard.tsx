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
  Award
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
    { name: 'Boys ♂', value: boysCount, color: '#3b82f6' },
    { name: 'Girls ♀', value: girlsCount, color: '#ec4899' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Welcome Banner */}
      <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-6 rounded-2xl shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] px-2.5 py-0.5 bg-[#1A1A1A] text-white rounded-md">
                ADMINISTRATION DASHBOARD
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">Taleem Institute System</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif italic font-bold text-[#1A1A1A] mt-1">
              Welcome to Taleem Institute of Science & Technology
            </h2>
            <p className="text-xs uppercase tracking-wider font-semibold opacity-80 mt-1">
              Director / Owner: <strong className="underline">Ubaid Ahmad</strong> • Real-time Institute Management Ledger
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(currentRole === 'super_admin' || currentRole === 'accountant' || !!userPermissions?.canAddStudent) && (
              <button
                onClick={() => onNavigate('add_student')}
                className="px-4 py-2 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] rounded-xl flex items-center space-x-2 transition"
              >
                <UserPlus className="w-4 h-4" />
                <span>New Admission</span>
              </button>
            )}

            {(currentRole === 'super_admin' || currentRole === 'accountant' || !!userPermissions?.canSubmitFee) && (
              <button
                onClick={() => onNavigate('submit_fee')}
                className="px-4 py-2 bg-white text-[#1A1A1A] hover:bg-[#F4F2EE] font-bold text-xs uppercase tracking-wider border-2 border-[#1A1A1A] rounded-xl flex items-center space-x-2 transition"
              >
                <Receipt className="w-4 h-4" />
                <span>Submit Fee</span>
              </button>
            )}

            {(currentRole === 'super_admin' || currentRole === 'teacher' || !!userPermissions?.canTakeAttendance) && (
              <button
                onClick={() => onNavigate('attendance')}
                className="px-4 py-2 bg-[#F4F2EE] text-[#1A1A1A] hover:bg-white font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] rounded-xl flex items-center space-x-2 transition"
              >
                <QrCode className="w-4 h-4" />
                <span>QR Attendance</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TOP METRIC CARDS GRID */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Active Students */}
        <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-widest">Total Active</span>
            <Users className="w-4 h-4 text-[#1A1A1A]" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-serif italic font-bold text-[#1A1A1A]">{totalActiveCount}</p>
            <p className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">Enrolled</p>
          </div>
        </div>

        {/* Boys Count */}
        <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-widest">Boys ♂</span>
            <div className="w-2.5 h-2.5 bg-[#1A1A1A] rounded-sm"></div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-serif italic font-bold text-[#1A1A1A]">{boysCount}</p>
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Male Students</p>
          </div>
        </div>

        {/* Girls Count */}
        <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 rounded-2xl flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between opacity-70">
            <span className="text-[10px] font-bold uppercase tracking-widest">Girls ♀</span>
            <div className="w-2.5 h-2.5 bg-[#1A1A1A] rounded-full"></div>
          </div>
          <div className="mt-3">
            <p className="text-3xl font-serif italic font-bold text-[#1A1A1A]">{girlsCount}</p>
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider">Female Students</p>
          </div>
        </div>

        {/* Pass Out Students */}
        <div 
          onClick={() => onNavigate('pass_out')}
          className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#F4F2EE] transition shadow-sm"
        >
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-[10px] font-bold uppercase tracking-widest">Pass Out</span>
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-serif italic font-bold text-emerald-800">{passOutCount}</p>
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider text-[#1A1A1A]">Graduated</p>
          </div>
        </div>

        {/* Suspended Students */}
        <div 
          onClick={() => onNavigate('suspended')}
          className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#F4F2EE] transition shadow-sm"
        >
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-[10px] font-bold uppercase tracking-widest">Suspended</span>
            <UserX className="w-4 h-4" />
          </div>
          <div className="mt-3">
            <p className="text-3xl font-serif italic font-bold text-rose-800">{suspendedCount}</p>
            <p className="text-[10px] uppercase font-bold opacity-60 tracking-wider text-[#1A1A1A]">Suspended</p>
          </div>
        </div>

        {/* Today's Fee Collection */}
        <div 
          onClick={() => onNavigate('fee_records')}
          className="bg-[#1A1A1A] text-white p-4 rounded-2xl flex flex-col justify-between cursor-pointer hover:bg-[#333] transition shadow-sm"
        >
          <div className="flex items-center justify-between text-white/70">
            <span className="text-[10px] font-bold uppercase tracking-widest">Today's Fee</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3">
            <p className="text-xl font-mono font-bold text-emerald-300">{formatPKR(todayFeeCollection)}</p>
            <p className="text-[9px] uppercase font-bold tracking-wider text-white/70 mt-0.5">{todayTransactions.length} Paid Receipts</p>
          </div>
        </div>

      </div>

      {/* COURSE-WISE STUDENT DISTRIBUTION GRID */}
      <div className="space-y-3">
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2">
          <h3 className="text-xs font-bold text-[#1A1A1A] uppercase tracking-[0.2em] flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-[#1A1A1A]" />
            <span>Course Enrollment Matrix</span>
          </h3>
          <button
            onClick={() => onNavigate('courses')}
            className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline flex items-center space-x-1"
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

            return (
              <div
                key={course.id}
                className="bg-white border-2 border-[#1A1A1A] p-4 rounded-2xl flex items-center justify-between hover:bg-[#F4F2EE] transition shadow-sm"
              >
                <div>
                  <span className="text-[9px] font-mono font-bold px-2 py-0.5 bg-[#1A1A1A] text-white uppercase tracking-wider rounded-md">
                    {course.code}
                  </span>
                  <h4 className="font-bold text-sm text-[#1A1A1A] mt-1.5">{course.name}</h4>
                  <p className="text-[10px] uppercase tracking-wider opacity-70 mt-0.5 font-semibold">
                    {course.durationMonths} Mo • {formatPKR(course.monthlyFee)}/mo
                  </p>
                </div>

                <div className="text-right pl-3 border-l-2 border-[#1A1A1A] my-1">
                  <span className="text-3xl font-serif italic font-bold text-[#1A1A1A]">
                    {enrolledCount}
                  </span>
                  <p className="text-[9px] uppercase font-bold opacity-60">Students</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CHARTS & RECENT RECEIPTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-w-0">
        
        {/* Student Enrollment Chart */}
        <div className="lg:col-span-8 bg-white border-2 border-[#1A1A1A] p-4 sm:p-5 rounded-2xl space-y-4 shadow-sm min-w-0">
          <div className="border-b border-[#1A1A1A] pb-2 flex justify-between items-center">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">Course Strength Analytics</h3>
            <span className="text-[10px] font-mono font-bold uppercase">Bar Scale</span>
          </div>
          
          <div className="h-64 w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={courseBreakdownData}>
                <XAxis dataKey="name" stroke="#1A1A1A" fontSize={11} tickLine={false} />
                <YAxis stroke="#1A1A1A" fontSize={11} allowDecimals={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
                <Bar dataKey="students" fill="#1A1A1A" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gender Ratio Donut Chart */}
        <div className="lg:col-span-4 bg-white border-2 border-[#1A1A1A] p-4 sm:p-5 rounded-2xl space-y-4 flex flex-col justify-between shadow-sm min-w-0">
          <div className="border-b border-[#1A1A1A] pb-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-[#1A1A1A]">Gender Ratio</h3>
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
                  <Cell fill="#1A1A1A" />
                  <Cell fill="#4A5568" />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1A1A1A', borderColor: '#1A1A1A', color: '#fff', borderRadius: '12px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center space-x-6 text-xs border-t border-[#1A1A1A] pt-3 font-bold uppercase tracking-wider text-[10px]">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-[#1A1A1A] rounded-sm"></div>
              <span>Boys ({boysCount})</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 bg-[#4A5568] rounded-sm"></div>
              <span>Girls ({girlsCount})</span>
            </div>
          </div>
        </div>

      </div>

      {/* RECENT FEE TRANSACTIONS TABLE */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 rounded-2xl space-y-4 shadow-sm min-w-0">
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
          <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-[#1A1A1A] flex items-center space-x-2">
            <Receipt className="w-4 h-4 text-[#1A1A1A]" />
            <span>Recent Fee Receipts</span>
          </h3>

          <button
            onClick={() => onNavigate('fee_records')}
            className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] hover:underline flex items-center space-x-1"
          >
            <span>View All Ledger</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[640px] text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3 rounded-l-lg">Receipt #</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Course(s)</th>
                <th className="py-2.5 px-3">Date / Time</th>
                <th className="py-2.5 px-3">Source</th>
                <th className="py-2.5 px-3 text-right">Paid Amount</th>
                <th className="py-2.5 px-3 text-center rounded-r-lg">Thermal Print</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/30">
              {transactions.slice(0, 5).map(tx => (
                <tr key={tx.id} className="hover:bg-[#F4F2EE] transition">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#1A1A1A]">{tx.receiptNo}</td>
                  <td className="py-2.5 px-3 font-bold text-[#1A1A1A] uppercase">{tx.studentName} ({tx.studentId})</td>
                  <td className="py-2.5 px-3 text-[#1A1A1A] max-w-[180px] truncate">{tx.courseNames.join(', ')}</td>
                  <td className="py-2.5 px-3 text-[#1A1A1A] font-mono">{tx.paymentDate}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 border border-[#1A1A1A] text-[9px] font-bold uppercase bg-[#F4F2EE] rounded-md">
                      {tx.paymentSource}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800">{formatPKR(tx.amountPaid)}</td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onOpenReceipt(tx)}
                      className="px-2.5 py-1 bg-[#1A1A1A] text-white hover:bg-[#333] font-bold uppercase tracking-wider text-[10px] rounded-lg transition"
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
