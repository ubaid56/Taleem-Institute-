import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { FeeTransaction, Student, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { getSettings } from '../lib/storage';
import { Printer, X, CheckCircle2, Loader2 } from 'lucide-react';

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
  const [statusMsg, setStatusMsg] = useState<string>('Invoice generating...');
  const isPrintingRef = React.useRef<boolean>(false);

  const handlePrint = React.useCallback(() => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    setStatusMsg('Printing Invoice...');
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setTimeout(() => {
        isPrintingRef.current = false;
        setStatusMsg('Ready for Thermal Print');
      }, 1000);
    }
  }, []);

  useEffect(() => {
    setStatusMsg('Invoice generating...');
    const timer = setTimeout(() => {
      handlePrint();
    }, 400);
    return () => clearTimeout(timer);
  }, [transaction.receiptNo, handlePrint]);

  return (
    <>
      {/* Screen Modal Dialog (Hidden completely during printing) */}
      <div className="fixed inset-0 bg-[#1A1A1A]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto text-[#1A1A1A] print:hidden">
        
        {/* Modal Card (Hidden when printing) */}
        <div className="bg-white border-2 border-[#1A1A1A] max-w-md w-full p-6 shadow-2xl print:hidden my-auto space-y-4">
        
        {/* Header Control Bar */}
        <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-lg font-bold">
              Rc
            </div>
            <div>
              <h3 className="font-serif italic font-bold text-base text-[#1A1A1A]">Thermal Invoice</h3>
              <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> {statusMsg}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest flex items-center space-x-2 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print Receipt</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[#1A1A1A] hover:bg-slate-100 border border-[#1A1A1A] transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thermal Receipt Preview Box */}
        <div className="bg-[#F4F2EE] p-4 border border-[#1A1A1A] flex justify-center overflow-x-auto">
          <div className="w-[300px] bg-white text-black p-3 font-mono text-[10.5px] leading-tight border border-slate-300 shadow-sm">
            
            {/* Top Title Banner */}
            <div className="text-center border-b border-black pb-1 mb-1.5">
              <span className="font-extrabold text-[11px] tracking-widest uppercase px-2 py-0.5 border border-black inline-block">
                *** FEE PAYMENT RECEIPT ***
              </span>
            </div>

            {/* Institute Header */}
            <div className="text-center space-y-0.5 mb-2">
              {settings.logoUrl && (
                <div className="flex justify-center mb-0.5">
                  <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain" />
                </div>
              )}
              <h2 className="font-black text-[12px] tracking-tight uppercase">
                {settings.instituteName || 'TALEEM INSTITUTE'}
              </h2>
              {settings.subTitle && (
                <p className="text-[9.5px] font-bold">{settings.subTitle}</p>
              )}
              <p className="text-[8.5px] font-semibold">{settings.address || 'Dubai adda road Bakhshali'}</p>
              <p className="text-[8.5px] font-bold">Phone: {settings.phone || '03481064487'}</p>
            </div>

            {/* Meta Info */}
            <div className="border-t border-b border-dashed border-black py-1 my-1.5 space-y-0.5">
              <div className="flex justify-between font-bold text-[9.5px]">
                <span>Receipt #: {transaction.receiptNo}</span>
                <span>{transaction.paymentSource.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-[9.5px]">
                <span>Date: {transaction.paymentDate.split(' ')[0]}</span>
                <span>Time: {transaction.paymentDate.split(' ')[1] || '10:00 AM'}</span>
              </div>
            </div>

            {/* Student Details */}
            <div className="space-y-0.5 mb-2 text-[9.5px]">
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
                <span className="text-right max-w-[160px] truncate">{transaction.courseNames.join(', ')}</span>
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="border-t border-b border-black py-1 my-1.5">
              <div className="flex justify-between font-bold text-[9.5px] mb-0.5">
                <span>FEE DESCRIPTION</span>
                <span>AMOUNT</span>
              </div>
              <div className="border-t border-dotted border-black my-0.5"></div>

              {transaction.feeBreakdown && (
                <div className="space-y-0.5 text-[9px] pb-1 border-b border-dashed border-black mb-1">
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

              <div className="flex justify-between text-[9.5px]">
                <span>Previous Balance:</span>
                <span>{formatPKR(transaction.previousBalance)}</span>
              </div>
              <div className="flex justify-between font-black text-[10.5px] my-0.5 bg-slate-100 p-0.5 border border-black">
                <span>TOTAL PAID NOW:</span>
                <span>{formatPKR(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-[9.5px]">
                <span>REMAINING BALANCE:</span>
                <span>{formatPKR(transaction.remainingBalance)}</span>
              </div>
            </div>

            {/* Remarks */}
            {transaction.remarks && (
              <div className="text-[8.5px] italic mb-2 text-slate-700">
                Note: {transaction.remarks}
              </div>
            )}

            {/* Signatures */}
            <div className="mt-2 pt-2 border-t border-dotted border-black flex justify-end items-end text-[8.5px]">
              <div className="text-center">
                <div className="w-16 border-b border-black mb-0.5 mx-auto"></div>
                <span className="font-bold">Accountant Sign</span>
              </div>
            </div>

            <div className="text-center mt-2 text-[8px] text-slate-600">
              <p>{settings.receiptFooterNote || 'Thank You!'}</p>
            </div>

          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#1A1A1A] pt-2 border-t border-[#1A1A1A]">
          <span className="flex items-center text-emerald-800 font-bold uppercase tracking-wider text-[10px]">
            <CheckCircle2 className="w-4 h-4 mr-1" /> Auto-Generated Successfully
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs uppercase"
          >
            Close
          </button>
        </div>

      </div>
    </div>

      {/* PRINT-ONLY CONTAINER PORTAL TO BODY (80mm Thermal Receipt Layout) */}
      {createPortal(
        <div id="thermal-receipt-print" className="hidden print:block">
          <div className="w-[80mm] mx-auto bg-white text-black p-2 font-mono text-[10px] leading-tight">
            
            <div className="text-center border-b border-black pb-1 mb-1">
              <span className="font-black text-[11px] tracking-widest uppercase">
                *** FEE RECEIPT ***
              </span>
            </div>

            <div className="text-center space-y-0.5 mb-1.5">
              <h2 className="font-black text-[12px] uppercase">{settings.instituteName || 'TALEEM INSTITUTE'}</h2>
              <p className="text-[8.5px] font-semibold">{settings.address || 'Dubai adda road Bakhshali'}</p>
              <p className="text-[8.5px] font-bold">Phone: {settings.phone || '03481064487'}</p>
            </div>

            <div className="border-t border-b border-dashed border-black py-1 my-1 space-y-0.5 text-[9px]">
              <div className="flex justify-between font-bold">
                <span>Receipt #: {transaction.receiptNo}</span>
                <span>{transaction.paymentSource.toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span>Date: {transaction.paymentDate}</span>
              </div>
            </div>

            <div className="space-y-0.5 mb-1.5 text-[9px]">
              <div className="flex justify-between">
                <span className="font-bold">Student ID:</span>
                <span>{transaction.studentId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Student Name:</span>
                <span className="uppercase font-bold">{transaction.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Father Name:</span>
                <span>{transaction.fatherName}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-bold">Course:</span>
                <span>{transaction.courseNames.join(', ')}</span>
              </div>
            </div>

            <div className="border-t border-b border-black py-1 my-1">
              <div className="flex justify-between font-bold text-[9px] mb-0.5">
                <span>DESCRIPTION</span>
                <span>AMOUNT</span>
              </div>
              <div className="border-t border-dotted border-black my-0.5"></div>

              {transaction.feeBreakdown && (
                <div className="space-y-0.5 text-[8.5px] pb-1 border-b border-dashed border-black mb-0.5">
                  {transaction.feeBreakdown.monthlyFee ? (
                    <div className="flex justify-between">
                      <span>Monthly ({transaction.feeBreakdown.monthlyFeeMonth || 'Tuition'}):</span>
                      <span className="font-bold">{formatPKR(transaction.feeBreakdown.monthlyFee)}</span>
                    </div>
                  ) : null}
                  {transaction.feeBreakdown.examFee ? (
                    <div className="flex justify-between">
                      <span>Exam Fee:</span>
                      <span className="font-bold">{formatPKR(transaction.feeBreakdown.examFee)}</span>
                    </div>
                  ) : null}
                  {transaction.feeBreakdown.admissionFee ? (
                    <div className="flex justify-between">
                      <span>Admission Fee:</span>
                      <span className="font-bold">{formatPKR(transaction.feeBreakdown.admissionFee)}</span>
                    </div>
                  ) : null}
                  {transaction.feeBreakdown.otherFee ? (
                    <div className="flex justify-between">
                      <span>{transaction.feeBreakdown.otherFeeTitle || 'Other Fee'}:</span>
                      <span className="font-bold">{formatPKR(transaction.feeBreakdown.otherFee)}</span>
                    </div>
                  ) : null}
                  {transaction.feeBreakdown.discountAmount ? (
                    <div className="flex justify-between font-bold">
                      <span>Discount:</span>
                      <span>-{formatPKR(transaction.feeBreakdown.discountAmount)}</span>
                    </div>
                  ) : null}
                </div>
              )}

              <div className="flex justify-between text-[9px]">
                <span>Previous Balance:</span>
                <span>{formatPKR(transaction.previousBalance)}</span>
              </div>
              <div className="flex justify-between font-black text-[10px] my-0.5 bg-slate-100 p-0.5 border border-black">
                <span>TOTAL PAID:</span>
                <span>{formatPKR(transaction.amountPaid)}</span>
              </div>
              <div className="flex justify-between font-bold text-[9px]">
                <span>REMAINING:</span>
                <span>{formatPKR(transaction.remainingBalance)}</span>
              </div>
            </div>

            {transaction.remarks && (
              <div className="text-[8px] italic mb-1 text-slate-700">
                Note: {transaction.remarks}
              </div>
            )}

            <div className="mt-2 pt-2 border-t border-dotted border-black flex justify-end text-[8px]">
              <div className="text-center">
                <div className="w-14 border-b border-black mb-0.5 mx-auto"></div>
                <span>Accountant Sign</span>
              </div>
            </div>

            <div className="text-center mt-2 text-[7.5px] text-slate-600">
              <p>{settings.receiptFooterNote || 'Thank You!'}</p>
            </div>

          </div>
        </div>,
        document.body
      )}

    </>
  );
};
