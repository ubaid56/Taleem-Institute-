import React, { useState } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCcw, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  HardDrive,
  ShieldCheck
} from 'lucide-react';
import { 
  getCourses, saveCourses,
  getStudents, saveStudents,
  getTransactions, saveTransactions,
  getAttendance, saveAttendance,
  getUsers, saveUsers,
  getExpenses, saveExpenses,
  getSalaryRecords, saveSalaryRecords,
  getSettings, saveSettings,
  resetToDefaultData,
  wipeAllDataCompletely
} from '../lib/storage';
import { wipeAllFirestoreRecordsCompletely } from '../lib/firebase';
import { formatPKR } from '../lib/utils';

interface BackupManagerProps {
  showToast: (msg: string) => void;
  onRefreshData: () => void;
}

export const BackupManager: React.FC<BackupManagerProps> = ({ showToast, onRefreshData }) => {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showSecretWipeConfirm, setShowSecretWipeConfirm] = useState(false);
  const [wipeConfirmInput, setWipeConfirmInput] = useState('');

  const students = getStudents();
  const courses = getCourses();
  const transactions = getTransactions();
  const expenses = getExpenses();
  const salaryRecords = getSalaryRecords();
  const users = getUsers();
  const attendance = getAttendance();
  const settings = getSettings();

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amountPaid, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleExportJson = () => {
    try {
      const backupData = {
        version: '2.0',
        exportedAt: new Date().toISOString(),
        instituteName: settings.instituteName,
        settings,
        courses,
        students,
        transactions,
        attendance,
        users,
        expenses,
        salaryRecords
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `tist_institute_full_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      showToast('Full database JSON backup downloaded successfully!');
    } catch (err) {
      console.error(err);
      showToast('Failed to export JSON backup.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = event.target?.result as string;
        const parsed = JSON.parse(jsonContent);

        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON file format.');
        }

        if (parsed.settings) saveSettings(parsed.settings);
        if (Array.isArray(parsed.courses)) saveCourses(parsed.courses);
        if (Array.isArray(parsed.students)) saveStudents(parsed.students);
        if (Array.isArray(parsed.transactions)) saveTransactions(parsed.transactions);
        if (Array.isArray(parsed.attendance)) saveAttendance(parsed.attendance);
        if (Array.isArray(parsed.users)) saveUsers(parsed.users);
        if (Array.isArray(parsed.expenses)) saveExpenses(parsed.expenses);
        if (Array.isArray(parsed.salaryRecords)) saveSalaryRecords(parsed.salaryRecords);

        setImportStatus('Database restored successfully from JSON backup!');
        showToast('Database successfully restored!');
        onRefreshData();
      } catch (err: any) {
        console.error(err);
        setImportStatus(`Restore failed: ${err.message || 'Invalid backup file'}`);
        showToast('Failed to restore database from file.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemo = () => {
    resetToDefaultData();
    setShowResetConfirm(false);
    showToast('Database reset to initial demo state.');
    onRefreshData();
  };

  const handleSecretWipeDatabase = async () => {
    if (wipeConfirmInput.trim().toUpperCase() !== 'DELETE ALL') {
      alert('Please type "DELETE ALL" exactly to confirm complete database erasure.');
      return;
    }
    try {
      wipeAllDataCompletely();
      await wipeAllFirestoreRecordsCompletely();
      setShowSecretWipeConfirm(false);
      setWipeConfirmInput('');
      showToast('SECRET WIPE SUCCESSFUL: All students, fees, expenses & profit/loss records erased!');
      onRefreshData();
    } catch (err) {
      console.error(err);
      showToast('Failed to wipe database.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 text-[#1A1A1A]">
      
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0">
            <Database className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">Database Backup & Restore Module</h2>
            <p className="text-[10px] sm:text-xs text-[#1A1A1A]/70 uppercase tracking-widest font-bold mt-0.5">
              Taleem Institute Management System • Local & Cloud Sync Backup Center
            </p>
          </div>
        </div>

        <button
          onClick={handleExportJson}
          className="w-full md:w-auto justify-center px-5 py-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest shadow-md flex items-center space-x-2 transition shrink-0"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Download Full JSON Backup</span>
        </button>
      </div>

      {/* Database Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/70">Total Students</p>
          <p className="text-2xl font-black font-mono text-[#1A1A1A] mt-1">{students.length}</p>
        </div>
        <div className="bg-white border-2 border-[#1A1A1A] p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-[#1A1A1A]/70">Active Courses</p>
          <p className="text-2xl font-black font-mono text-[#1A1A1A] mt-1">{courses.length}</p>
        </div>
        <div className="bg-white border-2 border-[#1A1A1A] p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-800">Total Collections</p>
          <p className="text-xl font-black font-mono text-emerald-800 mt-1">{formatPKR(totalRevenue)}</p>
        </div>
        <div className="bg-white border-2 border-[#1A1A1A] p-4">
          <p className="text-[10px] uppercase font-bold tracking-widest text-rose-800">Total Expenses</p>
          <p className="text-xl font-black font-mono text-rose-800 mt-1">{formatPKR(totalExpenses)}</p>
        </div>
      </div>

      {/* Main Backup & Restore Operations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Export Card */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#1A1A1A]">
              <div className="p-2 bg-[#F4F2EE] border border-[#1A1A1A] text-[#1A1A1A]">
                <FileJson className="w-5 h-5" />
              </div>
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">Export Database Snapshot</h3>
            </div>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-medium">
              Download a complete JSON file containing all students, courses, fee transactions, attendance logs, staff users, payroll records, and institute settings.
            </p>
            <div className="p-3 bg-[#F4F2EE] border border-[#1A1A1A] text-[11px] font-mono text-[#1A1A1A] space-y-1">
              <p>• Format: Standard JSON (.json)</p>
              <p>• Auto-Export: Enabled on General Settings save</p>
              <p>• Includes: {students.length} students, {transactions.length} fee vouchers, {users.length} staff users</p>
            </div>
          </div>

          <button
            onClick={handleExportJson}
            className="w-full py-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest flex items-center justify-center space-x-2 transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Database JSON</span>
          </button>
        </div>

        {/* Import / Restore Card */}
        <div className="bg-white border-2 border-[#1A1A1A] p-6 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#1A1A1A]">
              <div className="p-2 bg-[#F4F2EE] border border-[#1A1A1A] text-[#1A1A1A]">
                <Upload className="w-5 h-5" />
              </div>
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">Restore from JSON Backup</h3>
            </div>
            <p className="text-xs text-[#1A1A1A]/80 leading-relaxed font-medium">
              Upload a previously exported JSON backup file to restore all institute records and settings instantly.
            </p>

            <div className="pt-2">
              <label className="block w-full border-2 border-dashed border-[#1A1A1A] p-6 text-center cursor-pointer hover:bg-[#F4F2EE] transition">
                <Upload className="w-8 h-8 mx-auto text-[#1A1A1A] mb-2" />
                <span className="text-xs font-bold uppercase tracking-wider block text-[#1A1A1A]">Click to upload JSON backup file</span>
                <span className="text-[10px] text-[#1A1A1A]/60 block mt-1">Supports all .json backup exports</span>
                <input
                  type="file"
                  accept=".json,application/json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus && (
              <div className="p-3 bg-emerald-50 border border-emerald-700 text-xs font-bold text-emerald-900 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{importStatus}</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Advanced Reset Section */}
      <div className="bg-white border-2 border-rose-800 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-rose-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-rose-100 text-rose-800 border border-rose-800">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-lg text-rose-900">Danger Zone: Reset Demo Data</h3>
              <p className="text-xs text-rose-700 font-medium">Reset all records back to default sample institute data.</p>
            </div>
          </div>

          {!showResetConfirm ? (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="px-4 py-2.5 bg-rose-800 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest transition"
            >
              Reset to Defaults
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={handleResetDemo}
                className="px-4 py-2 bg-rose-900 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-800"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 bg-slate-200 text-slate-800 font-bold text-xs uppercase tracking-wider hover:bg-slate-300"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* SUPER ADMIN SECRET CLEAR ALL DATABASE BUTTON */}
      <div className="bg-slate-950 border-4 border-red-600 p-6 shadow-2xl text-white space-y-4 rounded-none">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-red-900">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-red-600 text-white font-black text-xl border border-red-400">
              ⚡
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="bg-red-600 text-white text-[9px] px-2 py-0.5 font-mono uppercase font-black tracking-widest">
                  SECRET SUPER ADMIN ACTION
                </span>
                <span className="text-slate-400 text-[10px] uppercase font-bold font-mono">
                  CLASSIFIED
                </span>
              </div>
              <h3 className="font-serif italic font-extrabold text-xl text-red-400 mt-1">
                Clear All Database Records
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Wipe ALL student records, fee vouchers, profit & loss, expenses, payroll, and attendance logs. Leaves a clean empty database ready for production usage.
              </p>
            </div>
          </div>

          {!showSecretWipeConfirm ? (
            <button
              onClick={() => setShowSecretWipeConfirm(true)}
              className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-widest border-2 border-red-400 shadow-lg transition shrink-0"
            >
              🗑️ Clear Entire Database
            </button>
          ) : (
            <div className="bg-red-950/90 border-2 border-red-500 p-4 space-y-3 w-full md:w-auto">
              <p className="text-xs font-bold text-red-200 uppercase tracking-wider">
                ⚠️ WARNING: THIS CANNOT BE UNDONE!
              </p>
              <p className="text-[11px] text-slate-300 font-mono">
                Type <strong className="text-white underline font-extrabold">DELETE ALL</strong> below to authorize complete database wipe:
              </p>
              <input
                type="text"
                value={wipeConfirmInput}
                onChange={(e) => setWipeConfirmInput(e.target.value)}
                placeholder="Type DELETE ALL here"
                className="w-full bg-black border border-red-500 px-3 py-1.5 text-xs text-red-300 font-mono font-bold focus:outline-none"
              />
              <div className="flex items-center space-x-2 pt-1">
                <button
                  onClick={handleSecretWipeDatabase}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider transition"
                >
                  Yes, Permanently Clear All Database
                </button>
                <button
                  onClick={() => { setShowSecretWipeConfirm(false); setWipeConfirmInput(''); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
