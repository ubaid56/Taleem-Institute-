import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeeTransaction, AttendanceRecord } from '../types';
import { getSettings } from './storage';

// Format currency in PKR
export function formatPKR(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.');
}

// Generate QR Code Data URL
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 200,
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
    });
  } catch (err) {
    console.error('Failed to generate QR code:', err);
    return '';
  }
}

// Generate Next Student Roll Number
export function generateNextStudentId(existingStudents: Student[]): string {
  const currentYear = new Date().getFullYear();
  const yearPrefix = `TIST-${currentYear}-`;
  
  const existingNums = existingStudents
    .map(s => {
      if (s.studentId && s.studentId.startsWith(yearPrefix)) {
        const numPart = s.studentId.replace(yearPrefix, '');
        return parseInt(numPart, 10);
      }
      return 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextNum = maxNum + 1;
  return `${yearPrefix}${nextNum.toString().padStart(3, '0')}`;
}

// Generate Next Receipt Number
export function generateNextReceiptNo(existingTxs: FeeTransaction[]): string {
  const currentYear = new Date().getFullYear();
  const prefix = `RCP-${currentYear}-`;
  
  const existingNums = existingTxs
    .map(t => {
      if (t.receiptNo && t.receiptNo.startsWith(prefix)) {
        const numPart = t.receiptNo.replace(prefix, '');
        return parseInt(numPart, 10);
      }
      return 0;
    })
    .filter(n => !isNaN(n));

  const maxNum = existingNums.length > 0 ? Math.max(...existingNums) : 0;
  const nextNum = maxNum + 1;
  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

// Export Attendance Report as PDF
export function exportAttendancePDF(
  attendanceRecord: AttendanceRecord,
  studentsMap: Map<string, Student>
) {
  const doc = new jsPDF();
  const settings = getSettings();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`${settings.instituteName} ${settings.subTitle}`, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`${settings.address} | Phone / WhatsApp: ${settings.phone}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(`Daily Attendance Report - ${attendanceRecord.date}`, 14, 31);
  doc.text(`Course: ${attendanceRecord.courseName}`, 14, 37);
  doc.text(`Marked By: ${attendanceRecord.markedByTeacher}`, 14, 43);

  const tableData = attendanceRecord.entries.map((entry, idx) => {
    const student = studentsMap.get(entry.studentId);
    return [
      idx + 1,
      entry.studentId,
      entry.studentName,
      student ? student.fatherName : '-',
      student ? student.mobileNo : '-',
      entry.status.toUpperCase(),
    ];
  });

  autoTable(doc, {
    startY: 48,
    head: [['#', 'Student ID', 'Student Name', 'Father Name', 'Contact', 'Status']],
    body: tableData,
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  doc.save(`Attendance_${attendanceRecord.courseName.replace(/[^a-zA-Z0-9]/g, '_')}_${attendanceRecord.date}.pdf`);
}

// Export Fee Report as PDF
export function exportFeeReportPDF(
  title: string,
  transactions: FeeTransaction[]
) {
  const doc = new jsPDF();
  const settings = getSettings();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42);
  doc.text(`${settings.instituteName} ${settings.subTitle}`, 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`${settings.address} | Phone / WhatsApp: ${settings.phone}`, 14, 24);

  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105);
  doc.text(title, 14, 31);
  doc.text(`Generated Date: ${new Date().toLocaleDateString('en-PK')}`, 14, 37);


  const totalCollected = transactions.reduce((sum, tx) => sum + tx.amountPaid, 0);

  const tableData = transactions.map((tx, idx) => [
    idx + 1,
    tx.receiptNo,
    tx.studentId,
    tx.studentName,
    tx.courseNames.join(', '),
    tx.paymentDate,
    tx.paymentSource.toUpperCase(),
    formatPKR(tx.amountPaid),
    formatPKR(tx.remainingBalance),
  ]);

  autoTable(doc, {
    startY: 43,
    head: [['#', 'Receipt #', 'Student ID', 'Name', 'Course(s)', 'Date/Time', 'Source', 'Paid Amount', 'Remaining']],
    body: tableData,
    headStyles: { fillColor: [30, 41, 59] },
    alternateRowStyles: { fillColor: [248, 250, 252] },
  });

  const finalY = (doc as any).lastAutoTable.finalY || 100;
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Amount Collected: ${formatPKR(totalCollected)}`, 14, finalY + 12);

  doc.save(`Fee_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
}
