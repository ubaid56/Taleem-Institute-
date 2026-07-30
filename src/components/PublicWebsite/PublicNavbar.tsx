import React, { useState } from 'react';
import { InstituteSettings } from '../../types';
import { 
  Building2, 
  Phone, 
  MessageCircle, 
  MapPin, 
  UserCheck, 
  ShieldCheck, 
  Menu, 
  X, 
  BookOpen, 
  Calendar, 
  Info, 
  Home, 
  Mail,
  GraduationCap
} from 'lucide-react';

interface PublicNavbarProps {
  settings: InstituteSettings;
  activeTab: 'home' | 'about' | 'courses' | 'events' | 'contact';
  setActiveTab: (tab: 'home' | 'about' | 'courses' | 'events' | 'contact') => void;
  onOpenStudentPortal: () => void;
  onOpenStaffPortal: () => void;
  onApplyCourseClick?: (courseId?: string) => void;
}

export const PublicNavbar: React.FC<PublicNavbarProps> = ({
  settings,
  activeTab,
  setActiveTab,
  onOpenStudentPortal,
  onOpenStaffPortal,
  onApplyCourseClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Clean WhatsApp number
  const formattedWhatsapp = settings.whatsappPhone 
    ? settings.whatsappPhone.replace(/[^0-9]/g, '') 
    : '923481064487';

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'about', label: 'About Us', icon: Info },
    { id: 'courses', label: 'Our Courses', icon: BookOpen },
    { id: 'events', label: 'Events & Gallery', icon: Calendar },
    { id: 'contact', label: 'Contact Us', icon: Mail },
  ] as const;

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md border-b border-emerald-100">
      {/* Top Utility Bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap items-center gap-4 text-slate-300">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              {settings.address}
            </span>
            <span className="hidden md:inline">|</span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              {settings.phone}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct WhatsApp Contact */}
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Taleem%20Institute!%20I%20have%20an%20inquiry.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp Us</span>
            </a>

            {/* Student Login Portal Link */}
            <button
              onClick={onOpenStudentPortal}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs transition-colors"
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student LMS Login</span>
            </button>

            {/* Staff / Admin Portal Link */}
            <button
              onClick={onOpenStaffPortal}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium text-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Staff Portal</span>
            </button>
          </div>
        </div>
      </div>

      {/* Marquee Announcement Banner */}
      {settings.marqueeText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-semibold text-xs py-1.5 px-4 overflow-hidden border-y border-amber-600 shadow-inner flex items-center gap-3 relative z-10">
          <span className="bg-slate-950 text-amber-300 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1.5 shadow-xs z-10">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Notice:
          </span>
          <div className="overflow-hidden w-full relative flex items-center">
            <div className="animate-marquee-seamless flex whitespace-nowrap shrink-0 items-center font-bold tracking-wide">
              <div className="flex items-center gap-8 px-4 shrink-0">
                <span>{settings.marqueeText}</span>
                <span className="text-slate-950/40 font-black">✦</span>
                <span>{settings.marqueeText}</span>
                <span className="text-slate-950/40 font-black">✦</span>
              </div>
              <div className="flex items-center gap-8 px-4 shrink-0">
                <span>{settings.marqueeText}</span>
                <span className="text-slate-950/40 font-black">✦</span>
                <span>{settings.marqueeText}</span>
                <span className="text-slate-950/40 font-black">✦</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Brand Logo & Name */}
        <div 
          onClick={() => setActiveTab('home')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          {settings.logoUrl ? (
            <img 
              src={settings.logoUrl} 
              alt={settings.instituteName} 
              className="w-12 h-12 object-contain rounded-lg border border-emerald-200 shadow-sm" 
            />
          ) : (
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <Building2 className="w-7 h-7" />
            </div>
          )}
          <div>
            <h1 className="font-serif italic text-xl sm:text-2xl font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
              {settings.instituteName}
            </h1>
            <p className="text-[11px] font-sans font-semibold tracking-wider text-emerald-700 uppercase">
              {settings.subTitle}
            </p>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-2">
          {onApplyCourseClick && (
            <button
              onClick={() => onApplyCourseClick()}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <UserCheck className="w-4 h-4" />
              <span>Apply Online</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2 shadow-lg animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm font-medium ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-600" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            {onApplyCourseClick && (
              <button
                onClick={() => {
                  onApplyCourseClick();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-emerald-600 text-white font-semibold rounded-lg text-sm text-center shadow-sm"
              >
                Apply Online Admission
              </button>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  onOpenStudentPortal();
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-blue-600 text-white font-medium rounded text-xs text-center"
              >
                Student LMS Login
              </button>
              <button
                onClick={() => {
                  onOpenStaffPortal();
                  setMobileMenuOpen(false);
                }}
                className="py-2 bg-slate-800 text-white font-medium rounded text-xs text-center"
              >
                Staff Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
