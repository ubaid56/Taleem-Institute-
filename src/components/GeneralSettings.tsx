import React, { useState } from 'react';
import { InstituteSettings } from '../types';
import { DEFAULT_SETTINGS } from '../data/initialData';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { 
  getCourses,
  getStudents,
  getTransactions,
  getAttendance,
  getUsers,
  getExpenses,
  getSalaryRecords
} from '../lib/storage';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Image as ImageIcon, 
  Upload, 
  Check, 
  RotateCcw, 
  Receipt, 
  GraduationCap, 
  Globe, 
  Sparkles,
  ShieldCheck,
  FileCheck2,
  Download,
  Database
} from 'lucide-react';

interface GeneralSettingsProps {
  settings: InstituteSettings;
  onSaveSettings: (updated: InstituteSettings) => void;
}

export const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<InstituteSettings>(settings);
  const [isSaved, setIsSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleChange = (field: keyof InstituteSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsSaved(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Image file size should be less than 2MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, logoUrl: reader.result as string }));
        setIsSaved(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const exportDatabaseJson = () => {
    const dbState = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      settings: formData,
      courses: getCourses(),
      students: getStudents(),
      transactions: getTransactions(),
      attendance: getAttendance(),
      users: getUsers(),
      expenses: getExpenses(),
      salaryRecords: getSalaryRecords(),
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dbState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tist_database_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    // Automatically export JSON database backup to browser's download folder when General Settings are updated
    exportDatabaseJson();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const executeReset = () => {
    setFormData(DEFAULT_SETTINGS);
    onSaveSettings(DEFAULT_SETTINGS);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      
      {/* Colorful Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 rounded-3xl p-4 sm:p-8 text-white shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 p-0.5 shadow-lg flex items-center justify-center shrink-0">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-white">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-400" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Global Configuration
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1">
                Institute & Branding Settings
              </h1>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Manage your Institute name, logo, official address, WhatsApp contact & thermal receipt settings.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white rounded-xl text-xs font-bold transition border border-slate-700 flex items-center space-x-2 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Defaults</span>
            </button>
            
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center space-x-2 transition transform hover:-translate-y-0.5"
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <Sparkles className="w-4 h-4" />}
              <span>{isSaved ? 'Saved Successfully!' : 'Save All Settings'}</span>
            </button>
          </div>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Settings Form Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card 1: Logo & Branding */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Institute Logo & Visual Identity</h2>
                <p className="text-xs text-slate-500">Upload your institute emblem or logo for cards & thermal invoices</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              <div className="relative group shrink-0">
                <div className="w-24 h-24 rounded-2xl bg-white border-2 border-slate-200 flex items-center justify-center p-2 shadow-sm overflow-hidden">
                  {formData.logoUrl ? (
                    <img src={formData.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <GraduationCap className="w-10 h-10 text-indigo-600 mb-1" />
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Default Logo</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3 text-center sm:text-left flex-1">
                <div>
                  <h3 className="font-bold text-xs text-slate-800">Upload Custom Institute Logo</h3>
                  <p className="text-[11px] text-slate-500">Recommended PNG or JPG image with transparent or white background. Max size 2MB.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <label className="cursor-pointer px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center space-x-2 transition">
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      className="hidden" 
                    />
                  </label>

                  {formData.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', '')}
                      className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition border border-rose-200"
                    >
                      Remove Logo
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Institute Contact & Address */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Institute Name & Contact Address</h2>
                <p className="text-xs text-slate-500">Information displayed on thermal POS receipts, reports, & ID cards</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Institute Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.instituteName}
                    onChange={(e) => handleChange('instituteName', e.target.value)}
                    placeholder="e.g. Taleem Institute"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={formData.subTitle}
                  onChange={(e) => handleChange('subTitle', e.target.value)}
                  placeholder="e.g. OF SCIENCE & TECHNOLOGY"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Complete Campus Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="e.g. Dubai adda road Bakhshali"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Phone / WhatsApp Contact *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="e.g. 03481064487"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Official Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="e.g. info@tist.edu.pk"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Owner / Administrator Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) => handleChange('ownerName', e.target.value)}
                    placeholder="e.g. Ubaid Ahmad"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Board / Reg Number
                </label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={formData.registrationNo || ''}
                    onChange={(e) => handleChange('registrationNo', e.target.value)}
                    placeholder="e.g. REG-2026/TIST/99"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: POS & Thermal Printer Preferences */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Thermal Receipt & Currency Settings</h2>
                <p className="text-xs text-slate-500">Customize the printed receipt layout & currency representation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Currency Symbol
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol}
                  onChange={(e) => handleChange('currencySymbol', e.target.value)}
                  placeholder="e.g. Rs. or PKR"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Receipt Footer Thank You Message
                </label>
                <input
                  type="text"
                  value={formData.receiptFooterNote}
                  onChange={(e) => handleChange('receiptFooterNote', e.target.value)}
                  placeholder="Thank you for your prompt fee submission!"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Card 4: Database Backup & Export Module */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
            <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-base text-slate-900">Database Backup & JSON Export</h2>
                <p className="text-xs text-slate-500">Manual backup & auto-export configuration</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <h3 className="text-xs font-bold text-slate-800">Instant Full JSON Database Backup</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Downloads a complete JSON snapshot of all students, courses, fee transactions, attendance, staff, and settings. Also auto-exports on every Settings save.
                </p>
              </div>
              <button
                type="button"
                onClick={exportDatabaseJson}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-2 shrink-0 transition"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Backup</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Live Mockup Preview */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-slate-800 space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <FileCheck2 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Live Brand Preview</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold uppercase">
                POS Mockup
              </span>
            </div>

            {/* Thermal POS Header Mockup */}
            <div className="bg-white text-black p-4 rounded-xl font-mono text-center shadow-lg border border-slate-300 space-y-1">
              <div className="border-b border-black pb-2 mb-2">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">STUDENT COPY</span>
              </div>
              
              <div className="flex justify-center mb-1">
                {formData.logoUrl ? (
                  <img src={formData.logoUrl} alt="Preview Logo" className="w-10 h-10 object-contain" />
                ) : (
                  <div className="w-10 h-10 bg-indigo-950 text-white flex items-center justify-center font-bold text-xs rounded-full">
                    TIST
                  </div>
                )}
              </div>

              <h4 className="font-extrabold text-xs uppercase tracking-tight">
                {formData.instituteName || 'Taleem Institute'}
              </h4>
              {formData.subTitle && (
                <p className="text-[9px] font-bold text-slate-800">{formData.subTitle}</p>
              )}
              <p className="text-[9px] font-semibold text-slate-700">{formData.address || 'Address here'}</p>
              <p className="text-[9px] font-bold text-slate-900">Ph: {formData.phone || '0300-XXXXXXX'}</p>
              {formData.ownerName && (
                <p className="text-[8px] italic text-slate-600">Owner: {formData.ownerName}</p>
              )}

              <div className="border-t border-b border-dashed border-black py-1.5 my-2 text-[9px] text-left">
                <p>Receipt #: <span className="font-bold">RCP-2026-9081</span></p>
                <p>Student: <span className="font-bold">Muhammad Ali</span></p>
                <p>Course: <span className="font-bold">DIT Batch 2026</span></p>
                <p>Amount Paid: <span className="font-bold">{formData.currencySymbol || 'PKR'} 5,000</span></p>
              </div>

              <p className="text-[8px] text-slate-600 pt-1">
                {formData.receiptFooterNote || 'Thank you!'}
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl p-4 border border-slate-800/80 space-y-2 text-xs text-slate-300">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-[11px] uppercase tracking-wider">
                <Check className="w-4 h-4" />
                <span>Automatic Dynamic Propagation</span>
              </div>
              <p className="text-[11px] leading-relaxed text-slate-400">
                Any changes made here instantly update the header bar, student QR ID cards, POS thermal receipts, and daily attendance PDFs across the entire institute portal!
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-500/20 flex items-center justify-center space-x-2 transition uppercase tracking-wider"
            >
              <Sparkles className="w-4 h-4" />
              <span>Apply & Save Changes</span>
            </button>
          </div>
        </div>

      </form>

      {/* Confirm Reset Settings Modal */}
      <ConfirmDeleteModal
        isOpen={showResetConfirm}
        title="Reset Settings to Default"
        message="Are you sure you want to reset all institute branding, contact details, and receipt notes back to system defaults?"
        confirmText="Reset to Defaults"
        onConfirm={() => {
          executeReset();
          setShowResetConfirm(false);
        }}
        onClose={() => setShowResetConfirm(false)}
      />

    </div>
  );
};
