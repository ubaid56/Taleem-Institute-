import React, { useState } from 'react';
import { FeeTransaction, StaffSalaryRecord, Expense, UserRole, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  PieChart, 
  Calendar, 
  Printer, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Receipt, 
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

interface ProfitLossReportProps {
  transactions: FeeTransaction[];
  salaryRecords: StaffSalaryRecord[];
  expenses: Expense[];
  currentRole: UserRole;
  settings: InstituteSettings;
}

export const ProfitLossReport: React.FC<ProfitLossReportProps> = ({
  transactions,
  salaryRecords,
  expenses,
  currentRole,
  settings,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().substring(0, 7)); // YYYY-MM

  // Filter transactions for selected month
  const monthlyTransactions = transactions.filter((tx) => {
    // tx.paymentDate is YYYY-MM-DD or YYYY-MM-DD HH:mm
    return tx.paymentDate.substring(0, 7) === selectedMonth;
  });

  // Filter salary disbursements for selected month
  const monthlySalaryRecords = salaryRecords.filter((rec) => {
    return rec.monthYear === selectedMonth || rec.paymentDate.substring(0, 7) === selectedMonth;
  });

  // Filter expenses for selected month
  const monthlyExpenses = expenses.filter((exp) => {
    return exp.date.substring(0, 7) === selectedMonth;
  });

  // Financial Calculations
  const totalIncome = monthlyTransactions.reduce((sum, tx) => sum + tx.amountPaid, 0);
  
  const totalSalariesPaid = monthlySalaryRecords
    .filter(r => r.type === 'salary')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalAdvancesPaid = monthlySalaryRecords
    .filter(r => r.type === 'advance')
    .reduce((sum, r) => sum + r.amount, 0);

  const totalStaffDisbursements = totalSalariesPaid + totalAdvancesPaid;

  const totalOperatingExpenses = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const totalOutflows = totalStaffDisbursements + totalOperatingExpenses;
  const netProfit = totalIncome - totalOutflows;

  const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

  // Breakdown by Cash vs Bank Income
  const cashIncome = monthlyTransactions.filter(t => t.paymentSource === 'cash').reduce((sum, t) => sum + t.amountPaid, 0);
  const bankIncome = monthlyTransactions.filter(t => t.paymentSource === 'bank').reduce((sum, t) => sum + t.amountPaid, 0);

  // Expense Categories Breakdown
  const expensesByCategory: Record<string, number> = {};
  monthlyExpenses.forEach((exp) => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-[#1A1A1A]">
      
      {/* Header Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 border border-[#1A1A1A]">
            <PieChart className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif italic font-bold text-[#1A1A1A] uppercase tracking-wide">
              Monthly Profit & Loss Statement
            </h1>
            <p className="text-xs text-[#1A1A1A]/70 font-mono">
              Comprehensive financial breakdown: Total Fee Collections vs Salaries, Advances & Operating Expenses
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-[#1A1A1A]/70 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Report Month:</span>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-[#FDFCFB] border-2 border-[#1A1A1A] px-3 py-2 text-xs font-mono font-bold text-[#1A1A1A] focus:outline-none"
          />
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print Statement</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* 1. Total Income */}
        <div className="bg-emerald-50 border-2 border-emerald-800 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-900">1. Total Revenue / Income</span>
            <ArrowUpRight className="w-5 h-5 text-emerald-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-emerald-950">{formatPKR(totalIncome)}</p>
          <p className="text-[11px] text-emerald-800 font-bold">
            {monthlyTransactions.length} Student Fee Receipts Collected
          </p>
        </div>

        {/* 2. Staff Payroll */}
        <div className="bg-amber-50 border-2 border-amber-800 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-900">2. Staff Salaries & Advances</span>
            <ArrowDownRight className="w-5 h-5 text-amber-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-amber-950">{formatPKR(totalStaffDisbursements)}</p>
          <div className="flex justify-between text-[10px] text-amber-900 font-bold">
            <span>Regular: {formatPKR(totalSalariesPaid)}</span>
            <span>Advance: {formatPKR(totalAdvancesPaid)}</span>
          </div>
        </div>

        {/* 3. Operating Expenses */}
        <div className="bg-rose-50 border-2 border-rose-800 p-4 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-900">3. Operating Expenses</span>
            <Receipt className="w-5 h-5 text-rose-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-black font-mono text-rose-950">{formatPKR(totalOperatingExpenses)}</p>
          <p className="text-[11px] text-rose-800 font-bold">
            {monthlyExpenses.length} Expense Vouchers Incurred
          </p>
        </div>

        {/* 4. NET PROFIT LEFT */}
        <div className={`border-2 p-4 shadow-sm space-y-2 ${
          netProfit >= 0 ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]' : 'bg-rose-900 text-white border-rose-950'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-white/80">4. NET PROFIT REMAINING</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className={`text-2xl sm:text-3xl font-black font-mono ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
            {formatPKR(netProfit)}
          </p>
          <p className="text-[11px] text-white/70 font-bold">
            {netProfit >= 0 ? `Profit Margin: ${profitMargin}%` : 'Net Operating Deficit / Loss'}
          </p>
        </div>

      </div>

      {/* Visual Cashflow Ratio Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-3">
        <h3 className="font-serif italic font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
          Cashflow Distribution Visualizer ({selectedMonth})
        </h3>

        {totalIncome > 0 ? (
          <div className="space-y-2">
            <div className="w-full bg-[#F4F2EE] h-6 border-2 border-[#1A1A1A] overflow-hidden flex">
              {/* Salaries Segment */}
              <div 
                style={{ width: `${Math.min(100, (totalStaffDisbursements / totalIncome) * 100)}%` }}
                className="bg-amber-600 h-full border-r border-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-white font-mono"
                title={`Salaries: ${formatPKR(totalStaffDisbursements)}`}
              >
                {Math.round((totalStaffDisbursements / totalIncome) * 100)}%
              </div>

              {/* Expenses Segment */}
              <div 
                style={{ width: `${Math.min(100, (totalOperatingExpenses / totalIncome) * 100)}%` }}
                className="bg-rose-700 h-full border-r border-[#1A1A1A] flex items-center justify-center text-[10px] font-bold text-white font-mono"
                title={`Expenses: ${formatPKR(totalOperatingExpenses)}`}
              >
                {Math.round((totalOperatingExpenses / totalIncome) * 100)}%
              </div>

              {/* Net Profit Segment */}
              {netProfit > 0 && (
                <div 
                  style={{ width: `${Math.min(100, (netProfit / totalIncome) * 100)}%` }}
                  className="bg-emerald-700 h-full flex items-center justify-center text-[10px] font-bold text-white font-mono"
                  title={`Net Profit: ${formatPKR(netProfit)}`}
                >
                  {profitMargin}% Profit
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between text-[11px] font-mono font-bold text-[#1A1A1A] pt-1">
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-amber-600 inline-block border border-[#1A1A1A]"></span>
                <span>Staff Salaries & Advances ({formatPKR(totalStaffDisbursements)})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-rose-700 inline-block border border-[#1A1A1A]"></span>
                <span>Operating Expenses ({formatPKR(totalOperatingExpenses)})</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-3 h-3 bg-emerald-700 inline-block border border-[#1A1A1A]"></span>
                <span>Net Profit ({formatPKR(netProfit)})</span>
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs font-mono text-[#1A1A1A]/60 italic">
            No fee income recorded yet for {selectedMonth} to display cashflow ratio.
          </p>
        )}
      </div>

      {/* Itemized Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        
        {/* Income Breakdown */}
        <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2">
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] uppercase">
              1. Income Breakdown
            </h3>
            <span className="font-mono font-black text-emerald-800 text-sm">{formatPKR(totalIncome)}</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between p-2.5 bg-emerald-50 border border-emerald-300">
              <span className="font-bold text-emerald-950">💵 Cash Collections</span>
              <span className="font-black text-emerald-950">{formatPKR(cashIncome)}</span>
            </div>
            <div className="flex justify-between p-2.5 bg-blue-50 border border-blue-300">
              <span className="font-bold text-blue-950">🏦 Bank / Online Collections</span>
              <span className="font-black text-blue-950">{formatPKR(bankIncome)}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#1A1A1A]/70 font-mono">
            Collected from {monthlyTransactions.length} student fee payment transactions during {selectedMonth}.
          </p>
        </div>

        {/* Expenses Category Breakdown */}
        <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-2">
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A] uppercase">
              2. Expenses Category Breakdown
            </h3>
            <span className="font-mono font-black text-rose-800 text-sm">{formatPKR(totalOperatingExpenses)}</span>
          </div>

          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-xs font-mono text-[#1A1A1A]/60 italic py-4 text-center">
              No operating expenses recorded for {selectedMonth}.
            </p>
          ) : (
            <div className="space-y-1.5 text-xs font-mono">
              {Object.entries(expensesByCategory).map(([cat, amt]) => (
                <div key={cat} className="flex justify-between p-2 bg-[#F4F2EE] border border-[#1A1A1A]/20">
                  <span className="font-bold text-[#1A1A1A]">{cat}</span>
                  <span className="font-black text-rose-800">{formatPKR(amt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Printable Financial Statement Sheet */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
        <div className="text-center border-b-2 border-[#1A1A1A] pb-4 space-y-1">
          <h2 className="font-serif italic font-bold text-2xl uppercase tracking-wider">{settings.instituteName}</h2>
          <p className="text-xs font-mono text-[#1A1A1A]/70 uppercase font-bold">{settings.subTitle} • Phone: {settings.phone}</p>
          <div className="mt-2 inline-block bg-[#1A1A1A] text-white px-5 py-1 font-mono text-xs uppercase font-bold tracking-widest">
            OFFICIAL MONTHLY FINANCIAL PROFIT & LOSS STATEMENT ({selectedMonth})
          </div>
        </div>

        <div className="space-y-3 font-mono text-xs">
          <table className="w-full text-left border-collapse border-2 border-[#1A1A1A]">
            <thead>
              <tr className="bg-[#F4F2EE] border-b-2 border-[#1A1A1A] uppercase font-bold text-[10px]">
                <th className="py-2.5 px-4">Financial Ledger Item</th>
                <th className="py-2.5 px-4 text-right">Credit (Income)</th>
                <th className="py-2.5 px-4 text-right">Debit (Expense/Payout)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1A1A1A]/20">
              <tr>
                <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">Student Tuition & Admission Fees Collected</td>
                <td className="py-3 px-4 text-right font-black text-emerald-800">{formatPKR(totalIncome)}</td>
                <td className="py-3 px-4 text-right font-bold text-[#1A1A1A]/40">—</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">Staff Regular Monthly Salaries Payout</td>
                <td className="py-3 px-4 text-right font-bold text-[#1A1A1A]/40">—</td>
                <td className="py-3 px-4 text-right font-bold text-amber-900">{formatPKR(totalSalariesPaid)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">Staff Advance Salary Loans Disbursed</td>
                <td className="py-3 px-4 text-right font-bold text-[#1A1A1A]/40">—</td>
                <td className="py-3 px-4 text-right font-bold text-amber-900">{formatPKR(totalAdvancesPaid)}</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-[#1A1A1A] uppercase">Institute Operating Expenses & Bills</td>
                <td className="py-3 px-4 text-right font-bold text-[#1A1A1A]/40">—</td>
                <td className="py-3 px-4 text-right font-bold text-rose-800">{formatPKR(totalOperatingExpenses)}</td>
              </tr>
              <tr className="bg-[#1A1A1A] text-white font-black text-sm">
                <td className="py-3 px-4 uppercase">NET REMAINING PROFIT FOR {selectedMonth}</td>
                <td colSpan={2} className={`py-3 px-4 text-right text-base ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-300'}`}>
                  {formatPKR(netProfit)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="pt-8 grid grid-cols-2 text-center text-[10px] font-bold uppercase font-mono border-t border-[#1A1A1A]">
          <div>
            <p className="text-[#1A1A1A]/50 mb-6">____________________</p>
            <p>Prepared By (Accountant)</p>
          </div>
          <div>
            <p className="text-[#1A1A1A]/50 mb-6">____________________</p>
            <p>Verified & Approved By (Super Admin / Director)</p>
          </div>
        </div>

      </div>

    </div>
  );
};
