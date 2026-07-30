import React from 'react';
import { InstituteSettings } from '../../types';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  MessageCircle, 
  ExternalLink,
  ShieldCheck,
  GraduationCap,
  Heart
} from 'lucide-react';

interface PublicFooterProps {
  settings: InstituteSettings;
  setActiveTab: (tab: 'home' | 'about' | 'courses' | 'events' | 'contact') => void;
  onOpenStudentPortal: () => void;
  onOpenStaffPortal: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({
  settings,
  setActiveTab,
  onOpenStudentPortal,
  onOpenStaffPortal,
}) => {
  const formattedWhatsapp = settings.whatsappPhone 
    ? settings.whatsappPhone.replace(/[^0-9]/g, '') 
    : '923481064487';

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t-4 border-emerald-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {/* Col 1: Brand Info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.instituteName} className="w-10 h-10 object-contain rounded bg-white p-1" />
            ) : (
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div>
              <h3 className="font-serif italic text-lg font-bold text-white">{settings.instituteName}</h3>
              <p className="text-[10px] text-emerald-400 font-semibold tracking-wider uppercase">{settings.subTitle}</p>
            </div>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            {settings.heroSubtitle || 'Empowering students with industry-standard computer and technical skills.'}
          </p>
          <div className="pt-1">
            <span className="text-[11px] text-slate-400 block font-mono">Reg. No: {settings.registrationNo}</span>
          </div>
        </div>

        {/* Col 2: Navigation Links */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-b border-slate-800 pb-2">Quick Navigation</h4>
          <ul className="space-y-2 text-xs">
            <li>
              <button onClick={() => setActiveTab('home')} className="hover:text-emerald-400 transition-colors">
                Home Page
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('about')} className="hover:text-emerald-400 transition-colors">
                About Taleem Institute
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('courses')} className="hover:text-emerald-400 transition-colors">
                Explore All Courses
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('events')} className="hover:text-emerald-400 transition-colors">
                Events & Photo Gallery
              </button>
            </li>
            <li>
              <button onClick={() => setActiveTab('contact')} className="hover:text-emerald-400 transition-colors">
                Contact & Location
              </button>
            </li>
          </ul>
        </div>

        {/* Col 3: Social & Portals */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-b border-slate-800 pb-2">Portals & Social Media</h4>
          <div className="space-y-2 text-xs mb-4">
            <button
              onClick={onOpenStudentPortal}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 transition-colors font-medium"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-blue-400" />
                Student LMS Portal
              </span>
              <ExternalLink className="w-3 h-3" />
            </button>
            <button
              onClick={onOpenStaffPortal}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors font-medium"
            >
              <span className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                Staff Administration
              </span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="pt-2">
            <h5 className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Connect With Us</h5>
            <div className="flex flex-wrap gap-2 text-xs">
              {settings.socialFacebook && (
                <a href={settings.socialFacebook} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-800 hover:bg-blue-600 hover:text-white rounded text-slate-300 transition-colors">
                  Facebook
                </a>
              )}
              {settings.socialTiktok && (
                <a href={settings.socialTiktok} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-800 hover:bg-pink-600 hover:text-white rounded text-slate-300 transition-colors">
                  TikTok
                </a>
              )}
              {settings.socialInstagram && (
                <a href={settings.socialInstagram} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-800 hover:bg-rose-600 hover:text-white rounded text-slate-300 transition-colors">
                  Instagram
                </a>
              )}
              {settings.socialYoutube && (
                <a href={settings.socialYoutube} target="_blank" rel="noopener noreferrer" className="px-2.5 py-1 bg-slate-800 hover:bg-red-600 hover:text-white rounded text-slate-300 transition-colors">
                  YouTube
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Col 4: Direct Contact */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 border-b border-slate-800 pb-2">Direct Contact</h4>
          <ul className="space-y-2.5 text-xs">
            <li className="flex items-start gap-2 text-slate-300">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{settings.address}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settings.phone}</span>
            </li>
            <li className="flex items-center gap-2 text-slate-300">
              <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{settings.email}</span>
            </li>
          </ul>

          <div className="mt-4 pt-2">
            <a
              href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Taleem%20Institute!%20I%20want%20information%20about%20admissions.`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg shadow-md transition-all"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* Floating Sticky WhatsApp Button */}
      <a
        href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Taleem%20Institute!%20I%20have%20a%20question.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp"
        className="fixed bottom-6 right-6 z-50 bg-emerald-600 hover:bg-emerald-500 text-white p-3.5 rounded-full shadow-2xl transition-all transform hover:scale-110 flex items-center justify-center border-2 border-white ring-4 ring-emerald-500/30"
      >
        <MessageCircle className="w-7 h-7 fill-current" />
      </a>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>© {new Date().getFullYear()} {settings.instituteName}. All rights reserved.</p>
        <p className="flex items-center gap-1">
          <span>Managed by</span>
          <strong className="text-slate-400">{settings.ownerName}</strong>
        </p>
      </div>
    </footer>
  );
};
