import React, { useState } from 'react';
import { Course, InstituteSettings } from '../../types';
import { BookOpen, Clock, Banknote, Building2, UserCheck, MessageCircle, Search, Filter } from 'lucide-react';

interface PublicCoursesPageProps {
  courses: Course[];
  settings: InstituteSettings;
  onApplyCourse: (courseId?: string) => void;
}

export const PublicCoursesPage: React.FC<PublicCoursesPageProps> = ({
  courses,
  settings,
  onApplyCourse,
}) => {
  const activeCourses = courses.filter(c => c.active !== false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const formattedWhatsapp = settings.whatsappPhone 
    ? settings.whatsappPhone.replace(/[^0-9]/g, '') 
    : '923481064487';

  // Base categories for filter
  const categories = Array.from(new Set(activeCourses.map(c => c.baseCourseType)));

  const filteredCourses = activeCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (course.description && course.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || course.baseCourseType === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Page Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden border-b-4 border-emerald-500">
        <div className="max-w-2xl space-y-3 relative z-10">
          <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
            Official Course Directory
          </span>
          <h1 className="font-serif italic text-3xl sm:text-4xl font-extrabold text-white">
            Explore Academic & Vocational Programs
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Choose from our board-recognized diplomas and hands-on short courses. Apply online to reserve your seat for the upcoming batch.
          </p>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search course title, code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
          />
        </div>

        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Courses ({activeCourses.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Courses Cards Grid */}
      {filteredCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-700">No matching courses found</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filter category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                {/* Header Badge */}
                <div className="flex justify-between items-start gap-2">
                  <span className="px-3 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                    {course.baseCourseType}
                  </span>
                  <span className="text-xs font-mono text-slate-500 font-semibold bg-slate-100 px-2 py-0.5 rounded">
                    {course.code}
                  </span>
                </div>

                {/* Title & Description */}
                <div>
                  <h3 className="font-serif italic text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[4rem]">
                    {course.description || 'Hands-on practical training with certified lab instructors and course materials.'}
                  </p>
                </div>

                {/* Course Details List (EXPLICITLY REQUESTED: Title, Description, Duration, Monthly Fee, Admission Fee) */}
                <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700 pb-1 border-b border-slate-200/60">
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span>Duration:</span>
                    </span>
                    <strong className="text-slate-900 font-semibold">{course.durationMonths} Months</strong>
                  </div>

                  {course.baseCourseType === 'Course Wise' ? (
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                        <Banknote className="w-4 h-4 text-emerald-600" />
                        <span>Total Course Fee Package:</span>
                      </span>
                      <strong className="text-emerald-700 font-bold text-sm">PKR {course.totalCourseFee?.toLocaleString()}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>Monthly Tuition Fee:</span>
                        </span>
                        <strong className="text-emerald-700 font-bold text-sm">PKR {course.monthlyFee?.toLocaleString()} / month</strong>
                      </div>

                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1.5 text-slate-500 font-medium">
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>One-time Admission Fee:</span>
                        </span>
                        <span className="text-slate-800 font-semibold">PKR {course.admissionFee?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=Hello!%20I%20have%20an%20inquiry%20regarding%20course:%20${encodeURIComponent(course.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 rounded-xl bg-white border border-emerald-300 text-emerald-800 hover:bg-emerald-50 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4 fill-current text-emerald-600" />
                  <span>Inquire</span>
                </a>

                <button
                  onClick={() => onApplyCourse(course.id)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all transform hover:-translate-y-0.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Apply Online</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
