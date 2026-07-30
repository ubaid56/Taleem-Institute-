import React from 'react';
import { InstituteSettings, PublicStaffMember } from '../../types';
import { Award, Sparkles, Building2, Quote, Users, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface PublicAboutPageProps {
  settings: InstituteSettings;
  staff: PublicStaffMember[];
}

export const PublicAboutPage: React.FC<PublicAboutPageProps> = ({ settings, staff }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-16">
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold tracking-wider uppercase inline-block">
          About Our Institution
        </span>
        <h1 className="font-serif italic text-3xl sm:text-4xl font-extrabold text-slate-900">
          About {settings.instituteName}
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          {settings.subTitle} • Established to bring modern, practical, and affordable technical education to KPK.
        </p>
      </div>

      {/* Main Story & Values */}
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Who We Are</span>
          <h2 className="font-serif italic text-2xl font-bold text-slate-900">Dedicated to Excellence in IT & Skill Development</h2>
          <p className="text-slate-600 text-sm leading-relaxed">
            Taleem Institute of Science & Technology is a premier technical and computer training institute located on Dubai Adda Road, Bakhshali, Mardan. We specialize in Board recognized Diplomas (DIT, CIT) and high-demand vocational programs including Web Development, Graphics Designing, YouTube Automation, and Spoken English.
          </p>
          <p className="text-slate-600 text-sm leading-relaxed">
            Our state-of-the-art computer labs, certified instructors, and student-focused curriculum ensure that every student leaves with real, market-ready skills.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-800">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Board Recognized Certification</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Modern Computer Labs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Experienced IT Professionals</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Digital LMS Student Portal</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=600"
              alt="Institute Campus Life"
              className="rounded-2xl shadow-xl border-4 border-white object-cover max-h-80 w-full"
            />
            <div className="absolute -bottom-4 -left-4 bg-emerald-800 text-white p-4 rounded-2xl shadow-lg text-xs space-y-1">
              <span className="font-bold block text-sm">Reg No: {settings.registrationNo}</span>
              <span className="text-emerald-200">Registered Technical Institute</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mission & Vision Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-emerald-900 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-emerald-800 flex items-center justify-center mb-4">
            <Award className="w-6 h-6 text-emerald-300" />
          </div>
          <h3 className="font-serif italic text-2xl font-bold mb-2">Our Mission</h3>
          <p className="text-emerald-100 text-sm leading-relaxed">
            {settings.missionStatement || 'To equip students with state-of-the-art technological education, practical skills, and ethical values, enabling them to excel in the global digital economy.'}
          </p>
        </div>

        <div className="bg-teal-900 text-white rounded-3xl p-8 shadow-md relative overflow-hidden">
          <div className="w-12 h-12 rounded-xl bg-teal-800 flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-teal-300" />
          </div>
          <h3 className="font-serif italic text-2xl font-bold mb-2">Our Vision</h3>
          <p className="text-teal-100 text-sm leading-relaxed">
            {settings.visionStatement || 'To become a premier center of excellence for IT and technical education, recognized for innovation, student achievement, and community development.'}
          </p>
        </div>
      </div>

      {/* Director Message Section */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-700">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-4 text-center md:text-left">
            <img
              src={settings.directorPicUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
              alt={settings.directorName || 'Director'}
              className="w-52 h-52 sm:w-60 sm:h-60 rounded-3xl object-cover border-4 border-emerald-500 mx-auto md:mx-0 shadow-2xl"
            />
            <h3 className="font-serif italic font-bold text-xl text-white mt-4">{settings.directorName || 'Engr. Ubaid Ahmad'}</h3>
            <p className="text-xs text-emerald-400 font-semibold">{settings.directorTitle || 'Managing Director'}</p>
          </div>

          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
              <Quote className="w-4 h-4" />
              <span>Director's Message to Students</span>
            </div>

            <p className="text-slate-300 text-sm leading-relaxed italic">
              "{settings.directorMessage || 'At Taleem Institute, we believe that education must lead to practical capability. Our focus is not just on textbook learning, but on hands-on project creation. We are dedicated to nurturing skilled professionals who contribute meaningfully to society and build lucrative careers.'}"
            </p>

            <div className="pt-2 text-xs text-slate-400 font-mono">
              — {settings.directorName}, {settings.instituteName}
            </div>
          </div>
        </div>
      </div>

      {/* Staff & Faculty Gallery Section */}
      <div className="space-y-8">
        <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Our Faculty Gallery</span>
            <h2 className="font-serif italic text-3xl font-bold text-slate-900 mt-1">Meet Our Instructors & Staff</h2>
            <p className="text-xs text-slate-500 mt-1">Experienced teachers, industry engineers, and administrative leaders.</p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
            <Users className="w-4 h-4 text-emerald-600" />
            <span>{staff.length} Team Members</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
            >
              <div className="h-56 bg-slate-100 overflow-hidden relative">
                <img
                  src={member.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <h3 className="font-serif italic text-lg font-bold">{member.name}</h3>
                  <p className="text-xs text-emerald-300 font-medium">{member.designation}</p>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-slate-600 leading-relaxed">{member.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
