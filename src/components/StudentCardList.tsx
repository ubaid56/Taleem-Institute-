import React, { useState } from 'react';
import { Student, Course } from '../types';
import { StudentCardModal } from './StudentCardModal';
import { Contact, Search, QrCode, Printer, Filter, Barcode } from 'lucide-react';

interface StudentCardListProps {
  students: Student[];
  courses: Course[];
}

export const StudentCardList: React.FC<StudentCardListProps> = ({
  students,
  courses,
}) => {
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCardStudent, setActiveCardStudent] = useState<Student | null>(null);

  const filteredStudents = students.filter(s => {
    if (s.status !== 'active') return false;

    const matchesCourse = selectedCourseFilter === 'ALL' || s.courses.some(c => c.courseId === selectedCourseFilter);
    const matchesSearch = 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.mobileNo.includes(searchQuery);

    return matchesCourse && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold">
            Id
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Student QR Identity Cards</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">View & print official student cards with scannable attendance QR codes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedCourseFilter}
            onChange={(e) => setSelectedCourseFilter(e.target.value)}
            className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
          >
            <option value="ALL">All Enrolled Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-4 h-4 text-[#1A1A1A] absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Name, Roll ID..."
              className="bg-[#FDFCFB] border border-[#1A1A1A] pl-9 pr-3 py-2 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/50 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Student Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full py-16 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-xs">
            No active students matching criteria.
          </div>
        ) : (
          filteredStudents.map(student => (
            <div
              key={student.id}
              className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm hover:bg-[#FDFCFB] transition flex flex-col justify-between space-y-3"
            >
              <div className="flex items-center space-x-3">
                <img
                  src={student.photoUrl}
                  alt={student.name}
                  className="w-12 h-12 object-cover border border-[#1A1A1A] shrink-0"
                />
                <div className="min-w-0">
                  <span className="font-mono text-[10px] text-[#1A1A1A] font-bold">{student.studentId}</span>
                  <h4 className="font-bold text-xs text-[#1A1A1A] uppercase truncate">{student.name}</h4>
                  <p className="text-[10px] text-[#1A1A1A]/70 truncate">S/O: {student.fatherName}</p>
                </div>
              </div>

              <div className="text-[10px] text-[#1A1A1A] pt-2 border-t border-[#1A1A1A] space-y-0.5">
                <p className="font-bold truncate">
                  {student.courses.map(c => c.courseName).join(', ')}
                </p>
                <p className="text-[#1A1A1A]/60">Contact: {student.mobileNo}</p>
              </div>

              <button
                onClick={() => setActiveCardStudent(student)}
                className="w-full py-2 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-widest border border-blue-900 flex items-center justify-center space-x-1.5 transition rounded"
              >
                <Barcode className="w-4 h-4" />
                <span>View Blue ID Card</span>
              </button>
            </div>
          ))
        )}
      </div>

      {/* ID Card Modal */}
      {activeCardStudent && (
        <StudentCardModal
          student={activeCardStudent}
          onClose={() => setActiveCardStudent(null)}
        />
      )}

    </div>
  );
};
