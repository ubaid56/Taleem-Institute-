import React from 'react';
import { Course, InstituteSettings, PublicStaffMember, PublicEvent } from '../../types';
import { 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  Quote, 
  Calendar,
  Users,
  Building2,
  Clock,
  Banknote
} from 'lucide-react';

interface PublicHomePageProps {
  settings: InstituteSettings;
  courses: Course[];
  staff: PublicStaffMember[];
  events: PublicEvent[];
  setActiveTab: (tab: 'home' | 'about' | 'courses' | 'events' | 'contact') => void;
  onApplyCourse: (courseId?: string) => void;
  onOpenStudentPortal: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  settings,
  courses,
  staff,
  events,
  setActiveTab,
  onApplyCourse,
  onOpenStudentPortal,
}) => {
  const activeCourses = courses.filter(c => c.active !== false).slice(0, 6);
  const formattedWhatsapp = settings.whatsappPhone 
    ? settings.whatsappPhone.replace(/[^0-9]/g, '') 
    : '923481064487';

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-teal-950 to-slate-900 text-white overflow-hidden py-16 sm:py-24 px-4 sm:px-8 border-b-4 border-emerald-500">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.15),transparent_70%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-semibold text-xs tracking-wide uppercase shadow-inner">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Admissions Open for Batch 2026-27</span>
            </div>

            <h1 className="font-serif italic text-3xl sm:text-5xl font-extrabold text-white leading-tight">
              {settings.heroTitle || 'Empowering Youth with Future-Ready Technical Skills'}
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              {settings.heroSubtitle || 'Welcome to Taleem Institute of Science & Technology. We offer board-recognized Diplomas and vocational skills training designed to turn passion into employment.'}
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onApplyCourse()}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-xl hover:shadow-emerald-500/20 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <UserCheck className="w-5 h-5" />
                <span>Apply Online Admission</span>
              </button>

              <button
                onClick={() => setActiveTab('courses')}
                className="px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-slate-100 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>Explore Courses</span>
              </button>

              <button
                onClick={onOpenStudentPortal}
                className="px-5 py-3.5 rounded-xl bg-blue-600/90 hover:bg-blue-600 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-md"
              >
                <GraduationCap className="w-4 h-4" />
                <span>Student LMS Portal</span>
              </button>
            </div>

            {/* Key Badges */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Govt & Board Recognized</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Practical IT Labs</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Job Placement Assistance</span>
              </div>
            </div>
          </div>

          {/* Right Card: Director Quick Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 backdrop-blur-md rounded-2xl p-6 border border-emerald-500/30 shadow-2xl relative">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 mb-5 text-center sm:text-left">
                <img
                  src={settings.directorPicUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                  alt={settings.directorName || 'Director'}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-emerald-400 shadow-xl shrink-0"
                />
                <div className="pt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider mb-1">
                    Director Message
                  </span>
                  <h3 className="font-serif italic font-bold text-xl text-white">{settings.directorName || 'Engr. Ubaid Ahmad'}</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-0.5">{settings.directorTitle || 'Managing Director'}</p>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{settings.instituteName}</p>
                </div>
              </div>

              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-700/50 text-xs text-slate-300 italic relative">
                <Quote className="w-6 h-6 text-emerald-500/30 absolute top-2 right-2" />
                <p className="leading-relaxed">
                  "{settings.directorMessage || 'Our core vision is to provide world-class, practical IT education to empower youth with skills that open international career doors.'}"
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Reg: {settings.registrationNo}</span>
                <a
                  href={`https://wa.me/${formattedWhatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1"
                >
                  <MessageCircle className="w-3.5 h-3.5 fill-current" />
                  <span>Direct Message</span>
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-serif italic text-2xl font-bold text-slate-900 mb-2">Our Mission</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {settings.missionStatement || 'To equip students with state-of-the-art technological education, practical skills, and ethical values, enabling them to excel in the global digital economy.'}
            </p>
          </div>

          {/* Vision */}
          <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-md hover:shadow-lg transition-shadow relative overflow-hidden group">
            <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-serif italic text-2xl font-bold text-slate-900 mb-2">Our Vision</h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {settings.visionStatement || 'To become a premier center of excellence for IT and technical education, recognized for innovation, student achievement, and community development.'}
            </p>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-slate-200 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Explore Programs</span>
            <h2 className="font-serif italic text-3xl font-bold text-slate-900 mt-1">Featured Academic Courses</h2>
            <p className="text-xs text-slate-500 mt-1">Select a course to view details or apply for immediate enrollment.</p>
          </div>
          <button
            onClick={() => setActiveTab('courses')}
            className="text-emerald-700 hover:text-emerald-800 font-bold text-sm flex items-center gap-1 group"
          >
            <span>View All Courses</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Course Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group hover:-translate-y-1"
            >
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
                    {course.baseCourseType}
                  </span>
                  <span className="text-xs text-slate-500 font-mono font-medium">
                    Code: {course.code}
                  </span>
                </div>

                <div>
                  <h3 className="font-serif italic text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {course.name}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-3 mt-2 leading-relaxed">
                    {course.description || 'Comprehensive practical course designed with hands-on lab projects.'}
                  </p>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100 text-xs">
                  <div className="flex justify-between items-center text-slate-700">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Duration:</span>
                    </span>
                    <strong className="text-slate-900 font-semibold">{course.durationMonths} Months</strong>
                  </div>

                  {course.baseCourseType === 'Course Wise' ? (
                    <div className="flex justify-between items-center text-slate-700">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Total Course Fee:</span>
                      </span>
                      <strong className="text-emerald-700 font-bold">PKR {course.totalCourseFee?.toLocaleString()}</strong>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Monthly Fee:</span>
                        </span>
                        <strong className="text-slate-900 font-semibold">PKR {course.monthlyFee?.toLocaleString()}/mo</strong>
                      </div>
                      <div className="flex justify-between items-center text-slate-700">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>Admission Fee:</span>
                        </span>
                        <span className="text-slate-700 font-medium">PKR {course.admissionFee?.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-2">
                <a
                  href={`https://wa.me/${formattedWhatsapp}?text=I%20am%20interested%20in%20course:%20${encodeURIComponent(course.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Inquire</span>
                </a>

                <button
                  onClick={() => onApplyCourse(course.id)}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1 transition-colors"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Apply Online</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Staff Preview Gallery */}
      {staff.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Our Experts</span>
              <h2 className="font-serif italic text-2xl font-bold text-slate-900 mt-0.5">Faculty & Administration</h2>
            </div>
            <button
              onClick={() => setActiveTab('about')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>View Faculty Gallery</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {staff.slice(0, 3).map((member) => (
              <div key={member.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={member.name}
                  className="w-16 h-16 rounded-xl object-cover border border-emerald-200 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{member.name}</h4>
                  <p className="text-xs text-emerald-700 font-medium">{member.designation}</p>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Events Preview */}
      {events.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-8 space-y-6">
          <div className="flex justify-between items-end border-b border-slate-200 pb-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Campus Highlights</span>
              <h2 className="font-serif italic text-2xl font-bold text-slate-900 mt-0.5">Latest Events & Activities</h2>
            </div>
            <button
              onClick={() => setActiveTab('events')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
            >
              <span>View All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.slice(0, 2).map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm flex flex-col sm:flex-row">
                <img
                  src={ev.imageUrl}
                  alt={ev.title}
                  className="sm:w-44 h-40 object-cover shrink-0"
                />
                <div className="p-5 flex flex-col justify-between">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {ev.date}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2">{ev.description}</p>
                  </div>
                  {ev.location && (
                    <span className="text-[11px] text-slate-400 mt-2 font-mono">📍 {ev.location}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="space-y-2 max-w-xl">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Ready to Start Your Journey?</span>
            <h3 className="font-serif italic text-2xl sm:text-3xl font-bold">Have Questions About Admissions or Fees?</h3>
            <p className="text-xs sm:text-sm text-emerald-100">
              Speak directly with our admissions counselor on WhatsApp or visit our campus for a free consultation.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=Hello!%20I%20have%20an%20admission%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-current" />
              <span>WhatsApp Admission Helpline</span>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
