import React, { useState } from 'react';
import { FeeTransaction, Student, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { getSettings } from '../lib/storage';
import { Printer, X, CheckCircle, Download, CreditCard, Copy } from 'lucide-react';

interface ThermalReceiptProps {
  transaction: FeeTransaction;
  student?: Student;
  settings?: InstituteSettings;
  onClose: () => void;
}

export const ThermalReceipt: React.FC<ThermalReceiptProps> = ({
  transaction,
  student,
  settings: propSettings,
  onClose,
}) => {
  const settings = propSettings || getSettings();
  const [copyMode, setCopyMode] = useState<'both' | 'student' | 'institute'>('both');

  const handlePrint = () => {
    window.print();
  };

  const renderSingleCopy = (copyType: 'STUDENT COPY' | 'INSTITUTE COPY') => (
    <div className="w-[300px] bg-white text-black p-4 font-mono text-[11px] leading-tight border border-slate-300 shadow-sm mx-auto my-2 rounded-sm print:border-none print:shadow-none print:p-2 print:w-full print:max-w-[78mm] print:m-0">
      
      {/* Top Banner Copy Type */}
      <div className="text-center border-b border-black pb-1 mb-2">
        <span className="font-extrabold text-[12px] tracking-widest uppercase px-2 py-0.5 border border-black inline-block">
          *** {copyType} ***
        </span>
      </div>

      {/* Header */}
      <div className="text-center space-y-0.5 mb-3">
        {settings.logoUrl && (
          <div className="flex justify-center mb-1">
            <img src={settings.logoUrl} alt="Logo" className="w-10 h-10 object-contain" />
          </div>
        )}
        <h2 className="font-black text-[13px] tracking-tight uppercase">
          {settings.instituteName || 'TALEEM INSTITUTE'}
        </h2>
        {settings.subTitle && (
          <p className="text-[10px] font-bold">{settings.subTitle}</p>
        )}
        <p className="text-[9px] font-semibold">{settings.address || 'Dubai adda road Bakhshali'}</p>
        <p className="text-[9px] font-bold">Phone / WhatsApp: {settings.phone || '03481064487'}</p>
        {settings.ownerName && (
          <p className="text-[9px] italic">Owner: {settings.ownerName}</p>
        )}
      </div>

      <div className="border-t border-b border-dashed border-black py-1 my-2 space-y-1">
        <div className="flex justify-between font-bold text-[10px]">
          <span>Receipt #: {transaction.receiptNo}</span>
          <span>{transaction.paymentSource.toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span>Date: {transaction.paymentDate.split(' ')[0]}</span>
          <span>Time: {transaction.paymentDate.split(' ')[1] || '10:00 AM'}</span>
        </div>
      </div>

      {/* Student Details */}
      <div className="space-y-1 mb-3 text-[10px]">
        <div className="flex justify-between">
          <span className="font-bold">Student ID:</span>
          <span>{transaction.studentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Student Name:</span>
          <span className="uppercase font-semibold">{transaction.studentName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Father Name:</span>
          <span>{transaction.fatherName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Course(s):</span>
          <span className="text-right max-w-[170px] truncate">{transaction.courseNames.join(', ')}</span>
        </div>
      </div>

      {/* Fee Table */}
      <div className="border-t border-b border-black py-1 my-2">
        <div className="flex justify-between font-bold text-[10px] mb-1">
          <span>FEE TYPE / DESCRIPTION</span>
          <span>AMOUNT</span>
        </div>
        <div className="border-t border-dotted border-black my-1"></div>

        {transaction.feeBreakdown && (
          <div className="space-y-0.5 text-[9.5px] pb-1 border-b border-dashed border-black mb-1">
            {transaction.feeBreakdown.monthlyFee ? (
              <div className="flex justify-between">
                <span>• Monthly Fee ({transaction.feeBreakdown.monthlyFeeMonth || 'Tuition'}):</span>
                <span className="font-bold">{formatPKR(transaction.feeBreakdown.monthlyFee)}</span>
              </div>
            ) : null}

            {transaction.feeBreakdown.examFee ? (
              <div className="flex justify-between">
                <span>• Examination Fee:</span>
                <span className="font-bold">{formatPKR(transaction.feeBreakdown.examFee)}</span>
              </div>
            ) : null}

            {transaction.feeBreakdown.admissionFee ? (
              <div className="flex justify-between">
                <span>• Admission / Reg Fee:</span>
                <span className="font-bold">{formatPKR(transaction.feeBreakdown.admissionFee)}</span>
              </div>
            ) : null}

            {transaction.feeBreakdown.otherFee ? (
              <div className="flex justify-between">
                <span>• {transaction.feeBreakdown.otherFeeTitle || 'Other Fee'}:</span>
                <span className="font-bold">{formatPKR(transaction.feeBreakdown.otherFee)}</span>
              </div>
            ) : null}

            {transaction.feeBreakdown.discountAmount ? (
              <div className="flex justify-between font-bold">
                <span>• Discount Allowed:</span>
                <span>-{formatPKR(transaction.feeBreakdown.discountAmount)}</span>
              </div>
            ) : null}
          </div>
        )}

        <div className="flex justify-between text-[10px]">
          <span>Previous Balance:</span>
          <span>{formatPKR(transaction.previousBalance)}</span>
        </div>
        <div className="flex justify-between font-black text-[11px] my-1 bg-slate-100 p-1 border border-black">
          <span>TOTAL PAID NOW:</span>
          <span>{formatPKR(transaction.amountPaid)}</span>
        </div>
        <div className="flex justify-between font-bold text-[10px]">
          <span>REMAINING BALANCE:</span>
          <span>{formatPKR(transaction.remainingBalance)}</span>
        </div>
      </div>

      {/* Remarks */}
      {transaction.remarks && (
        <div className="text-[9px] italic mb-3 text-slate-700">
          Note: {transaction.remarks}
        </div>
      )}

      {/* Signatures & Footer */}
      <div className="mt-4 pt-3 border-t border-dotted border-black flex justify-end items-end text-[9px]">
        <div className="text-center">
          <div className="w-20 border-b border-black mb-0.5 mx-auto"></div>
          <span className="font-bold">Accountant Sign</span>
        </div>
      </div>

      <div className="text-center mt-3 text-[8px] text-slate-600">
        <p>*** {settings.instituteName} • {settings.address} ***</p>
        <p>Contact: {settings.phone} • {settings.receiptFooterNote || 'Thank You!'}</p>
      </div>

    </div>
  );


  return (
    <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto text-[#1A1A1A]">
      
      {/* Non-printable modal dialog controls */}
      <div className="bg-white border-2 border-[#1A1A1A] max-w-3xl w-full p-6 shadow-2xl print:hidden my-auto max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b-2 border-[#1A1A1A]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl font-bold">
              Rc
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">Thermal Receipt Printer Desk</h3>
              <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">80mm POS Thermal Receipt • Dubai adda road Bakhshali (03481064487)</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print {copyMode === 'both' ? 'Both Copies' : copyMode === 'student' ? 'Student Copy' : 'Institute Copy'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#1A1A1A] hover:bg-[#F4F2EE] border border-[#1A1A1A] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Copy Selector Controls */}
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F4F2EE] p-3 border border-[#1A1A1A]">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Select Thermal Print Copies:</span>
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setCopyMode('both')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#1A1A1A] transition ${
                copyMode === 'both' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] hover:bg-[#F4F2EE]'
              }`}
            >
              Both Copies (Separate Pages)
            </button>
            <button
              type="button"
              onClick={() => setCopyMode('student')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#1A1A1A] transition ${
                copyMode === 'student' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] hover:bg-[#F4F2EE]'
              }`}
            >
              Student Copy Only
            </button>
            <button
              type="button"
              onClick={() => setCopyMode('institute')}
              className={`flex-1 sm:flex-none px-3 py-1.5 text-xs font-bold uppercase tracking-wider border border-[#1A1A1A] transition ${
                copyMode === 'institute' ? 'bg-[#1A1A1A] text-white' : 'bg-white text-[#1A1A1A] hover:bg-[#F4F2EE]'
              }`}
            >
              Institute Copy Only
            </button>
          </div>
        </div>

        {/* Dual Thermal Receipt Visual Preview (Side by Side on desktop) */}
        <div className="py-6 flex flex-col md:flex-row items-center justify-center gap-6 bg-[#F4F2EE] p-4 my-4 border border-[#1A1A1A]">
          {(copyMode === 'both' || copyMode === 'student') && renderSingleCopy('STUDENT COPY')}
          {copyMode === 'both' && <div className="hidden md:block w-px h-64 bg-[#1A1A1A] border-r border-dashed"></div>}
          {(copyMode === 'both' || copyMode === 'institute') && renderSingleCopy('INSTITUTE COPY')}
        </div>

        <div className="flex items-center justify-between text-xs text-[#1A1A1A] pt-2 border-t-2 border-[#1A1A1A]">
          <span className="flex items-center text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
            <CheckCircle className="w-4 h-4 mr-1.5" /> Transaction Recorded Successfully
          </span>
          <p className="text-[10px] uppercase tracking-wider font-bold">Receipt No: <span className="font-mono text-[#1A1A1A]">{transaction.receiptNo}</span></p>
        </div>

      </div>

      {/* PRINT-ONLY CSS CONTAINER (Rendered when user clicks Print) */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-0">
        <div className="w-full flex flex-col items-center">
          {(copyMode === 'both' || copyMode === 'student') && (
            <div className="w-full text-center print:break-after-page style-page-break">
              {renderSingleCopy('STUDENT COPY')}
            </div>
          )}
          {(copyMode === 'both' || copyMode === 'institute') && (
            <div className="w-full text-center print:break-after-page style-page-break">
              {renderSingleCopy('INSTITUTE COPY')}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};
