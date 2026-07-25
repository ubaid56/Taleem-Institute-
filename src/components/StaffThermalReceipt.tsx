import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { StaffSalaryRecord, StaffUser, InstituteSettings } from '../types';
import { formatPKR } from '../lib/utils';
import { getSettings } from '../lib/storage';
import { Printer, X, CheckCircle2, Copy } from 'lucide-react';

interface StaffThermalReceiptProps {
  record: StaffSalaryRecord;
  staff?: StaffUser;
  settings?: InstituteSettings;
  onClose: () => void;
}

export const StaffThermalReceipt: React.FC<StaffThermalReceiptProps> = ({
  record,
  staff,
  settings: propSettings,
  onClose,
}) => {
  const settings = propSettings || getSettings();
  const [copyMode, setCopyMode] = useState<'both' | 'staff' | 'office'>('staff');
  const isPrintingRef = React.useRef<boolean>(false);

  const handlePrint = React.useCallback(() => {
    if (isPrintingRef.current) return;
    isPrintingRef.current = true;
    try {
      window.print();
    } catch (err) {
      console.error('Print error:', err);
    } finally {
      setTimeout(() => {
        isPrintingRef.current = false;
      }, 1000);
    }
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      handlePrint();
    }, 400);
    return () => clearTimeout(timer);
  }, [handlePrint]);

  const receiptNo = `PAY-${record.id.slice(-6).toUpperCase()}`;

  const renderSingleCopy = (copyType: 'STAFF COPY' | 'OFFICE COPY') => (
    <div className="w-[300px] bg-white text-black p-3 font-mono text-[10.5px] leading-tight border border-slate-400 shadow-sm mx-auto my-1 rounded-sm print:border-none print:shadow-none print:p-1 print:w-full print:max-w-[78mm] print:m-0">
      
      {/* Top Banner Copy Type */}
      <div className="text-center border-b border-black pb-1 mb-1.5">
        <span className="font-black text-[11px] tracking-widest uppercase px-2 py-0.5 border border-black inline-block">
          *** {copyType} ***
        </span>
      </div>

      {/* Header */}
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

      {/* Voucher Info */}
      <div className="border-t border-b border-dashed border-black py-1 my-1.5 space-y-0.5">
        <div className="flex justify-between font-bold text-[9.5px]">
          <span>Slip #: {receiptNo}</span>
          <span>{record.paymentSource.toUpperCase()}</span>
        </div>
        <div className="flex justify-between text-[9.5px]">
          <span>Date: {record.paymentDate}</span>
          <span>Month: {record.monthYear}</span>
        </div>
      </div>

      {/* Staff Details */}
      <div className="space-y-0.5 mb-2 text-[9.5px]">
        <div className="flex justify-between">
          <span className="font-bold">Staff Name:</span>
          <span className="uppercase font-bold">{record.staffName}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-bold">Role / Title:</span>
          <span className="uppercase">{staff?.designation || record.role.toUpperCase()}</span>
        </div>
        {staff?.phone && (
          <div className="flex justify-between">
            <span className="font-bold">Phone:</span>
            <span>{staff.phone}</span>
          </div>
        )}
        {staff?.cnic && (
          <div className="flex justify-between">
            <span className="font-bold">CNIC:</span>
            <span>{staff.cnic}</span>
          </div>
        )}
      </div>

      {/* Salary Breakdown Table */}
      <div className="border-t border-b border-black py-1 my-1.5 space-y-1">
        <div className="flex justify-between font-bold text-[9.5px] mb-0.5 border-b border-dotted border-black pb-0.5">
          <span>PAYMENT CATEGORY</span>
          <span>AMOUNT</span>
        </div>

        <div className="flex justify-between text-[9.5px]">
          <span>Monthly Base Salary:</span>
          <span>{formatPKR(staff?.baseSalary || 0)}</span>
        </div>

        <div className="flex justify-between font-black text-[10.5px] my-0.5 bg-slate-100 p-0.5 border border-black">
          <span className="uppercase">
            {record.type === 'advance' ? '⚠️ ADVANCE SALARY PAID:' : '💵 SALARY DISBURSED:'}
          </span>
          <span>{formatPKR(record.amount)}</span>
        </div>
      </div>

      {/* Remarks */}
      {record.notes && (
        <div className="text-[8.5px] italic mb-2 text-slate-800 bg-slate-50 p-1 border border-dashed border-slate-300">
          <strong>Note:</strong> {record.notes}
        </div>
      )}

      {/* Disbursed by */}
      <div className="text-[8.5px] font-bold text-[#1A1A1A] mb-2">
        Disbursed By: {record.recordedBy || 'Admin'}
      </div>

      {/* Signatures */}
      <div className="mt-2 pt-2 border-t border-dotted border-black grid grid-cols-2 text-center text-[8px] font-bold uppercase">
        <div>
          <div className="w-14 border-b border-black mb-0.5 mx-auto"></div>
          <span>Staff Signature</span>
        </div>
        <div>
          <div className="w-14 border-b border-black mb-0.5 mx-auto"></div>
          <span>Accountant / Admin</span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[8px] mt-2 pt-1 border-t border-dashed border-black text-slate-600">
        {settings.receiptFooterNote || 'Thank You!'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto print:hidden">
      
      {/* Container - hide actions during print */}
      <div className="bg-slate-100 border-2 border-black w-full max-w-xl p-4 shadow-2xl space-y-4 my-auto print:hidden">
        
        {/* Controls Bar (Hidden in Print) */}
        <div className="flex items-center justify-between border-b border-slate-300 pb-3 print:hidden">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-800" />
            <h3 className="font-serif italic font-bold text-base text-[#1A1A1A]">
              Staff Thermal Slip (80mm Print)
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center border border-black bg-white text-[11px] font-bold">
              <button
                onClick={() => setCopyMode('both')}
                className={`px-2 py-1 ${copyMode === 'both' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]'}`}
              >
                Both Copies
              </button>
              <button
                onClick={() => setCopyMode('staff')}
                className={`px-2 py-1 ${copyMode === 'staff' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]'}`}
              >
                Staff Only
              </button>
              <button
                onClick={() => setCopyMode('office')}
                className={`px-2 py-1 ${copyMode === 'office' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A]'}`}
              >
                Office Only
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs uppercase flex items-center space-x-1"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>

            <button
              onClick={onClose}
              className="p-1 border border-black bg-white hover:bg-[#1A1A1A] hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* On-screen Thermal Receipt Preview Box */}
        <div className="bg-slate-200 p-2 sm:p-4 rounded border border-slate-300 overflow-y-auto max-h-[75vh]">
          {(copyMode === 'both' || copyMode === 'staff') && (
            <div>
              {renderSingleCopy('STAFF COPY')}
            </div>
          )}

          {copyMode === 'both' && (
            <div className="text-center my-3">
              <div className="border-b-2 border-dashed border-black w-full my-2"></div>
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-slate-200 px-2">
                --- CUT HERE FOR OFFICE COPY ---
              </span>
            </div>
          )}

          {(copyMode === 'both' || copyMode === 'office') && (
            <div>
              {renderSingleCopy('OFFICE COPY')}
            </div>
          )}
        </div>

      </div>

      {/* PRINT PORTAL TO BODY */}
      {createPortal(
        <div id="thermal-receipt-print" className="hidden print:block">
          <div className="w-[80mm] mx-auto bg-white text-black p-2 font-mono text-[10px] leading-tight">
            {(copyMode === 'both' || copyMode === 'staff') && (
              <div>
                {renderSingleCopy('STAFF COPY')}
              </div>
            )}

            {copyMode === 'both' && (
              <div className="text-center my-2">
                <div className="border-b-2 border-dashed border-black w-full my-2"></div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-slate-500 bg-white px-2">
                  --- CUT HERE FOR OFFICE COPY ---
                </span>
              </div>
            )}

            {(copyMode === 'both' || copyMode === 'office') && (
              <div>
                {renderSingleCopy('OFFICE COPY')}
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

    </div>
  );
};
