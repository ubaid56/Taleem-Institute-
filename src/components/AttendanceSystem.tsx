import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Course, Student, AttendanceRecord, AttendanceEntry, AttendanceStatus } from '../types';
import { exportAttendancePDF } from '../lib/utils';
import { QrCode, CheckCircle2, FileText, Calendar, Users, UserCheck, Search, Download, Check, AlertCircle, RefreshCw, BarChart2, ShieldAlert, Camera, X } from 'lucide-react';

interface AttendanceSystemProps {
  courses: Course[];
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onSaveAttendance: (newRecord: AttendanceRecord) => void;
}

export const AttendanceSystem: React.FC<AttendanceSystemProps> = ({
  courses,
  students,
  attendanceRecords,
  onSaveAttendance,
}) => {
  const [activeTab, setActiveTab] = useState<'mark' | 'reports'>('mark');

  const [selectedCourseId, setSelectedCourseId] = useState<string>(
    courses.length > 0 ? courses[0].id : ''
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [teacherName, setTeacherName] = useState<string>('Prof. Asad Khan');

  // Scanner Mode: 'qr' or 'manual'
  const [scanMode, setScanMode] = useState<'qr' | 'manual'>('qr');
  const [qrInputText, setQrInputText] = useState<string>('');
  const [lastScannedStudent, setLastScannedStudent] = useState<{ student: Student; status: string; time: string } | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Report filters
  const [reportMode, setReportMode] = useState<'today' | 'weekly' | 'monthly' | 'custom'>('weekly');
  const [reportFromDate, setReportFromDate] = useState<string>(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10));
  const [reportToDate, setReportToDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [reportCourseId, setReportCourseId] = useState<string>('ALL');

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    if (showCameraModal) {
      setCameraError(null);
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
        })
        .catch(err => {
          setCameraError('Camera access denied or unavailable. Please select student below.');
        });
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [showCameraModal]);

  // Play audio confirmation beep on scan
  const playBeepSound = (isDuplicate = false) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = isDuplicate ? 'sawtooth' : 'sine';
      osc.frequency.setValueAtTime(isDuplicate ? 300 : 880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + (isDuplicate ? 0.3 : 0.15));
    } catch (e) {
      // Audio autoplay restrictions
    }
  };

  // Active enrolled students for the selected course
  const enrolledStudents = useMemo(() => {
    return students.filter(s => 
      s.status === 'active' && s.courses.some(c => c.courseId === selectedCourseId)
    );
  }, [students, selectedCourseId]);

  // Current session entries map: studentId -> AttendanceStatus
  const [attendanceEntriesMap, setAttendanceEntriesMap] = useState<Map<string, AttendanceStatus>>(new Map());

  // Load existing record for selected date & course if already marked
  useEffect(() => {
    const existing = attendanceRecords.find(
      r => r.courseId === selectedCourseId && r.date === selectedDate
    );

    const map = new Map<string, AttendanceStatus>();
    if (existing) {
      existing.entries.forEach(e => map.set(e.studentId, e.status));
      setTeacherName(existing.markedByTeacher || 'Prof. Asad Khan');
    }
    setAttendanceEntriesMap(map);
  }, [selectedCourseId, selectedDate, attendanceRecords]);

  // Handle QR Code Scan (via mobile phone camera scanner into input field or manual entry)
  const processQrScan = (rawCode: string) => {
    const code = rawCode.trim().toUpperCase();
    if (!code) return;

    setDuplicateWarning(null);

    // Find student matching QR code / studentId
    const targetStudent = enrolledStudents.find(
      s => s.studentId.toUpperCase() === code || s.qrCodeData.toUpperCase() === code
    );

    if (targetStudent) {
      const existingStatus = attendanceEntriesMap.get(targetStudent.studentId);
      if (existingStatus) {
        setDuplicateWarning(`⚠️ ATTENDANCE ALREADY MARKED: ${targetStudent.name} (${targetStudent.studentId}) is already marked as ${existingStatus.toUpperCase()} for today!`);
        playBeepSound(true);
        setLastScannedStudent({
          student: targetStudent,
          status: `${existingStatus.toUpperCase()} (ALREADY MARKED)`,
          time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        });
        setQrInputText('');
        return;
      }

      playBeepSound(false);
      const updatedMap = new Map(attendanceEntriesMap);
      updatedMap.set(targetStudent.studentId, 'present');
      setAttendanceEntriesMap(updatedMap);

      setLastScannedStudent({
        student: targetStudent,
        status: 'PRESENT',
        time: new Date().toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      });

      setQrInputText('');
    } else {
      setDuplicateWarning(`❌ Student ID or QR Code "${code}" not found in current course list.`);
      playBeepSound(true);
      setQrInputText('');
    }
  };

  const setStudentStatus = (studentId: string, status: AttendanceStatus) => {
    const updatedMap = new Map(attendanceEntriesMap);
    updatedMap.set(studentId, status);
    setAttendanceEntriesMap(updatedMap);
  };

  const markAllStatus = (status: AttendanceStatus) => {
    const updatedMap = new Map(attendanceEntriesMap);
    enrolledStudents.forEach(s => updatedMap.set(s.studentId, status));
    setAttendanceEntriesMap(updatedMap);
  };

  const handleSaveSession = () => {
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (!selectedCourse) return;

    const entries: AttendanceEntry[] = enrolledStudents.map(s => ({
      studentId: s.studentId,
      studentName: s.name,
      status: attendanceEntriesMap.get(s.studentId) || 'present',
    }));

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: selectedDate,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      markedByTeacher: teacherName,
      entries,
      createdAt: new Date().toISOString(),
    };

    onSaveAttendance(newRecord);
    alert(`Attendance saved successfully for ${selectedCourse.name} on ${selectedDate}!`);
  };

  const handleDownloadPDF = () => {
    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (!selectedCourse) return;

    const entries: AttendanceEntry[] = enrolledStudents.map(s => ({
      studentId: s.studentId,
      studentName: s.name,
      status: attendanceEntriesMap.get(s.studentId) || 'present',
    }));

    const currentRecord: AttendanceRecord = {
      id: 'temp-pdf',
      date: selectedDate,
      courseId: selectedCourse.id,
      courseName: selectedCourse.name,
      markedByTeacher: teacherName,
      entries,
      createdAt: new Date().toISOString(),
    };

    const studentsMap = new Map<string, Student>();
    students.forEach(s => studentsMap.set(s.studentId, s));

    exportAttendancePDF(currentRecord, studentsMap);
  };

  // Filtered records for Reports view
  const filteredReportRecords = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);

    return attendanceRecords.filter(record => {
      const recDate = record.date;
      let dateMatches = true;

      if (reportMode === 'today') {
        dateMatches = recDate === todayStr;
      } else if (reportMode === 'weekly') {
        const d = new Date(recDate);
        const now = new Date();
        const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
        dateMatches = diffDays <= 7;
      } else if (reportMode === 'monthly') {
        dateMatches = recDate.slice(0, 7) === todayStr.slice(0, 7);
      } else if (reportMode === 'custom') {
        dateMatches = recDate >= reportFromDate && recDate <= reportToDate;
      }

      const courseMatches = reportCourseId === 'ALL' || record.courseId === reportCourseId;

      return dateMatches && courseMatches;
    });
  }, [attendanceRecords, reportMode, reportFromDate, reportToDate, reportCourseId]);

  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Present/Absent summary counts
  const presentCount = Array.from(attendanceEntriesMap.values()).filter(v => v === 'present').length;
  const absentCount = Array.from(attendanceEntriesMap.values()).filter(v => v === 'absent').length;
  const lateCount = Array.from(attendanceEntriesMap.values()).filter(v => v === 'late').length;
  const leaveCount = Array.from(attendanceEntriesMap.values()).filter(v => v === 'leave').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header & View Switcher Tabs */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold">
            Qr
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Student Attendance & Reports</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Scan ID card QR code or view weekly, monthly & date-to-date reports</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <div className="flex p-1 bg-[#F4F2EE] border-2 border-[#1A1A1A]">
            <button
              onClick={() => setActiveTab('mark')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeTab === 'mark' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Mark Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 ${
                activeTab === 'reports' ? 'bg-[#1A1A1A] text-white' : 'text-[#1A1A1A] hover:bg-white'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>Attendance Reports</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'mark' ? (
        <>
          {/* Control Bar: Course, Date & Teacher */}
          <div className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Select Course / Batch *</label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(e.target.value)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
              >
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Attendance Date *</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Teacher / Instructor</label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs text-[#1A1A1A] focus:outline-none"
              />
            </div>
          </div>

          {/* Attendance Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Present</p>
                <p className="text-xl font-bold text-emerald-800 font-mono">{presentCount}</p>
              </div>
              <CheckCircle2 className="w-8 h-8 text-emerald-800" />
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Absent</p>
                <p className="text-xl font-bold text-rose-800 font-mono">{absentCount}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-rose-800" />
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Late</p>
                <p className="text-xl font-bold text-amber-800 font-mono">{lateCount}</p>
              </div>
              <Users className="w-8 h-8 text-amber-800" />
            </div>

            <div className="bg-white border-2 border-[#1A1A1A] p-3.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-[#1A1A1A] uppercase tracking-widest font-bold">Leave</p>
                <p className="text-xl font-bold text-[#1A1A1A] font-mono">{leaveCount}</p>
              </div>
              <Calendar className="w-8 h-8 text-[#1A1A1A]/40" />
            </div>
          </div>

          {/* QR SCANNER INPUT SECTION */}
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              
              <div className="w-full md:w-1/2 space-y-3">
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] flex items-center space-x-2">
                  <QrCode className="w-5 h-5 text-[#1A1A1A]" />
                  <span>Scan Student Card QR Code / ID</span>
                </h3>
                <p className="text-xs text-[#1A1A1A]/70 uppercase tracking-wider font-bold">
                  Scan QR code from ID card with your mobile camera or scanner into the field below, or enter ID (e.g., <code className="text-[#1A1A1A] font-mono font-bold bg-[#F4F2EE] px-1 py-0.5 border border-[#1A1A1A]">TIST-2026-001</code>).
                </p>

                {duplicateWarning && (
                  <div className="p-3 bg-amber-50 border-2 border-amber-600 text-amber-900 text-xs font-bold flex items-center space-x-2 animate-bounce">
                    <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>{duplicateWarning}</span>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    processQrScan(qrInputText);
                  }}
                  className="flex flex-col sm:flex-row gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    autoFocus
                    value={qrInputText}
                    onChange={(e) => setQrInputText(e.target.value)}
                    placeholder="Scan QR or Enter Student ID..."
                    className="w-full sm:flex-1 bg-[#FDFCFB] border-2 border-[#1A1A1A] px-4 py-3 text-sm font-mono text-[#1A1A1A] placeholder-[#1A1A1A]/40 focus:outline-none"
                  />
                  <div className="flex gap-2 w-full sm:w-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowCameraModal(true)}
                      className="flex-1 sm:flex-initial px-4 py-3 bg-white hover:bg-[#F4F2EE] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest border-2 border-[#1A1A1A] flex items-center justify-center space-x-1.5 transition"
                      title="Open Camera to Scan Card"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Camera</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 sm:flex-initial px-5 py-3 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] transition text-center"
                    >
                      Mark Present
                    </button>
                  </div>
                </form>

                {/* Camera Scan Modal */}
                {showCameraModal && (
                  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-white border-2 border-[#1A1A1A] p-6 max-w-lg w-full shadow-2xl space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
                        <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] flex items-center space-x-2">
                          <Camera className="w-5 h-5 text-[#1A1A1A]" />
                          <span>Live Camera QR / ID Card Scanner</span>
                        </h3>
                        <button onClick={() => setShowCameraModal(false)} className="text-[#1A1A1A] hover:opacity-70">
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="relative bg-black border-2 border-[#1A1A1A] h-72 flex items-center justify-center overflow-hidden">
                        {cameraError ? (
                          <div className="p-4 text-center text-white text-xs font-bold">
                            <p>{cameraError}</p>
                          </div>
                        ) : (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 border-4 border-dashed border-emerald-400/50 pointer-events-none flex items-center justify-center">
                          <span className="bg-black/70 text-emerald-300 font-mono text-[10px] uppercase tracking-widest px-3 py-1 border border-emerald-400">
                            Align Student QR Card Here
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">Tap Student to simulate camera scan detection:</p>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                          {enrolledStudents.map(s => (
                            <div
                              key={s.id}
                              onClick={() => {
                                processQrScan(s.studentId);
                                setShowCameraModal(false);
                              }}
                              className="p-2 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] cursor-pointer flex items-center justify-between transition text-xs font-mono"
                            >
                              <span>{s.name} ({s.studentId})</span>
                              <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-white text-[#1A1A1A]">Scan & Mark</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Quick Test Scan Buttons */}
                <div className="pt-2">
                  <p className="text-[10px] text-[#1A1A1A] uppercase font-bold tracking-widest mb-2">Quick Test Scan Student:</p>
                  <div className="flex flex-wrap gap-2">
                    {enrolledStudents.slice(0, 6).map(s => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => processQrScan(s.studentId)}
                        className="px-2.5 py-1 bg-[#F4F2EE] hover:bg-white border border-[#1A1A1A] text-[#1A1A1A] text-xs font-mono font-bold"
                      >
                        {s.name} ({s.studentId})
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Live Scan Result / Status Banner */}
              <div className="w-full md:w-1/2 bg-[#F4F2EE] border-2 border-[#1A1A1A] p-5 flex flex-col items-center justify-center text-center min-h-[220px]">
                {lastScannedStudent ? (
                  <div className="space-y-3">
                    <span className={`px-3 py-1 border font-mono text-xs font-bold inline-flex items-center gap-1.5 uppercase ${
                      lastScannedStudent.status.includes('ALREADY') ? 'bg-amber-100 text-amber-900 border-amber-800' : 'bg-emerald-100 text-emerald-900 border-emerald-800'
                    }`}>
                      {lastScannedStudent.status.includes('ALREADY') ? <AlertCircle className="w-4 h-4 text-amber-800" /> : <CheckCircle2 className="w-4 h-4 text-emerald-800" />} 
                      {lastScannedStudent.status} ({lastScannedStudent.time})
                    </span>

                    <img
                      src={lastScannedStudent.student.photoUrl}
                      alt=""
                      className="w-16 h-16 object-cover border-2 border-[#1A1A1A] mx-auto"
                    />

                    <div>
                      <h4 className="font-serif italic font-bold text-lg text-[#1A1A1A]">{lastScannedStudent.student.name}</h4>
                      <p className="text-xs text-[#1A1A1A]/80 uppercase font-bold">ID: <span className="font-mono text-[#1A1A1A]">{lastScannedStudent.student.studentId}</span> • S/O: {lastScannedStudent.student.fatherName}</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-[#1A1A1A]">
                    <QrCode className="w-12 h-12 mx-auto text-[#1A1A1A]" />
                    <p className="text-xs font-bold uppercase tracking-wider">Ready for QR Code scan. Attendance will be marked present immediately. Duplicate scans will notify you.</p>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* MANUAL TABLE SECTION */}
          <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-[#1A1A1A] gap-3">
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                Enrolled Student Attendance List ({selectedCourse?.name})
              </h3>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => markAllStatus('present')}
                  className="px-3 py-1 bg-emerald-50 text-emerald-900 border border-emerald-800 text-xs font-bold uppercase tracking-wider hover:bg-emerald-100 transition"
                >
                  Mark All Present
                </button>
                <button
                  onClick={() => markAllStatus('absent')}
                  className="px-3 py-1 bg-rose-50 text-rose-900 border border-rose-800 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition"
                >
                  Mark All Absent
                </button>
                <button
                  onClick={() => setAttendanceEntriesMap(new Map())}
                  className="px-3 py-1 bg-[#F4F2EE] text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-white transition"
                >
                  Unselect All
                </button>
                <button
                  onClick={handleDownloadPDF}
                  className="px-3 py-1 bg-[#1A1A1A] text-white border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider hover:bg-[#333] transition flex items-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF Report</span>
                </button>
                <button
                  onClick={handleSaveSession}
                  className="px-4 py-1 bg-blue-600 text-white border border-blue-800 text-xs font-bold uppercase tracking-wider hover:bg-blue-700 transition flex items-center space-x-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Record</span>
                </button>
              </div>
            </div>

            {/* Mobile Cards View (Visible on phone screens) */}
            <div className="block md:hidden space-y-3">
              {enrolledStudents.length === 0 ? (
                <div className="py-8 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider text-xs">
                  No active students enrolled in this course.
                </div>
              ) : (
                enrolledStudents.map((s, idx) => {
                  const currentStatus = attendanceEntriesMap.get(s.studentId);

                  return (
                    <div key={s.id} className="bg-[#FDFCFB] border-2 border-[#1A1A1A] p-3.5 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <img src={s.photoUrl} alt="" className="w-10 h-10 object-cover border border-[#1A1A1A]" />
                          <div>
                            <p className="font-bold text-[#1A1A1A] text-sm uppercase">{s.name}</p>
                            <p className="font-mono text-xs text-[#1A1A1A]/80 font-bold">{s.studentId} • S/O: {s.fatherName}</p>
                          </div>
                        </div>
                        <span className="font-mono text-xs text-[#1A1A1A]/50 font-bold">#{idx + 1}</span>
                      </div>

                      <div className="pt-2 border-t border-[#1A1A1A]/20">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1.5">Mark Attendance Status:</p>
                        <div className="grid grid-cols-4 gap-1 sm:gap-1.5">
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'present')}
                            className={`py-2 text-xs font-black uppercase tracking-wider transition border ${
                              currentStatus === 'present'
                                ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                                : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#F4F2EE]'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'absent')}
                            className={`py-2 text-xs font-black uppercase tracking-wider transition border ${
                              currentStatus === 'absent'
                                ? 'bg-rose-800 text-white border-rose-900 shadow-sm'
                                : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#F4F2EE]'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'late')}
                            className={`py-2 text-xs font-black uppercase tracking-wider transition border ${
                              currentStatus === 'late'
                                ? 'bg-amber-700 text-white border-amber-800 shadow-sm'
                                : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#F4F2EE]'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => setStudentStatus(s.studentId, 'leave')}
                            className={`py-2 text-xs font-black uppercase tracking-wider transition border ${
                              currentStatus === 'leave'
                                ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] shadow-sm'
                                : 'bg-white text-[#1A1A1A] border-[#1A1A1A] hover:bg-[#F4F2EE]'
                            }`}
                          >
                            Leave
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Desktop Table View (Visible on tablets and laptops) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-3">#</th>
                    <th className="py-3 px-3">Student Info</th>
                    <th className="py-3 px-3">Father Name</th>
                    <th className="py-3 px-3">Contact</th>
                    <th className="py-3 px-3 text-center">Attendance Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1A1A1A]/20">
                  {enrolledStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                        No active students enrolled in this course.
                      </td>
                    </tr>
                  ) : (
                    enrolledStudents.map((s, idx) => {
                      const currentStatus = attendanceEntriesMap.get(s.studentId);

                      return (
                        <tr key={s.id} className="hover:bg-[#F4F2EE]/50 transition">
                          <td className="py-3 px-3 font-mono text-[#1A1A1A]/60">{idx + 1}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center space-x-3">
                              <img src={s.photoUrl} alt="" className="w-8 h-8 object-cover border border-[#1A1A1A]" />
                              <div>
                                <p className="font-bold text-[#1A1A1A] text-xs uppercase">{s.name}</p>
                                <p className="font-mono text-[10px] text-[#1A1A1A]/70">{s.studentId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-[#1A1A1A]/80">{s.fatherName}</td>
                          <td className="py-3 px-3 font-mono text-[#1A1A1A]/80">{s.mobileNo}</td>
                          <td className="py-3 px-3">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              <button
                                onClick={() => setStudentStatus(s.studentId, 'present')}
                                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition border border-[#1A1A1A] ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-800 text-white border-emerald-900'
                                    : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#F4F2EE]'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                onClick={() => setStudentStatus(s.studentId, 'absent')}
                                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition border border-[#1A1A1A] ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-800 text-white border-rose-900'
                                    : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#F4F2EE]'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => setStudentStatus(s.studentId, 'late')}
                                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition border border-[#1A1A1A] ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-700 text-white border-amber-800'
                                    : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#F4F2EE]'
                                }`}
                              >
                                Late
                              </button>
                              <button
                                onClick={() => setStudentStatus(s.studentId, 'leave')}
                                className={`px-3 py-1 text-xs font-bold uppercase tracking-wider transition border border-[#1A1A1A] ${
                                  currentStatus === 'leave'
                                    ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                                    : 'bg-[#FDFCFB] text-[#1A1A1A] hover:bg-[#F4F2EE]'
                                }`}
                              >
                                Leave
                              </button>
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
        </>
      ) : (
        /* ATTENDANCE REPORTS VIEW (Weekly, Monthly, Date-to-Date) */
        <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-4 border-b-2 border-[#1A1A1A] gap-4">
            <div>
              <h3 className="font-serif italic font-bold text-xl text-[#1A1A1A]">Attendance Reports & Analytics</h3>
              <p className="text-xs uppercase tracking-wider text-[#1A1A1A]/70 font-bold">View weekly, monthly, or custom date-to-date attendance history logs</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  if (filteredReportRecords.length === 0) {
                    alert('No attendance records found for this range.');
                    return;
                  }
                  const studentsMap = new Map<string, Student>();
                  students.forEach(s => studentsMap.set(s.studentId, s));
                  exportAttendancePDF(filteredReportRecords[0], studentsMap);
                }}
                className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
              >
                <Download className="w-4 h-4" />
                <span>Export Report PDF</span>
              </button>
            </div>
          </div>

          {/* Report Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-[#F4F2EE] p-4 border border-[#1A1A1A]">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Time Period Range</label>
              <select
                value={reportMode}
                onChange={(e) => setReportMode(e.target.value as any)}
                className="w-full bg-white border border-[#1A1A1A] px-3 py-2 text-xs font-bold uppercase focus:outline-none"
              >
                <option value="today">Today</option>
                <option value="weekly">Weekly (Last 7 Days)</option>
                <option value="monthly">Monthly (Current Month)</option>
                <option value="custom">Date-to-Date (Custom)</option>
              </select>
            </div>

            {reportMode === 'custom' && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">From Date</label>
                  <input
                    type="date"
                    value={reportFromDate}
                    onChange={(e) => setReportFromDate(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">To Date</label>
                  <input
                    type="date"
                    value={reportToDate}
                    onChange={(e) => setReportToDate(e.target.value)}
                    className="w-full bg-white border border-[#1A1A1A] px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Course Filter</label>
              <select
                value={reportCourseId}
                onChange={(e) => setReportCourseId(e.target.value)}
                className="w-full bg-white border border-[#1A1A1A] px-3 py-2 text-xs font-bold uppercase focus:outline-none"
              >
                <option value="ALL">All Courses</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Records Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b-2 border-[#1A1A1A] bg-[#F4F2EE] text-[#1A1A1A] font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Course / Batch</th>
                  <th className="py-3 px-3">Marked By Instructor</th>
                  <th className="py-3 px-3 text-center">Present</th>
                  <th className="py-3 px-3 text-center">Absent</th>
                  <th className="py-3 px-3 text-center">Late / Leave</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1A1A1A]/20">
                {filteredReportRecords.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-[#1A1A1A]/60 font-bold uppercase tracking-wider">
                      No attendance logs found for the selected date range & course.
                    </td>
                  </tr>
                ) : (
                  filteredReportRecords.map(rec => {
                    const pCount = rec.entries.filter(e => e.status === 'present').length;
                    const aCount = rec.entries.filter(e => e.status === 'absent').length;
                    const lCount = rec.entries.filter(e => e.status === 'late' || e.status === 'leave').length;

                    return (
                      <tr key={rec.id} className="hover:bg-[#F4F2EE]/50 transition">
                        <td className="py-3 px-3 font-mono font-bold text-[#1A1A1A]">{rec.date}</td>
                        <td className="py-3 px-3 font-bold uppercase">{rec.courseName}</td>
                        <td className="py-3 px-3 text-[#1A1A1A]/80">{rec.markedByTeacher}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-emerald-800">{pCount}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-rose-800">{aCount}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold text-amber-800">{lCount}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedCourseId(rec.courseId);
                              setSelectedDate(rec.date);
                              setActiveTab('mark');
                            }}
                            className="px-2.5 py-1 bg-[#1A1A1A] text-white text-[10px] font-bold uppercase hover:bg-[#333] transition"
                          >
                            View / Edit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
