import QRCode from 'qrcode';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Student, FeeTransaction, AttendanceRecord } from '../types';
import { getSettings } from './storage';

// Format currency in PKR
export function formatPKR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return 'PKR 0';
  return `PKR ${Math.round(amount).toLocaleString('en-US')}`;
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
  if (!attendanceRecord || !attendanceRecord.entries || attendanceRecord.entries.length === 0) {
    alert('No attendance entries found to export.');
    return;
  }

  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const settings = getSettings();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`${settings.instituteName || 'Institute'} ${settings.subTitle || ''}`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`${settings.address || ''} | Phone / WhatsApp: ${settings.phone || ''}`, 14, 24);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105); // slate-600
    doc.text(`Daily Attendance Report - ${attendanceRecord.date || ''}`, 14, 31);
    doc.text(`Course: ${attendanceRecord.courseName || ''}`, 14, 37);
    doc.text(`Marked By: ${attendanceRecord.markedByTeacher || ''}`, 14, 43);

    const tableData = attendanceRecord.entries.map((entry, idx) => {
      const student = studentsMap.get(entry.studentId);
      return [
        idx + 1,
        entry.studentId || '-',
        entry.studentName || '-',
        student ? student.fatherName || '-' : '-',
        student ? student.mobileNo || '-' : '-',
        (entry.status || 'absent').toUpperCase(),
      ];
    });

    autoTable(doc, {
      startY: 48,
      head: [['#', 'Student ID', 'Student Name', 'Father Name', 'Contact', 'Status']],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    const safeCourseName = (attendanceRecord.courseName || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Attendance_${safeCourseName}_${attendanceRecord.date || 'date'}.pdf`);
  } catch (err: any) {
    console.error('Attendance PDF Generation Error:', err);
    alert(`Could not generate Attendance PDF: ${err?.message || 'Unknown error'}`);
  }
}

// Export Course Students List as PDF
export function exportCourseStudentsPDF(
  courseTitle: string,
  students: Student[]
) {
  if (!students || students.length === 0) {
    alert(`No students found to export for "${courseTitle}".`);
    return;
  }

  try {
    const doc = new jsPDF('l', 'mm', 'a4');
    const settings = getSettings();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`${settings.instituteName || 'Institute'} ${settings.subTitle || ''}`, 14, 16);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${settings.address || ''} | Phone / WhatsApp: ${settings.phone || ''}`, 14, 22);

    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'bold');
    doc.text(`Enrolled Students List — ${courseTitle}`, 14, 30);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Students: ${students.length} | Exported Date: ${new Date().toLocaleDateString('en-PK')}`, 14, 36);

    const tableData = students.map((s, idx) => {
      const courseNames = Array.isArray(s.courses) ? s.courses.map(c => c.courseName).filter(Boolean).join(', ') : '-';
      return [
        idx + 1,
        s.studentId || '-',
        s.name || '-',
        s.fatherName || '-',
        s.mobileNo || '-',
        courseNames || '-',
        s.admissionDate || '-',
        (s.status || 'active').toUpperCase(),
        formatPKR(s.assignedMonthlyFee || 0),
        formatPKR(s.totalFeePaid || 0),
        formatPKR(s.balanceRemaining || 0),
      ];
    });

    autoTable(doc, {
      startY: 42,
      head: [['#', 'Roll No', 'Student Name', 'Father Name', 'Contact', 'Course(s)', 'Admission Date', 'Status', 'Monthly Fee', 'Total Paid', 'Remaining Dues']],
      body: tableData,
      headStyles: { fillColor: [26, 26, 26], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
    const totalDues = students.reduce((sum, s) => sum + (s.balanceRemaining || 0), 0);
    const totalPaid = students.reduce((sum, s) => sum + (s.totalFeePaid || 0), 0);

    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Summary: Total Enrolled = ${students.length} | Total Fees Collected = ${formatPKR(totalPaid)} | Remaining Balance = ${formatPKR(totalDues)}`, 14, finalY + 10);

    const safeFileName = (courseTitle || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Students_${safeFileName}_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err: any) {
    console.error('PDF Generation Error:', err);
    alert(`Could not generate PDF: ${err?.message || 'Unknown error'}`);
  }
}

// Export Course Students List as Excel / CSV
export function exportCourseStudentsExcel(
  courseTitle: string,
  students: Student[]
) {
  if (!students || students.length === 0) {
    alert(`No students found to export for "${courseTitle}".`);
    return;
  }

  try {
    const headers = [
      'Sr No',
      'Roll No (Student ID)',
      'Student Name',
      'Father Name',
      'Contact No',
      'CNIC / Form B',
      'Enrolled Course(s)',
      'Admission Date',
      'Status',
      'Monthly Fee (PKR)',
      'Admission Fee (PKR)',
      'Total Paid (PKR)',
      'Balance Remaining (PKR)'
    ];

    const rows = students.map((s, idx) => [
      idx + 1,
      `"${s.studentId || ''}"`,
      `"${(s.name || '').replace(/"/g, '""')}"`,
      `"${(s.fatherName || '').replace(/"/g, '""')}"`,
      `"${s.mobileNo || ''}"`,
      `"${s.cnic || ''}"`,
      `"${(Array.isArray(s.courses) ? s.courses.map(c => c.courseName).join(', ') : '').replace(/"/g, '""')}"`,
      `"${s.admissionDate || ''}"`,
      `"${(s.status || 'active').toUpperCase()}"`,
      s.assignedMonthlyFee || 0,
      s.assignedAdmissionFee || 0,
      s.totalFeePaid || 0,
      s.balanceRemaining || 0,
    ]);

    const csvContent = '\uFEFF' + [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const safeFileName = (courseTitle || 'Course').replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `Students_${safeFileName}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err: any) {
    console.error('Excel Export Error:', err);
    alert(`Could not export CSV/Excel: ${err?.message || 'Unknown error'}`);
  }
}

// Export Fee Report as PDF
export function exportFeeReportPDF(
  title: string,
  transactions: FeeTransaction[]
) {
  if (!transactions || transactions.length === 0) {
    alert('No transaction records found to generate fee report PDF.');
    return;
  }

  try {
    const doc = new jsPDF('p', 'mm', 'a4');
    const settings = getSettings();

    // Header
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42);
    doc.text(`${settings.instituteName || 'Institute'} ${settings.subTitle || ''}`, 14, 18);

    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`${settings.address || ''} | Phone / WhatsApp: ${settings.phone || ''}`, 14, 24);

    doc.setFontSize(11);
    doc.setTextColor(71, 85, 105);
    doc.text(title, 14, 31);
    doc.text(`Generated Date: ${new Date().toLocaleDateString('en-PK')}`, 14, 37);

    const totalCollected = transactions.reduce((sum, tx) => sum + (tx.amountPaid || 0), 0);

    const tableData = transactions.map((tx, idx) => [
      idx + 1,
      tx.receiptNo || '-',
      tx.studentId || '-',
      tx.studentName || '-',
      Array.isArray(tx.courseNames) ? tx.courseNames.join(', ') : '-',
      tx.paymentDate || '-',
      (tx.paymentSource || 'cash').toUpperCase(),
      formatPKR(tx.amountPaid || 0),
      formatPKR(tx.remainingBalance || 0),
    ]);

    autoTable(doc, {
      startY: 43,
      head: [['#', 'Receipt #', 'Student ID', 'Name', 'Course(s)', 'Date/Time', 'Source', 'Paid Amount', 'Remaining']],
      body: tableData,
      headStyles: { fillColor: [30, 41, 59] },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    const finalY = (doc as any).lastAutoTable?.finalY ?? 100;
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total Amount Collected: ${formatPKR(totalCollected)}`, 14, finalY + 12);

    doc.save(`Fee_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (err: any) {
    console.error('Fee PDF Generation Error:', err);
    alert(`Could not generate Fee Report PDF: ${err?.message || 'Unknown error'}`);
  }
}
