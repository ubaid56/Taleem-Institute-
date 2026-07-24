import React, { useEffect, useState, useRef } from 'react';
import { Student, InstituteSettings } from '../types';
import { generateQRCode } from '../lib/utils';
import { getSettings } from '../lib/storage';
import { Printer, X, QrCode, Barcode, CheckCircle2, ShieldCheck } from 'lucide-react';
import JsBarcode from 'jsbarcode';

interface StudentCardModalProps {
  student: Student;
  settings?: InstituteSettings;
  onClose: () => void;
}

export const StudentCardModal: React.FC<StudentCardModalProps> = ({
  student,
  settings: propSettings,
  onClose,
}) => {
  const settings = propSettings || getSettings();
  const [qrUrl, setQrUrl] = useState<string>('');
  const [cardSide, setCardSide] = useState<'front' | 'back'>('front');
  const [codeType, setCodeType] = useState<'both' | 'barcode' | 'qr'>('both');

  const barcodeRefFront = useRef<SVGSVGElement>(null);
  const barcodeRefPrint = useRef<SVGSVGElement>(null);
  const cardContainerRef = useRef<HTMLDivElement>(null);

  // Generate 2D QR Code Data URL
  useEffect(() => {
    generateQRCode(student.studentId).then(setQrUrl);
  }, [student.studentId]);

  // Generate 1D Code128 Barcode for Laser Barcode Scanners
  useEffect(() => {
    if (student.studentId) {
      setTimeout(() => {
        if (barcodeRefFront.current) {
          try {
            JsBarcode(barcodeRefFront.current, student.studentId, {
              format: 'CODE128',
              lineColor: '#000000',
              width: 1.6,
              height: 36,
              displayValue: true,
              fontSize: 9,
              fontOptions: 'bold',
              margin: 2,
              background: '#ffffff',
            });
          } catch (err) {
            console.error('Barcode render error:', err);
          }
        }
        if (barcodeRefPrint.current) {
          try {
            JsBarcode(barcodeRefPrint.current, student.studentId, {
              format: 'CODE128',
              lineColor: '#000000',
              width: 1.6,
              height: 36,
              displayValue: true,
              fontSize: 9,
              fontOptions: 'bold',
              margin: 2,
              background: '#ffffff',
            });
          } catch (err) {
            console.error('Print Barcode render error:', err);
          }
        }
      }, 50);
    }
  }, [student.studentId, cardSide, codeType]);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      window.print();
      return;
    }
    const cardHtml = cardContainerRef.current ? cardContainerRef.current.innerHTML : '';
    printWindow.document.write(`
      <html>
        <head>
          <title>Student ID Card - ${student.name} (${student.studentId})</title>
          <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
          <style>
            @page { size: landscape; margin: 0; }
            body { font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          </style>
        </head>
        <body>
          <div style="transform: scale(1.4); transform-origin: center;">
            ${cardHtml}
          </div>
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 600);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 bg-[#0f172a]/85 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto text-slate-900">
      
      <div className="bg-white border-2 border-blue-900 max-w-3xl w-full p-6 shadow-2xl print:hidden my-auto rounded-xl">
        
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between pb-4 border-b-2 border-blue-900/20 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#1e3a8a] text-white flex items-center justify-center shrink-0 font-serif italic text-xl font-bold rounded-lg shadow-sm">
              ID
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#1e3a8a]">Official Student Identity Card</h3>
              <p className="text-[10px] uppercase tracking-widest text-slate-600 font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Laser Barcode + 2D QR Scanner Ready • Royal Blue Theme
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Front / Back Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-300">
              <button
                onClick={() => setCardSide('front')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition rounded-md ${
                  cardSide === 'front' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Front Side
              </button>
              <button
                onClick={() => setCardSide('back')}
                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition rounded-md ${
                  cardSide === 'back' ? 'bg-[#1e3a8a] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                Back Side
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center space-x-2 transition shadow-md"
            >
              <Printer className="w-4 h-4" />
              <span>Print Card</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Code Format Selector Controls */}
        <div className="mt-3 flex items-center justify-between bg-blue-50/80 px-4 py-2 rounded-lg border border-blue-200 text-xs">
          <span className="font-bold text-[#1e3a8a] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-700" />
            <span>Scanner Barcode Format:</span>
          </span>
          <div className="flex gap-2 font-semibold">
            <button
              type="button"
              onClick={() => setCodeType('both')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                codeType === 'both' ? 'bg-[#1e3a8a] text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              Dual (Barcode + QR)
            </button>
            <button
              type="button"
              onClick={() => setCodeType('barcode')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                codeType === 'barcode' ? 'bg-[#1e3a8a] text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              1D Laser Barcode Only
            </button>
            <button
              type="button"
              onClick={() => setCodeType('qr')}
              className={`px-2.5 py-1 rounded text-[11px] transition ${
                codeType === 'qr' ? 'bg-[#1e3a8a] text-white font-bold' : 'bg-white text-slate-700 hover:bg-slate-200 border'
              }`}
            >
              2D QR Code Only
            </button>
          </div>
        </div>

        {/* LANDSCAPE CARD PREVIEW DISPLAY */}
        <div className="py-6 flex justify-center bg-slate-100 p-6 rounded-xl border border-slate-300 my-4 overflow-x-auto">
          <style>{`
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-card-container, #printable-card-container * {
                visibility: visible;
              }
              #printable-card-container {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
              }
              .print\\:hidden {
                display: none !important;
              }
              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
                color-adjust: exact !important;
              }
            }
          `}</style>
          
          <div ref={cardContainerRef} id="printable-card-container">
          {cardSide === 'front' ? (
            /* FRONT SIDE ROYAL BLUE CARD (560px x 325px) */
            <div className="w-[560px] min-w-[560px] h-[325px] bg-white border-2 border-[#1e3a8a] flex flex-col justify-between text-slate-900 relative shadow-2xl rounded-xl overflow-hidden">
              
              {/* Royal Blue Top Header Bar */}
              <div className="bg-gradient-to-r from-[#0f2a4a] via-[#1e3a8a] to-[#2563eb] text-white px-5 py-2.5 flex items-center justify-between border-b-2 border-amber-400">
                <div className="flex items-center space-x-3">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="Logo" className="w-8 h-8 object-contain bg-white rounded-md p-0.5 shadow-sm" />
                  ) : (
                    <div className="w-8 h-8 bg-white text-[#1e3a8a] rounded-md flex items-center justify-center font-serif italic font-bold text-base shadow-sm">
                      T
                    </div>
                  )}
                  <div>
                    <h4 className="font-black text-sm text-white tracking-tight uppercase leading-none">
                      {settings.instituteName || 'TALEEM INSTITUTE'}
                    </h4>
                    <p className="text-[9px] text-sky-200 font-bold uppercase tracking-widest mt-0.5">
                      {settings.subTitle || 'OF SCIENCE & TECHNOLOGY'}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider shadow-sm border border-amber-300">
                    STUDENT CARD
                  </span>
                </div>
              </div>

              {/* Middle Body Layout: Photo | Student Info | Barcode / QR */}
              <div className="p-3.5 flex gap-3 items-center justify-between flex-1 bg-gradient-to-b from-white to-blue-50/40">
                
                {/* Column 1: Photo & Roll Badge */}
                <div className="flex flex-col items-center shrink-0 w-[115px]">
                  <div className="w-24 h-24 border-2 border-[#1e3a8a] rounded-lg overflow-hidden bg-white shadow-md mb-1.5">
                    <img
                      src={student.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                      alt={student.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="bg-[#1e3a8a] text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded border border-blue-900 uppercase tracking-wider text-center w-full shadow-sm">
                    {student.studentId}
                  </span>
                  <span className="text-[8px] font-bold uppercase text-emerald-800 bg-emerald-100 border border-emerald-300 px-1 py-0.5 mt-1 rounded w-full text-center">
                    Status: {student.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Column 2: Student Details Table */}
                <div className="flex-1 space-y-1 text-xs text-slate-800 font-bold border-x border-blue-200 px-2.5 py-1">
                  <div className="flex justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-blue-950/70 uppercase text-[9px] font-bold">Student Name:</span>
                    <span className="font-extrabold text-[#1e3a8a] uppercase text-xs truncate max-w-[150px]">{student.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-blue-950/70 uppercase text-[9px] font-bold">Father Name:</span>
                    <span className="font-semibold text-slate-800 uppercase truncate max-w-[150px]">{student.fatherName}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-blue-950/70 uppercase text-[9px] font-bold">CNIC / Form-B:</span>
                    <span className="font-mono text-[10px] text-slate-900">{student.cnic || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-0.5">
                    <span className="text-blue-950/70 uppercase text-[9px] font-bold">Course:</span>
                    <span className="font-bold text-blue-900 text-[10px] text-right max-w-[140px] truncate uppercase">
                      {student.courses.map(c => c.courseName).join(', ')}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-950/70 uppercase text-[9px] font-bold">Contact:</span>
                    <span className="font-mono text-[10px] text-slate-900">{student.mobileNo || student.fatherMobileNo}</span>
                  </div>
                </div>

                {/* Column 3: Barcode / QR Code Scanner Section */}
                <div className="flex flex-col items-center justify-center shrink-0 w-[130px] text-center space-y-1 bg-white p-1.5 rounded-lg border border-blue-200 shadow-sm">
                  
                  {/* Both Barcode & QR or selected */}
                  {(codeType === 'both' || codeType === 'barcode') && (
                    <div className="w-full flex flex-col items-center">
                      <svg ref={barcodeRefFront} className="max-w-full h-auto object-contain"></svg>
                    </div>
                  )}

                  {(codeType === 'both' || codeType === 'qr') && (
                    <div className="w-16 h-16 bg-white p-0.5 border border-slate-300 rounded shadow-xs flex items-center justify-center">
                      {qrUrl ? (
                        <img src={qrUrl} alt="QR Code" className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-full h-full bg-slate-200 animate-pulse"></div>
                      )}
                    </div>
                  )}

                  <p className="text-[7.5px] text-[#1e3a8a] uppercase font-extrabold tracking-tight leading-none pt-0.5">
                    {codeType === 'both' ? 'Laser Barcode & QR Scanner' : codeType === 'barcode' ? 'Laser Barcode Scanner' : 'QR Attendance'}
                  </p>
                  
                  <div className="pt-1 border-t border-slate-300 w-full">
                    <p className="text-[7.5px] uppercase font-bold text-slate-600 tracking-tighter">
                      Principal Stamp & Sign
                    </p>
                  </div>
                </div>

              </div>

              {/* Royal Blue Bottom Footer Bar */}
              <div className="bg-[#1e3a8a] text-white px-4 py-1.5 flex items-center justify-between text-[8.5px] font-bold uppercase tracking-wider border-t border-amber-400">
                <span className="truncate">📍 Campus: {settings.address || 'Dubai adda road Bakhshali'}</span>
                <span className="shrink-0">📞 Ph: {settings.phone || '03481064487'}</span>
              </div>

            </div>
          ) : (
            /* BACK SIDE ROYAL BLUE CARD */
            <div className="w-[560px] min-w-[560px] h-[325px] bg-white border-2 border-[#1e3a8a] p-5 flex flex-col justify-between text-slate-900 relative shadow-2xl rounded-xl">
              
              {/* Back Header */}
              <div className="border-b-2 border-[#1e3a8a] pb-2 text-center">
                <h4 className="font-bold text-base text-[#1e3a8a] uppercase tracking-wide">
                  {settings.instituteName || 'TALEEM INSTITUTE OF SCIENCE & TECHNOLOGY'}
                </h4>
                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">
                  TERMS & CONDITIONS FOR STUDENT IDENTITY CARDS
                </p>
              </div>

              {/* Rules List */}
              <div className="space-y-1.5 text-[10px] text-slate-800 font-medium leading-relaxed my-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <p>1. This card is official property of Taleem Institute and must be carried daily.</p>
                <p>2. Mandatory scanning via laser barcode gun or QR scanner at entry gate for attendance.</p>
                <p>3. Misuse, transfer, or unauthorized copying is strictly prohibited and subject to penalty.</p>
                <p>4. In case of loss, report immediately to the administration office at {settings.address || 'Dubai adda road Bakhshali'}.</p>
              </div>

              {/* Emergency Contact & Return Info */}
              <div className="border-t-2 border-[#1e3a8a] pt-2 flex items-center justify-between text-[9px] font-bold uppercase">
                <div>
                  <p className="text-slate-500">If found, please return to:</p>
                  <p className="text-[#1e3a8a] font-bold">{settings.address || 'Dubai adda road Bakhshali'}</p>
                  <p className="text-slate-800">Phone: {settings.phone || '03481064487'}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono bg-[#1e3a8a] text-white px-2.5 py-1 rounded shadow-sm">
                    REG # {settings.registrationNo || 'REG-2026/TIST'}
                  </span>
                </div>
              </div>

            </div>
          )}

          </div>

        </div>

      </div>

      {/* PRINT-ONLY CONTAINER (Royal Blue Printing) */}
      <div className="hidden print:block print:fixed print:inset-0 print:bg-white print:z-[9999] print:p-4">
        <style>{`
          @page {
            size: landscape;
            margin: 0;
          }
        `}</style>
        <div className="flex flex-col items-center justify-center min-h-screen space-y-6">
          
          {/* PRINT FRONT SIDE CARD */}
          <div className="w-[560px] h-[325px] bg-white border-2 border-[#1e3a8a] flex flex-col justify-between text-slate-900 relative rounded-xl overflow-hidden">
            
            <div className="bg-[#1e3a8a] text-white px-5 py-2.5 flex items-center justify-between border-b-2 border-amber-400">
              <div>
                <h4 className="font-bold text-sm text-white uppercase">{settings.instituteName}</h4>
                <p className="text-[9px] text-sky-200 font-bold uppercase">{settings.subTitle}</p>
              </div>
              <span className="bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5 rounded uppercase">
                STUDENT CARD
              </span>
            </div>

            <div className="p-3.5 flex gap-3 items-center justify-between flex-1">
              <div className="flex flex-col items-center shrink-0 w-[115px]">
                <img src={student.photoUrl} alt="" className="w-24 h-24 object-cover border-2 border-[#1e3a8a] rounded-lg mb-1" />
                <span className="bg-[#1e3a8a] text-white font-mono font-bold text-[11px] px-2 py-0.5 rounded uppercase w-full text-center">
                  {student.studentId}
                </span>
              </div>

              <div className="flex-1 space-y-1 text-xs text-slate-800 font-bold border-x border-slate-300 px-3">
                <p><strong>Name:</strong> {student.name}</p>
                <p><strong>Father:</strong> {student.fatherName}</p>
                <p><strong>CNIC:</strong> {student.cnic}</p>
                <p><strong>Course:</strong> {student.courses.map(c => c.courseName).join(', ')}</p>
                <p><strong>Contact:</strong> {student.mobileNo}</p>
              </div>

              <div className="flex flex-col items-center shrink-0 w-[130px] text-center space-y-1">
                <svg ref={barcodeRefPrint} className="max-w-full h-auto object-contain"></svg>
                {qrUrl && <img src={qrUrl} alt="QR" className="w-14 h-14 border border-slate-300 rounded" />}
                <p className="text-[7.5px] uppercase font-bold text-slate-700">Laser Barcode & QR Code</p>
              </div>
            </div>

            <div className="bg-[#1e3a8a] text-white px-4 py-1.5 flex items-center justify-between text-[8.5px] font-bold uppercase">
              <span>📍 Campus: {settings.address}</span>
              <span>📞 Ph: {settings.phone}</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
