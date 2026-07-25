import React, { useState } from 'react';
import { Expense, ExpenseCategory, UserRole, StaffUser, PaymentSource, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { 
  Receipt, 
  Plus, 
  Trash2, 
  Search, 
  Calendar, 
  Tag, 
  Wallet, 
  Building2, 
  FileText, 
  Printer, 
  X, 
  TrendingDown, 
  CheckCircle2,
  Filter
} from 'lucide-react';

interface ExpenseManagerProps {
  expenses: Expense[];
  currentRole: UserRole;
  userPermissions?: StaffUser['permissions'];
  currentUserName: string;
  settings: InstituteSettings;
  onAddExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: ExpenseCategory[] = [
  'Rent',
  'Electricity & Utilities',
  'Internet & Phone',
  'Stationery & Printing',
  'Tea & Refreshments',
  'Maintenance & Repairs',
  'Marketing & Ads',
  'Other',
];

export const ExpenseManager: React.FC<ExpenseManagerProps> = ({
  expenses,
  currentRole,
  userPermissions,
  currentUserName,
  settings,
  onAddExpense,
  onDeleteExpense,
}) => {
  const isSuperAdmin = currentRole === 'super_admin';
  const canManage = isSuperAdmin || currentRole === 'accountant' || !!userPermissions?.canManageExpenses || !!userPermissions?.canViewFinancials;

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [printExpense, setPrintExpense] = useState<Expense | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Electricity & Utilities');
  const [amount, setAmount] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().substring(0, 10));
  const [paymentSource, setPaymentSource] = useState<PaymentSource>('cash');
  const [voucherNo, setVoucherNo] = useState<string>(`EXP-${Date.now().toString().slice(-6)}`);
  const [remarks, setRemarks] = useState('');

  // Filter expenses
  const filteredExpenses = expenses.filter((exp) => {
    const expMonth = exp.date.substring(0, 7);
    const matchesMonth = selectedMonth === 'all' || expMonth === selectedMonth;
    const matchesCategory = selectedCategory === 'all' || exp.category === selectedCategory;
    const matchesSearch = 
      exp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.voucherNo && exp.voucherNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.remarks && exp.remarks.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesMonth && matchesCategory && matchesSearch;
  });

  // Calculate totals
  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const cashAmount = filteredExpenses.filter(e => e.paymentSource === 'cash').reduce((sum, e) => sum + e.amount, 0);
  const bankAmount = filteredExpenses.filter(e => e.paymentSource === 'bank').reduce((sum, e) => sum + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid expense title and amount.');
      return;
    }

    onAddExpense({
      title: title.trim(),
      category,
      amount: numAmount,
      date,
      paymentSource,
      voucherNo: voucherNo.trim() || undefined,
      remarks: remarks.trim() || undefined,
      recordedBy: currentUserName,
    });

    // Reset Form
    setTitle('');
    setAmount('');
    setRemarks('');
    setVoucherNo(`EXP-${Date.now().toString().slice(-6)}`);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Header Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-800 text-white flex items-center justify-center shrink-0 border border-rose-950">
            <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#1A1A1A] uppercase tracking-wide">
              Institute Expenses & Vouchers
            </h1>
            <p className="text-[10px] sm:text-xs text-[#1A1A1A]/70 font-mono">
              Manage daily operational costs, bills, maintenance, and petty cash disbursements
            </p>
          </div>
        </div>

        {canManage && (
          <button
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto px-5 py-2.5 bg-rose-800 hover:bg-rose-900 text-white font-bold text-xs uppercase tracking-widest border border-rose-950 flex items-center justify-center space-x-2 transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        )}
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-rose-50 border-2 border-rose-800 p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-900">Total Expenses ({selectedMonth === 'all' ? 'All Time' : selectedMonth})</span>
            <TrendingDown className="w-4 h-4 text-rose-800" />
          </div>
          <p className="text-2xl font-black font-mono text-rose-950 mt-1">{formatPKR(totalFilteredAmount)}</p>
          <p className="text-[11px] text-rose-800 font-bold mt-1">{filteredExpenses.length} Expense Records</p>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Paid via Cash</span>
            <Wallet className="w-4 h-4 text-[#1A1A1A]/70" />
          </div>
          <p className="text-2xl font-black font-mono text-[#1A1A1A] mt-1">{formatPKR(cashAmount)}</p>
          <p className="text-[11px] text-[#1A1A1A]/60 font-bold mt-1">Petty Cash Payments</p>
        </div>

        <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#1A1A1A]">Paid via Bank / Cheque</span>
            <Building2 className="w-4 h-4 text-[#1A1A1A]/70" />
          </div>
          <p className="text-2xl font-black font-mono text-[#1A1A1A] mt-1">{formatPKR(bankAmount)}</p>
          <p className="text-[11px] text-[#1A1A1A]/60 font-bold mt-1">Bank Transfers & Cheques</p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-[#1A1A1A]/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses by title or voucher..."
              className="w-full pl-9 pr-3 py-2 bg-[#FDFCFB] border border-[#1A1A1A] text-xs font-mono text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none"
            />
          </div>

          {/* Month Selector */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs font-mono text-[#1A1A1A] focus:outline-none"
            />
            {selectedMonth !== 'all' && (
              <button
                onClick={() => setSelectedMonth('all')}
                className="text-[10px] uppercase font-bold text-blue-800 underline shrink-0"
              >
                All Months
              </button>
            )}
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-[#1A1A1A]/60 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Expenses List: Mobile Cards */}
      <div className="block lg:hidden space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="py-12 bg-white border-2 border-[#1A1A1A] text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-xs p-4 space-y-2">
            <Receipt className="w-8 h-8 mx-auto text-[#1A1A1A]/30" />
            <p>No expenses found matching the selected month and filter.</p>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div key={exp.id} className="bg-white border-2 border-[#1A1A1A] p-4 space-y-3 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 inline-block mb-1">
                    {exp.category}
                  </span>
                  <h4 className="font-bold text-sm text-[#1A1A1A] uppercase">{exp.title}</h4>
                  <p className="text-[11px] font-mono text-[#1A1A1A]/70">Voucher: {exp.voucherNo || 'N/A'}</p>
                </div>
                <p className="text-base font-black font-mono text-rose-800 shrink-0">{formatPKR(exp.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] font-mono">
                <div>
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Date & Source</p>
                  <p className="font-bold text-[#1A1A1A]">{exp.date}</p>
                  <p className="text-[10px] uppercase font-bold text-blue-900">{exp.paymentSource}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase font-bold text-[#1A1A1A]/70">Recorded By</p>
                  <p className="font-bold text-[#1A1A1A] truncate">{exp.recordedBy}</p>
                </div>
              </div>

              {exp.remarks && (
                <p className="text-xs text-[#1A1A1A]/80 italic bg-amber-50/50 p-2 border border-amber-200">
                  Note: {exp.remarks}
                </p>
              )}

              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => setPrintExpense(exp)}
                  className="px-3 py-1.5 bg-[#F4F2EE] hover:bg-white text-[#1A1A1A] text-xs font-bold uppercase tracking-wider border border-[#1A1A1A] flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Voucher</span>
                </button>

                {isSuperAdmin && (
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete expense "${exp.title}"?`)) {
                        onDeleteExpense(exp.id);
                      }
                    }}
                    className="p-1.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-800"
                    title="Delete Expense Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Expenses Desktop Table */}
      <div className="hidden lg:block bg-white border-2 border-[#1A1A1A] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F4F2EE] border-b-2 border-[#1A1A1A] text-[10px] font-black uppercase tracking-wider text-[#1A1A1A]">
                <th className="py-3 px-4">Voucher #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Expense Title</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Source</th>
                <th className="py-3 px-4 text-right">Amount (PKR)</th>
                <th className="py-3 px-4">Recorded By</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/10 text-xs font-mono">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                    No expenses found for the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-rose-50/30 transition">
                    <td className="py-3 px-4 font-bold text-[#1A1A1A]">{exp.voucherNo || '—'}</td>
                    <td className="py-3 px-4 text-[#1A1A1A]/80">{exp.date}</td>
                    <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">{exp.title}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-900 border border-rose-300 font-sans font-bold text-[10px] uppercase">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold uppercase text-blue-900">{exp.paymentSource}</td>
                    <td className="py-3 px-4 text-right font-black text-rose-800 text-sm">{formatPKR(exp.amount)}</td>
                    <td className="py-3 px-4 text-[#1A1A1A]/70">{exp.recordedBy}</td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setPrintExpense(exp)}
                          className="p-1.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] transition text-[#1A1A1A]"
                          title="Print Voucher"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        {isSuperAdmin && (
                          <button
                            onClick={() => {
                              if (confirm(`Delete expense "${exp.title}"?`)) {
                                onDeleteExpense(exp.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-800 hover:text-white text-rose-800 border border-rose-800 transition"
                            title="Delete Expense"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#FDFCFB] border-2 border-[#1A1A1A] w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3">
              <div className="flex items-center space-x-2">
                <Receipt className="w-5 h-5 text-rose-800" />
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] uppercase">Record New Institute Expense</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 border border-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-[#1A1A1A]">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block uppercase tracking-wider mb-1">Voucher / Bill #</label>
                  <input
                    type="text"
                    value={voucherNo}
                    onChange={(e) => setVoucherNo(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono focus:outline-none"
                    placeholder="EXP-1002"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Expense Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Expense Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 focus:outline-none font-bold text-xs"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., July Electricity Bill / Generator Fuel / Office Tea"
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 font-bold focus:outline-none"
                />
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
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-mono font-bold text-base focus:outline-none text-rose-800"
                  />
                </div>

                <div>
                  <label className="block uppercase tracking-wider mb-1">Payment Method</label>
                  <select
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value as PaymentSource)}
                    className="w-full bg-white border border-[#1A1A1A] p-2.5 font-bold focus:outline-none"
                  >
                    <option value="cash">💵 Cash (Petty Cash)</option>
                    <option value="bank">🏦 Bank / Online Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block uppercase tracking-wider mb-1">Remarks / Note (Optional)</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  placeholder="Additional bill notes or payee info..."
                  className="w-full bg-white border border-[#1A1A1A] p-2.5 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-[#1A1A1A] flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] uppercase tracking-wider font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-800 hover:bg-rose-900 text-white border border-rose-950 uppercase tracking-wider font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Expense</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Expense Voucher Printable Modal */}
      {printExpense && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] w-full max-w-md p-6 shadow-2xl space-y-4 text-[#1A1A1A]">
            
            <div className="text-center border-b-2 border-[#1A1A1A] pb-3 space-y-1">
              <h2 className="font-serif italic font-bold text-xl uppercase tracking-wider">{settings.instituteName}</h2>
              <p className="text-[10px] font-mono text-[#1A1A1A]/70 uppercase font-bold">{settings.subTitle} • {settings.phone}</p>
              <div className="mt-2 inline-block bg-[#1A1A1A] text-white px-3 py-1 font-mono text-xs uppercase font-bold">
                EXPENSE PAYMENT VOUCHER
              </div>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1">
                <span className="text-[#1A1A1A]/60 uppercase">Voucher #:</span>
                <span className="font-bold">{printExpense.voucherNo || printExpense.id}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1">
                <span className="text-[#1A1A1A]/60 uppercase">Date:</span>
                <span className="font-bold">{printExpense.date}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1">
                <span className="text-[#1A1A1A]/60 uppercase">Category:</span>
                <span className="font-bold">{printExpense.category}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1">
                <span className="text-[#1A1A1A]/60 uppercase">Payment Method:</span>
                <span className="font-bold uppercase">{printExpense.paymentSource}</span>
              </div>
              <div className="flex justify-between border-b border-[#1A1A1A]/20 pb-1">
                <span className="text-[#1A1A1A]/60 uppercase">Description:</span>
                <span className="font-bold uppercase text-right max-w-[200px]">{printExpense.title}</span>
              </div>
              
              {printExpense.remarks && (
                <div className="border-b border-[#1A1A1A]/20 pb-1">
                  <span className="text-[#1A1A1A]/60 uppercase block">Remarks:</span>
                  <span className="font-bold italic text-[11px]">{printExpense.remarks}</span>
                </div>
              )}

              <div className="bg-rose-50 p-3 border border-rose-800 text-center mt-3">
                <p className="text-[10px] uppercase font-bold text-rose-900">Total Amount Paid</p>
                <p className="text-2xl font-black text-rose-950 font-mono">{formatPKR(printExpense.amount)}</p>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 text-center text-[10px] font-bold uppercase font-mono border-t border-[#1A1A1A]">
              <div>
                <p className="text-[#1A1A1A]/50 mb-4">____________________</p>
                <p>Prepared By ({printExpense.recordedBy})</p>
              </div>
              <div>
                <p className="text-[#1A1A1A]/50 mb-4">____________________</p>
                <p>Approved By (Management)</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A1A1A]">
              <button
                onClick={() => setPrintExpense(null)}
                className="px-4 py-2 bg-white text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-5 py-2 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-xs font-bold uppercase flex items-center space-x-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
