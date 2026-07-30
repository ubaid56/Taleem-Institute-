import React, { useState, useEffect } from 'react';
import { UserRole, StaffUser, InstituteSettings } from '../types';
import { 
  Building2, 
  ShieldAlert, 
  UserCheck, 
  BookOpenCheck, 
  Search, 
  Clock, 
  ChevronDown, 
  LogOut, 
  Award,
  RefreshCw,
  Sparkles,
  Phone,
  MapPin,
  Lock,
  KeyRound,
  X,
  CheckCircle2,
  AlertCircle,
  Menu
} from 'lucide-react';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  users: StaffUser[];
  settings: InstituteSettings;
  onSearchSelect?: (studentId: string) => void;
  onResetData: () => void;
  onLogout?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
  pendingApplicationsCount?: number;
  onNavigateToOnlineApplies?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  users,
  settings,
  onResetData,
  onLogout,
  onToggleMobileMenu,
  isMobileMenuOpen,
  pendingApplicationsCount = 0,
  onNavigateToOnlineApplies,
}) => {
  const [time, setTime] = useState(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [targetRole, setTargetRole] = useState<UserRole | null>(null);
  
  // Login Authentication Modal State
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentUser = users.find(u => u.role === currentRole) || users[0];

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'super_admin':
        return { label: 'Super Admin', color: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-indigo-500/20', icon: ShieldAlert };
      case 'accountant':
        return { label: 'Accountant', color: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-500/20', icon: UserCheck };
      case 'teacher':
        return { label: 'Course Teacher', color: 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-md shadow-blue-500/20', icon: BookOpenCheck };
      case 'other_staff':
        return { label: 'Support / Class 4', color: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-500/20', icon: UserCheck };
      default:
        return { label: 'Staff Member', color: 'bg-slate-700 text-white', icon: UserCheck };
    }
  };

  const badge = getRoleBadge(currentRole);
  const BadgeIcon = badge.icon;

  const handleInitiateRoleSwitch = (role: UserRole) => {
    setShowRoleDropdown(false);
    if (role === currentRole) return;

    setAuthUsername('');
    setAuthPassword('');
    setAuthError(null);
    setTargetRole(role);
  };

  const handleVerifyAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole) return;

    const matchedUser = users.find(
      u => u.username.toLowerCase() === authUsername.trim().toLowerCase() && u.role === targetRole
    );

    if (!matchedUser) {
      setAuthError(`Invalid username for ${targetRole.replace('_', ' ')} account.`);
      return;
    }

    const correctPassword = matchedUser.password || '123456';
    if (authPassword.trim() !== correctPassword) {
      setAuthError('Incorrect password. Please verify Super Admin login details.');
      return;
    }

    // Auth Successful
    onRoleChange(targetRole);
    setTargetRole(null);
    setAuthError(null);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md print:hidden shrink-0">
      <div className="max-w-full px-3 sm:px-8 h-18 flex items-center justify-between gap-2 sm:gap-4 overflow-hidden">
        
        {/* Institute Title & Branding */}
        <div className="flex items-center space-x-2 sm:space-x-3.5 py-2.5 min-w-0 flex-1">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              title="Toggle Navigation Sidebar"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition shrink-0 cursor-pointer shadow-xs"
            >
              <Menu className="w-5 h-5 text-indigo-400" />
            </button>
          )}

          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center overflow-hidden">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-400" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <h1 className="text-sm sm:text-2xl font-black tracking-tight text-white drop-shadow-sm truncate">
                {settings.instituteName || 'Taleem Institute'}
              </h1>
              {settings.subTitle && (
                <span className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                  {settings.subTitle}
                </span>
              )}
              {pendingApplicationsCount > 0 && (
                <button
                  type="button"
                  onClick={onNavigateToOnlineApplies}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-[11px] shadow-md border border-rose-400 animate-bounce transition-all shrink-0 cursor-pointer"
                  title="New online admission application pending"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>{pendingApplicationsCount} New Applies</span>
                </button>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5 sm:gap-2 mt-0.5 font-medium truncate">
              <span className="flex items-center text-indigo-300 truncate"><MapPin className="w-3 h-3 mr-0.5 text-indigo-400 shrink-0" />{settings.address}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="hidden sm:flex items-center text-emerald-400"><Phone className="w-3 h-3 mr-1 text-emerald-400 shrink-0" />{settings.phone}</span>
            </p>
          </div>
        </div>

        {/* Live Clock & Quick Info */}
        <div className="hidden lg:flex items-center space-x-3 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/80 text-xs text-slate-200 shadow-inner shrink-0">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span className="font-mono font-bold text-white tracking-wider">{time}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-300 font-medium">{new Date().toLocaleDateString('en-PK', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
        </div>

        {/* Right Controls & Role Switcher */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          
          {/* User Profile Avatar / Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition transform active:scale-95 ${badge.color}`}
            >
              <BadgeIcon className="w-4 h-4" />
              <span>{badge.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80 ml-1" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl py-2 z-50 text-slate-100 overflow-hidden">
                <div className="px-4 py-2.5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Active User Session</p>
                    <p className="text-xs font-bold text-white mt-0.5">{currentUser?.name} <span className="font-mono font-normal text-indigo-300">(@{currentUser?.username})</span></p>
                  </div>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>

                <button
                  onClick={() => handleInitiateRoleSwitch('super_admin')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition ${currentRole === 'super_admin' ? 'bg-indigo-600/20 text-indigo-300 font-bold' : ''}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>Super Admin</span>
                        <span className="text-[9px] bg-purple-900/60 text-purple-300 px-1.5 rounded font-mono font-normal">Pass Protected</span>
                      </p>
                      <p className="text-[10px] text-slate-400">Full Access ({settings.ownerName || 'Owner'})</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInitiateRoleSwitch('accountant')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition ${currentRole === 'accountant' ? 'bg-emerald-600/20 text-emerald-300 font-bold' : ''}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Accountant</p>
                      <p className="text-[10px] text-slate-400">Fees, Admissions & Receipts</p>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleInitiateRoleSwitch('teacher')}
                  className={`w-full text-left px-4 py-3 flex items-center justify-between hover:bg-slate-800 transition ${currentRole === 'teacher' ? 'bg-blue-600/20 text-blue-300 font-bold' : ''}`}
                >
                  <div className="flex items-center space-x-2.5">
                    <BookOpenCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-white">Course Teacher</p>
                      <p className="text-[10px] text-slate-400">QR Attendance & Student Cards</p>
                    </div>
                  </div>
                </button>

                {onLogout && (
                  <div className="p-2 border-t border-slate-800 bg-slate-950/60">
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold flex items-center justify-between border border-rose-800/50 transition"
                    >
                      <div className="flex items-center space-x-2">
                        <LogOut className="w-3.5 h-3.5 text-rose-400" />
                        <span>Sign Out / Lock Screen</span>
                      </div>
                      <span className="text-[10px] opacity-70">Exit</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 bg-slate-800 hover:bg-rose-900/40 text-slate-300 hover:text-rose-300 rounded-xl border border-slate-700 hover:border-rose-700 transition font-bold"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>

      </div>

      {/* Marquee Announcement Bar */}
      {settings.marqueeText && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-semibold text-xs py-1.5 px-4 overflow-hidden border-t border-amber-600 shadow-inner flex items-center gap-3 relative z-10">
          <span className="bg-slate-950 text-amber-300 font-extrabold text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0 flex items-center gap-1 shadow-xs z-10">
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

      {/* LOGIN / AUTH VERIFICATION MODAL */}
      {targetRole && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 text-slate-900">
          <div className="bg-white border-2 border-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 relative">
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Authenticate Staff Login</h3>
                  <p className="text-xs text-slate-500 font-medium">Enter credentials for {targetRole.replace('_', ' ').toUpperCase()}</p>
                </div>
              </div>
              <button 
                onClick={() => setTargetRole(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl flex items-center space-x-2 text-xs font-bold text-rose-800">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleVerifyAuth} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={authUsername}
                  onChange={(e) => setAuthUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="Enter Password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTargetRole(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/30 flex items-center space-x-1.5 transition"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Log In & Switch Role</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </header>
  );
};


