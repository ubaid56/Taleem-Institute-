import React, { useState } from 'react';
import { StaffUser, InstituteSettings } from '../types';
import { Building2, Lock, User, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

interface LoginFormProps {
  users: StaffUser[];
  settings: InstituteSettings;
  onLoginSuccess: (user: StaffUser) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ users, settings, onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const matchedUser = users.find(u => u.username.toLowerCase() === cleanUsername);

    if (!matchedUser) {
      setError('User account not found. Please check username.');
      return;
    }

    if (matchedUser.hasLoginAccess === false) {
      setError('This staff account (Class 4 / Support) does not have portal login access enabled.');
      return;
    }

    const correctPassword = matchedUser.password || '123456';
    if (cleanPassword !== correctPassword) {
      setError('Incorrect password. Please try again.');
      return;
    }

    // Success!
    onLoginSuccess(matchedUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100 font-sans">
      
      {/* Background Decorative Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10 px-4">
        
        {/* Institute Logo & Branding */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-2xl mb-4">
          <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center overflow-hidden">
            {settings.logoUrl ? (
              <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-indigo-400" />
            )}
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          {settings.instituteName || 'Taleem Institute'}
        </h2>
        {settings.subTitle && (
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mt-1">
            {settings.subTitle}
          </p>
        )}
        <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-2">
          <span>📍 {settings.address || 'Dubai adda road Bakhshali'}</span>
          <span>•</span>
          <span>📞 {settings.phone || '03481064487'}</span>
        </p>

      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          <div className="mb-6 pb-4 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Staff Portal Access</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Enter authorized username & password</p>
            </div>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2 py-1 rounded-lg font-mono">
              Secure Auth
            </span>
          </div>

          {error && (
            <div className="mb-6 bg-rose-950/60 border border-rose-800/80 p-3.5 rounded-2xl flex items-center space-x-2.5 text-xs font-bold text-rose-300 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>Username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Password</span>
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-500/25 transition transform active:scale-95 flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Sign In to Dashboard</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  );
};

