import React, { useState } from 'react';
import { StaffUser, StaffSalaryRecord, SalaryPaymentType, UserRole, PaymentSource, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { StaffThermalReceipt } from './StaffThermalReceipt';
import { 
  DollarSign, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  UserCheck, 
  Wallet, 
  FileText, 
  Printer, 
  X, 
  TrendingUp, 
  CheckCircle2,
  AlertCircle,
  CreditCard,
  UserPlus
} from 'lucide-react';

interface StaffPayrollManagerProps {
  staffList: StaffUser[];
  salaryRecords: StaffSalaryRecord[];
  currentRole: UserRole;
  userPermissions?: StaffUser['permissions'];
  currentUserName: string;
  settings: InstituteSettings;
  onAddSalaryRecord: (record: Omit<StaffSalaryRecord, 'id' | 'createdAt'>) => void;
  onDeleteSalaryRecord: (id: string) => void;
  onUpdateStaffBaseSalary: (staffId: string, newBaseSalary: number) => void;
}

export const StaffPayrollManager: React.FC<StaffPayrollManagerProps> = ({
  staffList,
  salaryRecords,
  currentRole,
  userPermissions,
  currentUserName,
  settings,
  onAddSalaryRecord,
  onDeleteSalaryRecord,
  onUpdateStaffBaseSalary,
}) => {
  const isSuperAdmin = currentRole === 'super_admin';

  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [searchQuery, setSearchQuery] = useState('');
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedStaffForLedger, setSelectedStaffForLedger] = useState<StaffUser | null>(null);
  const [selectedRecordForThermal, setSelectedRecordForThermal] = useState<StaffSalaryRecord | null>(null);

  // Form state for payment/advance
  const [targetStaffId, setTargetStaffId] = useState<string>(staffList[0]?.id || '');
  const [paymentType, setPaymentType] = useState<SalaryPaymentType>('salary');
  const [amount, setAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('cash');
  const [notes, setNotes] = useState('');

  // Editing base salary inline
  const [editingBaseSalaryStaffId, setEditingBaseSalaryStaffId] = useState<string | null>(null);
  const [tempBaseSalary, setTempBaseSalary] = useState<string>('');

  // Filter staff members
  const filteredStaff = staffList.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.includes(searchQuery)
  );

  // Monthly aggregated totals
  const monthlySalaryRecords = salaryRecords.filter(r => r.monthYear === selectedMonth);
  
  const totalBaseSalaryPool = staffList.reduce((sum, s) => sum + (s.baseSalary || 0), 0);
  const totalAdvancePaidThisMonth = monthlySalaryRecords
    .filter(r => r.type === 'advance')
    .reduce((sum, r) => sum + r.amount, 0);
  
  const totalRegularPaidThisMonth = monthlySalaryRecords
    .filter(r => r.type === 'salary')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalPayrollDisbursed = totalAdvancePaidThisMonth + totalRegularPaidThisMonth;

  // Helper to get staff monthly breakdown
  const getStaffMonthlyStats = (staffId: string, baseSal: number = 0) => {
    const records = monthlySalaryRecords.filter(r => r.staffId === staffId);
    const advanceTaken = records.filter(r => r.type === 'advance').reduce((sum, r) => sum + r.amount, 0);
    const salaryPaid = records.filter(r => r.type === 'salary').reduce((sum, r) => sum + r.amount, 0);
    const netBalanceDue = Math.max(0, baseSal - (advanceTaken + salaryPaid));

    return { records, advanceTaken, salaryPaid, netBalanceDue };
  };

  const handleOpenPayModal = (staffId?: string, type: SalaryPaymentType = 'salary') => {
    if (staffId) setTargetStaffId(staffId);
    setPaymentType(type);
    setShowPayModal(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    const staff = staffList.find(s => s.id === targetStaffId);

    if (!staff) {
      alert('Please select a staff member.');
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    const newRecordId = 'sal_' + Date.now();
    const newRecord: StaffSalaryRecord = {
      id: newRecordId,
      staffId: staff.id,
      staffName: staff.name,
      role: staff.role,
      type: paymentType,
      monthYear: selectedMonth,
      amount: numAmount,
      paymentDate,
      paymentSource,
      notes: notes.trim() || undefined,
      recordedBy: currentUserName,
      createdAt: new Date().toISOString(),
    };

    onAddSalaryRecord(newRecord);

    // Auto open thermal receipt for printing
    setSelectedRecordForThermal(newRecord);

    // Reset Form
    setAmount('');
    setNotes('');
    setShowPayModal(false);
  };

  const handleSaveBaseSalary = (staffId: string) => {
    const num = parseFloat(tempBaseSalary);
    if (!isNaN(num) && num >= 0) {
      onUpdateStaffBaseSalary(staffId, num);
    }
    setEditingBaseSalaryStaffId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Header Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-emerald-800 text-white flex items-center justify-center shrink-0 border border-emerald-950">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#1A1A1A] uppercase tracking-wide">
              Staff Salaries & Advance Management
            </h1>
            <p className="text-xs text-[#1A1A1A]/70 font-mono">
              Track base salaries, advance salary loans, regular payouts, and individual monthly pay reports
            </p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            onClick={() => handleOpenPayModal(undefined, 'salary')}
            className="w-full sm:w-auto px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase tracking-widest border border-emerald-950 flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Disburse Salary / Advance</span>
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Total Monthly Base Salary Pool</span>
          <p className="text-2xl font-black font-mono text-[#1A1A1A] mt-1">{formatPKR(totalBaseSalaryPool)}</p>
          <p className="text-[11px] text-[#1A1A1A]/60 font-bold mt-1">{staffList.length} Active Staff Members</p>
        </div>

        <div className="bg-amber-50 border-2 border-amber-800 p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">Advances Paid ({selectedMonth})</span>
          <p className="text-2xl font-black font-mono text-amber-950 mt-1">{formatPKR(totalAdvancePaidThisMonth)}</p>
          <p className="text-[11px] text-amber-900 font-bold mt-1">Advance Salary Payments</p>
        </div>

        <div className="bg-emerald-50 border-2 border-emerald-800 p-4 shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">Regular Salaries Paid ({selectedMonth})</span>
          <p className="text-2xl font-black font-mono text-emerald-950 mt-1">{formatPKR(totalRegularPaidThisMonth)}</p>
          <p className="text-[11px] text-emerald-900 font-bold mt-1">Net Monthly Salary Payouts</p>
        </div>

        <div className="bg-[#1A1A1A] text-white p-4 border-2 border-[#1A1A1A] shadow-sm">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Total Payroll Disbursed</span>
          <p className="text-2xl font-black font-mono mt-1 text-emerald-400">{formatPKR(totalPayrollDisbursed)}</p>
          <p className="text-[11px] text-white/60 font-bold mt-1">Salaries + Advances in {selectedMonth}</p>
        </div>
      </div>

      {/* Filter and Month Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#1A1A1A]/50 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name or role..."
            className="w-full sm:w-64 bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#1A1A1A]/70 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Selected Payroll Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none"
          />
        </div>
      </div>

      {/* Staff Payroll Cards (Mobile) */}
      <div className="block lg:hidden space-y-3">
        {filteredStaff.map((staff) => {
          const stats = getStaffMonthlyStats(staff.id, staff.baseSalary);

          return (
            <div key={staff.id} className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm uppercase text-[#1A1A1A]">{staff.name}</h4>
                  <p className="text-xs text-[#1A1A1A]/70 font-mono">Role: {staff.role.toUpperCase()} • {staff.phone}</p>
                </div>
                
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase border bg-[#F4F2EE] border-[#1A1A1A]">
                  Base: {formatPKR(staff.baseSalary || 0)}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] font-mono">
                <div>
                  <p className="text-[9px] uppercase font-bold text-amber-900">Advance Taken</p>
                  <p className="font-bold text-amber-900">{formatPKR(stats.advanceTaken)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-emerald-900">Salary Paid</p>
                  <p className="font-bold text-emerald-900">{formatPKR(stats.salaryPaid)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Remaining Due</p>
                  <p className="font-black text-[#1A1A1A]">{formatPKR(stats.netBalanceDue)}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedStaffForLedger(staff)}
                  className="px-3 py-1.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] font-bold text-xs uppercase tracking-wider border border-[#1A1A1A] flex items-center space-x-1 transition"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>View Report</span>
                </button>

                {isSuperAdmin && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenPayModal(staff.id, 'advance')}
                      className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] uppercase tracking-wider border border-amber-950 transition"
                    >
                      + Advance
                    </button>
                    <button
                      onClick={() => handleOpenPayModal(staff.id, 'salary')}
                      className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] uppercase tracking-wider border border-emerald-950 transition"
                    >
                      + Pay Salary
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Staff Payroll Table (Desktop) */}
      <div className="hidden lg:block bg-white border-2 border-[#1A1A1A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EE] border-b-2 border-[#1A1A1A] text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]">
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Role / Contact</th>
                <th className="py-3 px-4 text-right">Base Salary</th>
                <th className="py-3 px-4 text-right text-amber-900">Advance Taken ({selectedMonth})</th>
                <th className="py-3 px-4 text-right text-emerald-900">Salary Paid ({selectedMonth})</th>
                <th className="py-3 px-4 text-right">Net Balance Due</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10 text-xs font-mono">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                    No staff members found matching search query.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => {
                  const stats = getStaffMonthlyStats(staff.id, staff.baseSalary);
                  const isEditingSalary = editingBaseSalaryStaffId === staff.id;

                  return (
                    <tr key={staff.id} className="hover:bg-[#F4F2EE]/40 transition">
                      <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">{staff.name}</td>
                      <td className="py-3 px-4 text-[#1A1A1A]/80">
                        <span className="font-bold text-[10px] px-2 py-0.5 bg-[#F4F2EE] border border-[#1A1A1A] uppercase mr-2">
                          {staff.role}
                        </span>
                        <span>{staff.phone}</span>
                      </td>

                      {/* Base Salary Cell */}
                      <td className="py-3 px-4 text-right font-bold text-[#1A1A1A]">
                        {isEditingSalary ? (
                          <div className="flex items-center justify-end space-x-1">
                            <input
                              type="number"
                              value={tempBaseSalary}
                              onChange={(e) => setTempBaseSalary(e.target.value)}
                              className="w-24 bg-white border border-[#1A1A1A] p-1 text-right font-mono focus:outline-none"
                            />
                            <button
                              onClick={() => handleSaveBaseSalary(staff.id)}
                              className="px-2 py-1 bg-emerald-800 text-white font-bold text-[10px] uppercase"
                            >
                              Save
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <span>{formatPKR(staff.baseSalary || 0)}</span>
                            {isSuperAdmin && (
                              <button
                                onClick={() => {
                                  setEditingBaseSalaryStaffId(staff.id);
                                  setTempBaseSalary(String(staff.baseSalary || 0));
                                }}
                                className="text-[9px] uppercase font-bold text-blue-800 underline ml-1 hover:text-blue-900"
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right font-black text-amber-900">{formatPKR(stats.advanceTaken)}</td>
                      <td className="py-3 px-4 text-right font-black text-emerald-900">{formatPKR(stats.salaryPaid)}</td>
                      <td className="py-3 px-4 text-right font-black text-[#1A1A1A] text-sm">{formatPKR(stats.netBalanceDue)}</td>

                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setSelectedStaffForLedger(staff)}
                            className="px-2.5 py-1.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] font-bold text-[11px] uppercase tracking-wider flex items-center space-x-1 transition"
                            title="View Staff Salary Report & Slip"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Report</span>
                          </button>

                          {isSuperAdmin && (
                            <>
                              <button
                                onClick={() => handleOpenPayModal(staff.id, 'advance')}
                                className="px-2.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white font-bold text-[11px] uppercase tracking-wider border border-amber-950 transition"
                                title="Give Advance Salary"
                              >
                                + Advance
                              </button>
                              <button
                                onClick={() => handleOpenPayModal(staff.id, 'salary')}
                                className="px-2.5 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-[11px] uppercase tracking-wider border border-emerald-950 transition"
                                title="Pay Regular Monthly Salary"
                              >
                                + Pay Salary
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disburse Salary / Advance Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFCFB] border-2 border-[#1A1A1A] w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-emerald-800" />
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] uppercase">
                  {paymentType === 'advance' ? 'Record Advance Salary Payment' : 'Disburse Regular Monthly Salary'}
                </h3>
              </div>
              <button
                onClick={() => setShowPayModal(false)}
                className="p-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs font-bold text-[#1A1A1A]">
              
              <div>
                <label className="block uppercase tracking-wider mb-1">Select Staff Member *</label>
                <select
                  value={targetStaffId}
                  onChange={(e) => setTargetStaffId(e.target.value)}
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 focus:outline-none font-bold text-xs"
                >
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.role.toUpperCase()}) — Base Salary: {formatPKR(s.baseSalary || 0)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Payment Category</label>
                  <select
                    value={paymentType}
                    onChange={(e) => setPaymentType(e.target.value as SalaryPaymentType)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="salary">💵 Regular Salary Payout</option>
                    <option value="advance">⚠️ Advance Salary Loan</option>
                  </select>
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Payroll Month</label>
                  <input
                    type="month"
                    required
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Amount (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono font-bold text-base focus:outline-none text-emerald-800"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Payment Source</label>
                <select
                  value={paymentSource}
                  onChange={(e) => setPaymentSource(e.target.value as PaymentSource)}
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 font-bold focus:outline-none"
                >
                  <option value="cash">💵 Cash Payment</option>
                  <option value="bank">🏦 Bank Transfer / Cheque</option>
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Notes / Reason for Advance (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder={paymentType === 'advance' ? 'e.g. Advance requested for emergency medical expenses' : 'Monthly salary disbursement remarks...'}
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#1A1A1A] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  className="px-4 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] uppercase tracking-wider font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-emerald-800 hover:bg-emerald-900 text-white border border-emerald-950 uppercase tracking-wider font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Payment</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Staff Individual Salary Ledger & Report Modal */}
      {selectedStaffForLedger && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border-2 border-[#1A1A1A] w-full max-w-2xl p-6 shadow-2xl space-y-5 my-8 text-[#1A1A1A]">
            
            {/* Header */}
            <div className="text-center border-b-2 border-[#1A1A1A] pb-3 space-y-1">
              <h2 className="font-serif italic font-bold text-xl uppercase tracking-wider">{settings.instituteName}</h2>
              <p className="text-[10px] font-mono text-[#1A1A1A]/70 uppercase font-bold">{settings.subTitle} • {settings.phone}</p>
              <div className="mt-2 inline-block bg-[#1A1A1A] text-white px-4 py-1 font-mono text-xs uppercase font-bold">
                STAFF SALARY STATEMENT & PAYSLIP ({selectedMonth})
              </div>
            </div>

            {/* Staff Info Card */}
            <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div>
                <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/60">Staff Member Name</p>
                <p className="font-bold text-sm uppercase text-[#1A1A1A]">{selectedStaffForLedger.name}</p>
                <p className="text-xs text-[#1A1A1A]/80 font-bold mt-0.5">Role: {selectedStaffForLedger.role.toUpperCase()}</p>
              </div>

              <div>
                <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/60">Contact & Email</p>
                <p className="font-bold text-[#1A1A1A]">{selectedStaffForLedger.phone}</p>
                <p className="text-[11px] text-[#1A1A1A]/70">{selectedStaffForLedger.email}</p>
              </div>
            </div>

            {/* Financial Ledger Summary */}
            {(() => {
              const stats = getStaffMonthlyStats(selectedStaffForLedger.id, selectedStaffForLedger.baseSalary);

              return (
                <div className="space-y-4">
                  
                  <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                    <div className="bg-white p-2.5 border border-[#1A1A1A]">
                      <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Base Salary</p>
                      <p className="font-bold text-sm">{formatPKR(selectedStaffForLedger.baseSalary || 0)}</p>
                    </div>

                    <div className="bg-amber-50 p-2.5 border border-amber-800 text-amber-900">
                      <p className="text-[9px] uppercase font-bold">Advance Taken</p>
                      <p className="font-black text-sm">{formatPKR(stats.advanceTaken)}</p>
                    </div>

                    <div className="bg-emerald-50 p-2.5 border border-emerald-800 text-emerald-900">
                      <p className="text-[9px] uppercase font-bold">Salary Paid</p>
                      <p className="font-black text-sm">{formatPKR(stats.salaryPaid)}</p>
                    </div>

                    <div className="bg-[#1A1A1A] p-2.5 text-white">
                      <p className="text-[9px] uppercase font-bold text-white/80">Net Payable</p>
                      <p className="font-black text-sm text-emerald-400">{formatPKR(stats.netBalanceDue)}</p>
                    </div>
                  </div>

                  {/* Payment Records History Table */}
                  <div className="border border-[#1A1A1A]">
                    <div className="bg-[#F4F2EE] px-3 py-2 border-b border-[#1A1A1A] font-bold text-xs uppercase tracking-wider flex justify-between">
                      <span>Salary & Advance Transaction Ledger ({selectedMonth})</span>
                      <span className="font-mono">{stats.records.length} Transactions</span>
                    </div>

                    {stats.records.length === 0 ? (
                      <p className="p-4 text-center text-xs font-mono text-[#1A1A1A]/60 italic">
                        No transactions recorded for this staff member in {selectedMonth}.
                      </p>
                    ) : (
                      <table className="w-full text-left font-mono text-xs">
                        <thead>
                          <tr className="border-b border-[#1A1A1A]/20 bg-[#FDFCFB] text-[10px] uppercase font-bold">
                            <th className="py-2 px-3">Date</th>
                            <th className="py-2 px-3">Type</th>
                            <th className="py-2 px-3">Method</th>
                            <th className="py-2 px-3">Notes</th>
                            <th className="py-2 px-3 text-right">Amount</th>
                            {isSuperAdmin && <th className="py-2 px-3 text-center">Delete</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1A1A1A]/10">
                          {stats.records.map((rec) => (
                            <tr key={rec.id}>
                              <td className="py-2 px-3">{rec.paymentDate}</td>
                              <td className="py-2 px-3">
                                <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase border ${
                                  rec.type === 'advance' 
                                    ? 'bg-amber-100 text-amber-900 border-amber-300' 
                                    : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                }`}>
                                  {rec.type}
                                </span>
                              </td>
                              <td className="py-2 px-3 uppercase">{rec.paymentSource}</td>
                              <td className="py-2 px-3 text-[11px] text-[#1A1A1A]/80">{rec.notes || '—'}</td>
                              <td className="py-2 px-3 text-right font-bold">{formatPKR(rec.amount)}</td>
                              <td className="py-2 px-3 text-center">
                                <div className="flex items-center justify-center space-x-1">
                                  <button
                                    onClick={() => setSelectedRecordForThermal(rec)}
                                    className="p-1 text-emerald-800 hover:bg-emerald-100 border border-emerald-800 rounded flex items-center space-x-1 px-1.5 py-0.5 text-[10px] font-bold"
                                    title="Print Thermal Slip"
                                  >
                                    <Printer className="w-3 h-3" />
                                    <span>Slip</span>
                                  </button>
                                  {isSuperAdmin && (
                                    <button
                                      onClick={() => {
                                        if (confirm(`Delete salary transaction of ${formatPKR(rec.amount)}?`)) {
                                          onDeleteSalaryRecord(rec.id);
                                        }
                                      }}
                                      className="p-1 text-rose-800 hover:bg-rose-100 rounded"
                                      title="Delete Record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                </div>
              );
            })()}

            {/* Signature Block */}
            <div className="pt-6 grid grid-cols-2 text-center text-[10px] font-bold uppercase font-mono border-t border-[#1A1A1A]">
              <div>
                <p className="text-[#1A1A1A]/50 mb-4">____________________</p>
                <p>Employee Signature ({selectedStaffForLedger.name})</p>
              </div>
              <div>
                <p className="text-[#1A1A1A]/50 mb-4">____________________</p>
                <p>Authorized Signatory (Finance / Owner)</p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A1A1A]">
              <button
                onClick={() => setSelectedStaffForLedger(null)}
                className="px-4 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-xs font-bold uppercase flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Full Statement</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Staff Salary/Advance 80mm Thermal Receipt Slip Modal */}
      {selectedRecordForThermal && (
        <StaffThermalReceipt
          record={selectedRecordForThermal}
          staff={staffList.find(s => s.id === selectedRecordForThermal.staffId)}
          settings={settings}
          onClose={() => setSelectedRecordForThermal(null)}
        />
      )}

    </div>
  );
};
