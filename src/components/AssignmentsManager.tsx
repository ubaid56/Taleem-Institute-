import React, { useState } from 'react';
import { Course, Assignment, AssignmentSubmission, StaffUser } from '../types';
import { 
  FileText, 
  Plus, 
  BookOpen, 
  Calendar, 
  Upload, 
  CheckCircle, 
  Star, 
  Trash2, 
  Download, 
  User, 
  Clock, 
  Search,
  FileCheck,
  X
} from 'lucide-react';

interface AssignmentsManagerProps {
  courses: Course[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  currentUser: StaffUser | null;
  onSaveAssignment: (asg: Assignment) => void;
  onDeleteAssignment: (id: string) => void;
  onGradeSubmission: (submission: AssignmentSubmission) => void;
  showToast: (msg: string) => void;
}

export const AssignmentsManager: React.FC<AssignmentsManagerProps> = ({
  courses,
  assignments,
  submissions,
  currentUser,
  onSaveAssignment,
  onDeleteAssignment,
  onGradeSubmission,
  showToast,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(courses[0]?.id || 'ALL');
  const [fileType, setFileType] = useState<'text' | 'image' | 'pdf' | 'excel' | 'word'>('text');
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalMarks, setTotalMarks] = useState<number>(100);

  // Handle local PC file selection for staff assignment creation
  const handleStaffFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        showToast('File size should be under 10MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setAttachmentUrl(reader.result as string);
          setAttachmentName(file.name);
          showToast(`Attached file "${file.name}" from PC!`);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Grading Modal State
  const [selectedSubmissionForGrading, setSelectedSubmissionForGrading] = useState<AssignmentSubmission | null>(null);
  const [marksInput, setMarksInput] = useState<number>(100);
  const [feedbackInput, setFeedbackInput] = useState('');

  // Handle Create Assignment
  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !selectedCourseId) {
      showToast('Please enter Title, Description and select Course.');
      return;
    }

    const selectedCourse = courses.find((c) => c.id === selectedCourseId);

    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      courseId: selectedCourseId,
      courseName: selectedCourse ? selectedCourse.name : 'All Courses',
      title: title.trim(),
      description: description.trim(),
      fileType,
      attachmentUrl: attachmentUrl.trim() || undefined,
      attachmentName: attachmentName.trim() || undefined,
      dueDate: dueDate || undefined,
      totalMarks: Number(totalMarks) || 100,
      createdAt: new Date().toISOString(),
      createdByUserId: currentUser?.id || 'admin',
      createdByName: currentUser?.name || 'Instructor',
    };

    onSaveAssignment(newAsg);
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setAttachmentUrl('');
    setAttachmentName('');
    setDueDate('');
    showToast('Assignment posted successfully to student portals!');
  };

  // Handle Grade Submission
  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmissionForGrading) return;

    const updatedSub: AssignmentSubmission = {
      ...selectedSubmissionForGrading,
      marksObtained: Number(marksInput),
      teacherFeedback: feedbackInput.trim() || undefined,
      gradedAt: new Date().toISOString(),
      gradedByUserId: currentUser?.id || 'admin',
    };

    onGradeSubmission(updatedSub);
    setSelectedSubmissionForGrading(null);
    showToast('Student homework graded successfully!');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Teacher & Staff LMS Portal</span>
          <h2 className="font-serif italic text-2xl font-bold text-slate-900 mt-0.5">Assignments & Homework Management</h2>
          <p className="text-xs text-slate-500 mt-1">Post assignments with attachments (Text/Image/PDF/Word/Excel) and grade student submissions.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Assignment</span>
        </button>
      </div>

      {/* Posted Assignments List */}
      <div className="space-y-6">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">No Assignments Posted Yet</h3>
            <p className="text-xs text-slate-500 mt-1">Click "Post New Assignment" to create a task for your students.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {assignments.map((asg) => {
              const asgSubmissions = submissions.filter((s) => s.assignmentId === asg.id);
              return (
                <div key={asg.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs uppercase">
                        {asg.courseName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-mono">
                        Format: {asg.fileType?.toUpperCase() || 'TEXT'}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-mono">
                        Posted: {new Date(asg.createdAt).toLocaleDateString()}
                      </span>
                      <button
                        onClick={() => {
                          if (confirm('Delete this assignment?')) onDeleteAssignment(asg.id);
                        }}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{asg.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100 whitespace-pre-line">
                      {asg.description}
                    </p>
                  </div>

                  {asg.attachmentUrl && (
                    <div>
                      <a
                        href={asg.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Attached Task File / Resource Link</span>
                      </a>
                    </div>
                  )}

                  {/* Submissions Section */}
                  <div className="pt-3 border-t border-slate-100 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <FileCheck className="w-4 h-4 text-emerald-600" />
                        <span>Student Submissions ({asgSubmissions.length})</span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">Total Marks: {asg.totalMarks || 100}</span>
                    </div>

                    {asgSubmissions.length === 0 ? (
                      <p className="text-xs text-slate-400 italic">No student has submitted homework for this task yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {asgSubmissions.map((sub) => (
                          <div key={sub.id} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <strong className="text-slate-900 block font-bold">{sub.studentName}</strong>
                                <span className="text-[10px] text-slate-500 font-mono">Roll #{sub.rollNumber}</span>
                              </div>

                              {sub.marksObtained !== undefined ? (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px]">
                                  {sub.marksObtained} / {asg.totalMarks || 100} Marks
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-semibold rounded text-[10px]">
                                  Pending Grading
                                </span>
                              )}
                            </div>

                            <p className="text-slate-700 bg-white p-2 rounded border border-slate-200 whitespace-pre-line">
                              {sub.submissionText || 'No text answer.'}
                            </p>

                            {sub.attachmentUrl && (
                              <a
                                href={sub.attachmentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-[11px] font-semibold flex items-center gap-1"
                              >
                                <Download className="w-3 h-3" />
                                <span>View Student File Attachment</span>
                              </a>
                            )}

                            <button
                              onClick={() => {
                                setSelectedSubmissionForGrading(sub);
                                setMarksInput(sub.marksObtained ?? 100);
                                setFeedbackInput(sub.teacherFeedback ?? '');
                              }}
                              className="mt-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-[11px] shadow-xs"
                            >
                              {sub.marksObtained !== undefined ? 'Update Grade' : 'Grade Homework'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center min-h-screen">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 sm:p-8 space-y-4 my-auto relative max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-serif italic text-xl font-bold text-slate-900">Post New Course Assignment</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Course *</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-medium bg-slate-50"
                >
                  <option value="ALL">All Courses (Global Task)</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab Exercise 04: HTML Table Creation"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Task Format / Attachment Type *</label>
                <select
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white"
                >
                  <option value="text">Typed Text Task</option>
                  <option value="image">Image Attachment (JPG / PNG)</option>
                  <option value="pdf">PDF Document</option>
                  <option value="word">MS Word File (.docx)</option>
                  <option value="excel">MS Excel Worksheet (.xlsx)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detailed Description / Question Instructions *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Type full instructions for the students..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                ></textarea>
              </div>

              {/* PC File Upload Option */}
              <div className="space-y-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Upload className="w-4 h-4 text-emerald-600" />
                    <span>Upload Task Document / File from PC</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">PDF, Word, Excel, Images, Zip (Max 10MB)</span>
                </label>

                <input
                  type="file"
                  onChange={handleStaffFileUpload}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip,.rar,.txt"
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />

                {attachmentName && (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold">
                    <span className="truncate">📎 File Attached: {attachmentName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setAttachmentUrl('');
                        setAttachmentName('');
                      }}
                      className="text-rose-600 hover:underline font-bold text-[11px] ml-2 shrink-0"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 mb-1">Or Paste Cloud / External Web URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={attachmentUrl.startsWith('data:') ? '' : attachmentUrl}
                    onChange={(e) => {
                      setAttachmentUrl(e.target.value);
                      setAttachmentName('');
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Total Marks</label>
                  <input
                    type="number"
                    value={totalMarks}
                    onChange={(e) => setTotalMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md"
                >
                  Publish Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {selectedSubmissionForGrading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="font-serif italic text-xl font-bold text-slate-900">Grade Homework Submission</h3>
            <p className="text-xs text-slate-600">
              Student: <strong>{selectedSubmissionForGrading.studentName}</strong> (Roll #{selectedSubmissionForGrading.rollNumber})
            </p>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Marks Obtained</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={marksInput}
                  onChange={(e) => setMarksInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-bold text-emerald-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Teacher Feedback / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Good work! Neat presentation..."
                  value={feedbackInput}
                  onChange={(e) => setFeedbackInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm"
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedSubmissionForGrading(null)}
                  className="px-4 py-2 border rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Grade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
