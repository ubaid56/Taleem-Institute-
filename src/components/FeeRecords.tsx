import React, { useState, useMemo } from 'react';
import { FeeTransaction, Student, Course } from '../types';
import { formatPKR, exportFeeReportPDF } from '../lib/utils';
import { FileText, Calendar, Filter, Printer, Download, Search, DollarSign, CreditCard, AlertCircle, Trash2 } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface FeeRecordsProps {
  transactions: FeeTransaction[];
  students: Student[];
  courses: Course[];
  onOpenReceipt: (tx: FeeTransaction) => void;
  onClearAllRecords?: () => void;
  onDeleteTransaction?: (txId: string) => void;
}

export const FeeRecords: React.FC<FeeRecordsProps> = ({
  transactions,
  students,
  courses,
  onOpenReceipt,
  onClearAllRecords,
  onDeleteTransaction,
}) => {
  const [dateRangeMode, setDateRangeMode] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('today');
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'cash' | 'bank'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Active tab: 'transactions' or 'dues'
  const [activeTab, setActiveTab] = useState<'transactions' | 'dues'>('transactions');

  // Modals state
  const [txToDelete, setTxToDelete] = useState<FeeTransaction | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Filter transactions based on date mode
  const filteredTransactions = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return transactions.filter(tx => {
      const txDate = tx.paymentDate.split(' ')[0];

      // Date Range Filter
      let dateMatches = true;
      if (dateRangeMode === 'today') {
        dateMatches = txDate === todayStr;
      } else if (dateRangeMode === 'weekly') {
        const d = new Date(txDate);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        dateMatches = diffDays <= 7;
      } else if (dateRangeMode === 'monthly') {
        dateMatches = txDate.slice(0, 7) === todayStr.slice(0, 7);
      } else if (dateRangeMode === 'custom') {
        dateMatches = txDate >= fromDate && txDate <= toDate;
      }

      // Source Filter
      const sourceMatches = sourceFilter === 'ALL' || tx.paymentSource === sourceFilter;

      // Search Query
      const searchMatches = 
        tx.receiptNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.fatherName.toLowerCase().includes(searchQuery.toLowerCase());

      return dateMatches && sourceMatches && searchMatches;
    });
  }, [transactions, dateRangeMode, fromDate, toDate, sourceFilter, searchQuery]);

  // Students with remaining dues
  const duesStudents = useMemo(() => {
    return students.filter(s => s.status === 'active' && s.balanceRemaining > 0 && (
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.fatherName.toLowerCase().includes(searchQuery.toLowerCase())
    ));
  }, [students, searchQuery]);

  // Total Summary
  const totalCollectedInRange = filteredTransactions.reduce((sum, t) => sum + t.amountPaid, 0);
  const totalCashInRange = filteredTransactions.filter(t => t.paymentSource === 'cash').reduce((sum, t) => sum + t.amountPaid, 0);
  const totalBankInRange = filteredTransactions.filter(t => t.paymentSource === 'bank').reduce((sum, t) => sum + t.amountPaid, 0);
  const totalInstituteDuesRemaining = students.filter(s => s.status === 'active').reduce((sum, s) => sum + s.balanceRemaining, 0);

  const handleExportPDF = () => {
    const titleMap = {
      today: "Daily Fee Report (Today)",
      weekly: "Weekly Fee Collection Report",
      monthly: "Monthly Fee Collection Report",
      custom: `Date-to-Date Fee Report (${fromDate} to ${toDate})`,
    };
    exportFeeReportPDF(titleMap[dateRangeMode], filteredTransactions);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl sm:text-2xl font-bold">
            Rp
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">Fee Records & Financial Reports</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Daily, weekly, monthly, or date-to-date fee collection logs & student remaining dues</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto">
          {onClearAllRecords && (transactions.length > 0 || students.length > 0) && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 font-bold text-xs uppercase tracking-wider border border-rose-800 transition"
            >
              Clear All Fee Records
            </button>
          )}

          <button
            onClick={handleExportPDF}
            className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>Export Fee PDF Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-[#1A1A1A] space-x-6">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`pb-3 text-xs font-bold uppercase tracking-widest transition flex items-center space-x-2 border-b-2 -mb-[2px] ${
            activeTab === 'transactions'
              ? 'border-[#1A1A1A] text-[#1A1A1A]'
              : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Fee Transactions History</span>
        </button>

        <button
          onClick={() => setActiveTab('dues')}
          className={`pb-3 text-xs font-bold uppercase tracking-widest transition flex items-center space-x-2 border-b-2 -mb-[2px] ${
            activeTab === 'dues'
              ? 'border-rose-800 text-rose-800'
              : 'border-transparent text-[#1A1A1A]/50 hover:text-[#1A1A1A]'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Student Remaining Dues ({duesStudents.length})</span>
        </button>
      </div>

      {activeTab === 'transactions' ? (
        <>
          {/* Date Filter Bar */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              
              {/* Range Buttons */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-[#F4F2EE] border border-[#1A1A1A]">
                <button
                  onClick={() => setDateRangeMode('today')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    dateRangeMode === 'today' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  Daily (Today)
                </button>

                <button
                  onClick={() => setDateRangeMode('weekly')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    dateRangeMode === 'weekly' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  Weekly
                </button>

                <button
                  onClick={() => setDateRangeMode('monthly')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    dateRangeMode === 'monthly' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  Monthly
                </button>

                <button
                  onClick={() => setDateRangeMode('custom')}
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition ${
                    dateRangeMode === 'custom' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
                  }`}
                >
                  Date-to-Date
                </button>
              </div>

              {/* Source Filter */}
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-[#1A1A1A] font-bold uppercase tracking-wider text-[10px]">Source:</span>
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value as any)}
                  className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
                >
                  <option value="ALL">All Sources (Cash & Bank)</option>
                  <option value="cash">Cash Only</option>
                  <option value="bank">Bank Only</option>
                </select>
              </div>

              {/* Search Query */}
              <div className="relative min-w-[220px]">
                <Search className="w-4 h-4 text-[#1A1A1A] absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Receipt, Name, ID..."
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] pl-9 pr-3 py-1.5 text-xs text-[#1A1A1A]"
                />
              </div>

            </div>

            {/* Custom Date Pickers if Date-to-Date selected */}
            {dateRangeMode === 'custom' && (
              <div className="pt-3 border-t border-[#1A1A1A] flex flex-wrap items-center gap-3 text-xs font-bold">
                <div className="flex items-center space-x-2">
                  <span className="text-[#1A1A1A] uppercase text-[10px]">From Date:</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-[#1A1A1A] rounded-md"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-[#1A1A1A] uppercase text-[10px]">To Date:</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-1.5 text-[#1A1A1A] rounded-md"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Collection Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-[#F4F2EE] border-2 border-[#1A1A1A] p-4 rounded-xl">
              <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Total Collection (Selected Range)</p>
              <p className="text-2xl font-serif italic font-bold text-emerald-800 font-mono mt-1">{formatPKR(totalCollectedInRange)}</p>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-1 uppercase font-bold">{filteredTransactions.length} payment receipts</p>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-xl">
              <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Cash Payments</p>
              <p className="text-xl font-bold text-[#1A1A1A] font-mono mt-1">{formatPKR(totalCashInRange)}</p>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-1 uppercase">Direct cash counter</p>
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-4 rounded-xl">
              <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Bank / Online Transfers</p>
              <p className="text-xl font-bold text-[#1A1A1A] font-mono mt-1">{formatPKR(totalBankInRange)}</p>
              <p className="text-[10px] text-[#1A1A1A]/60 mt-1 uppercase">HBL / EasyPaisa / JazzCash</p>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 rounded-2xl shadow-sm overflow-hidden min-w-0">
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[700px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">Receipt #</th>
                    <th className="py-3 px-3">Date / Time</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Course(s)</th>
                    <th className="py-3 px-3">Source</th>
                    <th className="py-3 px-3 text-right">Amount Paid</th>
                    <th className="py-3 px-3 text-right">Remaining Balance</th>
                    <th className="py-3 px-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/20">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                        No transactions found for the selected date range and filter.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#F4F2EE]/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">{tx.receiptNo}</td>
                        <td className="py-3 px-3 text-[#1A1A1A]/80 font-mono">{tx.paymentDate}</td>
                        <td className="py-3 px-3 font-bold text-[#1A1A1A] uppercase">{tx.studentName} ({tx.studentId})</td>
                        <td className="py-3 px-3 text-[#1A1A1A]/80 max-w-[180px] truncate">{tx.courseNames.join(', ')}</td>
                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase ${
                            tx.paymentSource === 'cash' ? 'bg-emerald-50 text-emerald-900 border-emerald-800' : 'bg-slate-100 text-[#1A1A1A] border-[#1A1A1A]'
                          }`}>
                            {tx.paymentSource}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">{formatPKR(tx.amountPaid)}</td>
                        <td className="py-3 px-3 text-right font-mono text-rose-800 font-bold">{formatPKR(tx.remainingBalance)}</td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => onOpenReceipt(tx)}
                              className="p-1.5 bg-[#1A1A1A] text-white hover:bg-[#333] border border-[#1A1A1A] transition rounded"
                              title="Reprint Thermal Receipt"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            {onDeleteTransaction && (
                              <button
                                onClick={() => setTxToDelete(tx)}
                                className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-800 transition rounded"
                                title="Delete Transaction Receipt"
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
        </>
      ) : (
        /* DUES TAB */
        <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
            <div>
              <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">Student Dues Overview</h3>
              <p className="text-xs text-[#1A1A1A]/70 uppercase tracking-wider font-bold mt-0.5">Total Outstanding Balance across institute: <strong className="text-rose-800 font-mono text-sm">{formatPKR(totalInstituteDuesRemaining)}</strong></p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Student Name</th>
                  <th className="py-3 px-3">Father Name</th>
                  <th className="py-3 px-3">Contact</th>
                  <th className="py-3 px-3">Course(s)</th>
                  <th className="py-3 px-3 text-right">Total Calculated</th>
                  <th className="py-3 px-3 text-right">Paid To Date</th>
                  <th className="py-3 px-3 text-right">Remaining Dues</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/20">
                {duesStudents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                      All active students have fully cleared their fees!
                    </td>
                  </tr>
                ) : (
                  duesStudents.map((s, idx) => (
                    <tr key={s.id} className="hover:bg-[#F4F2EE]/50 transition">
                      <td className="py-3 px-3 font-mono text-[#1A1A1A]/60">{idx + 1}</td>
                      <td className="py-3 px-3 font-bold text-[#1A1A1A] uppercase">{s.name} ({s.studentId})</td>
                      <td className="py-3 px-3 text-[#1A1A1A]/80">{s.fatherName}</td>
                      <td className="py-3 px-3 font-mono text-[#1A1A1A]/80">{s.mobileNo}</td>
                      <td className="py-3 px-3 text-[#1A1A1A]/80">{s.courses.map(c => c.courseName).join(', ')}</td>
                      <td className="py-3 px-3 text-right font-mono text-[#1A1A1A]/80">{formatPKR(s.totalFeeCalculated)}</td>
                      <td className="py-3 px-3 text-right font-mono text-emerald-800 font-bold">{formatPKR(s.totalFeePaid)}</td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-rose-800">{formatPKR(s.balanceRemaining)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Fee Transaction Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!txToDelete}
        title="Delete Fee Transaction"
        message="Are you sure you want to delete this fee payment transaction? This will automatically reverse the payment amount from the student's record."
        itemName={txToDelete ? `Receipt #${txToDelete.receiptNo} - ${txToDelete.studentName} (PKR ${txToDelete.amountPaid})` : undefined}
        confirmText="Delete Transaction"
        onConfirm={() => {
          if (txToDelete && onDeleteTransaction) {
            onDeleteTransaction(txToDelete.id);
            setTxToDelete(null);
          }
        }}
        onClose={() => setTxToDelete(null)}
      />

      {/* Clear All Records Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showClearConfirm}
        title="Clear All Fee Records"
        message="Are you sure you want to clear all fee transaction records and student entries?"
        confirmText="Clear All Fee Records"
        onConfirm={() => {
          if (onClearAllRecords) {
            onClearAllRecords();
            setShowClearConfirm(false);
          }
        }}
        onClose={() => setShowClearConfirm(false)}
      />

    </div>
  );
};
