import React, { useState } from 'react';
import { Course, Student } from '../types';
import { formatPKR } from '../lib/utils';
import { BookOpen, Plus, Edit2, Trash2, Check, X, Users, Layers } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface CourseManagerProps {
  courses: Course[];
  students: Student[];
  currentRole?: string;
  customBaseCategories?: string[];
  onAddCourse: (newCourse: Course) => void;
  onUpdateCourse: (updatedCourse: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onAddBaseCategory?: (catName: string) => void;
}

export const CourseManager: React.FC<CourseManagerProps> = ({
  courses,
  students,
  currentRole = 'super_admin',
  customBaseCategories = [],
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddBaseCategory,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const defaultBaseCategories = ['DIT', 'CIT', 'English Language', 'Web Development', 'Graphics Designing', 'YouTube Automation', 'Other'];
  const allBaseCategories = Array.from(new Set([...defaultBaseCategories, ...(customBaseCategories || [])]));

  // New Course Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [baseCourseType, setBaseCourseType] = useState<Course['baseCourseType']>('DIT');
  const [durationMonths, setDurationMonths] = useState(12);
  const [monthlyFee, setMonthlyFee] = useState(2000);
  const [admissionFee, setAdmissionFee] = useState(3000);
  const [examFeeSem1, setExamFeeSem1] = useState(1500);
  const [examFeeSem2, setExamFeeSem2] = useState(1500);
  const [description, setDescription] = useState('');

  const resetForm = () => {
    setName('');
    setCode('');
    setBaseCourseType('DIT');
    setDurationMonths(12);
    setMonthlyFee(2000);
    setAdmissionFee(3000);
    setExamFeeSem1(1500);
    setExamFeeSem2(1500);
    setDescription('');
    setShowAddForm(false);
    setEditingCourseId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCourseId) {
      const existing = courses.find(c => c.id === editingCourseId);
      if (existing) {
        onUpdateCourse({
          ...existing,
          name: name.trim(),
          code: code.trim() || name.slice(0, 4).toUpperCase(),
          baseCourseType,
          durationMonths: Number(durationMonths) || 1,
          monthlyFee: Number(monthlyFee) || 0,
          admissionFee: Number(admissionFee) || 0,
          examFeeSem1: baseCourseType === 'DIT' ? Number(examFeeSem1) || 0 : 0,
          examFeeSem2: baseCourseType === 'DIT' ? Number(examFeeSem2) || 0 : 0,
          description: description.trim(),
        });
      }
    } else {
      const newCourse: Course = {
        id: `course-${Date.now()}`,
        name: name.trim(),
        code: code.trim() || `${baseCourseType}-${new Date().getFullYear()}`,
        baseCourseType,
        durationMonths: Number(durationMonths) || 1,
        monthlyFee: Number(monthlyFee) || 0,
        admissionFee: Number(admissionFee) || 0,
        examFeeSem1: baseCourseType === 'DIT' ? Number(examFeeSem1) || 0 : 0,
        examFeeSem2: baseCourseType === 'DIT' ? Number(examFeeSem2) || 0 : 0,
        description: description.trim(),
        active: true,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      onAddCourse(newCourse);
    }

    resetForm();
  };

  const startEdit = (course: Course) => {
    setEditingCourseId(course.id);
    setName(course.name);
    setCode(course.code);
    setBaseCourseType(course.baseCourseType);
    setDurationMonths(course.durationMonths);
    setMonthlyFee(course.monthlyFee);
    setAdmissionFee(course.admissionFee);
    setExamFeeSem1(course.examFeeSem1);
    setExamFeeSem2(course.examFeeSem2);
    setDescription(course.description || '');
    setShowAddForm(true);
  };

  // Helper to count active enrolled students per course
  const getEnrolledCount = (courseId: string) => {
    return students.filter(s => s.status === 'active' && s.courses.some(c => c.courseId === courseId)).length;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-sm flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-2xl font-bold">
            Cm
          </div>
          <div>
            <h2 className="font-serif italic font-bold text-2xl text-[#1A1A1A]">Course & Batch Management</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Add & manage courses, batches (DIT 2026-27, CIT, English, Web Dev), duration & fee rules</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {currentRole === 'super_admin' && (
            <button
              onClick={() => {
                setNewCategoryInput('');
                setShowAddCategoryModal(true);
              }}
              className="px-4 py-2.5 bg-white hover:bg-[#F4F2EE] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest border-2 border-[#1A1A1A] flex items-center space-x-2 transition"
            >
              <Layers className="w-4 h-4" />
              <span>Add Base Category</span>
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Course / Batch</span>
          </button>
        </div>
      </div>

      {/* Add Base Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 max-w-md w-full shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">Add New Base Category</h3>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-[#1A1A1A] hover:opacity-70">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryInput.trim()) return;
                if (onAddBaseCategory) {
                  onAddBaseCategory(newCategoryInput.trim());
                }
                setShowAddCategoryModal(false);
                setNewCategoryInput('');
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Mobile App Development, Networking"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs font-bold text-[#1A1A1A] focus:outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-2 border-t border-[#1A1A1A]/20">
                <button
                  type="button"
                  onClick={() => setShowAddCategoryModal(false)}
                  className="px-4 py-2 border border-[#1A1A1A] text-xs font-bold uppercase hover:bg-[#F4F2EE] transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase hover:bg-[#333] transition"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Form Modal */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-md text-[#1A1A1A]">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#1A1A1A] mb-4">
            <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
              {editingCourseId ? 'Edit Course / Batch' : 'Add New Course / Batch (e.g. DIT Batch 2026-27)'}
            </h3>
            <button onClick={resetForm} className="text-[#1A1A1A] hover:opacity-70 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Course Name / Batch *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. DIT Batch 2026-27"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Base Category *
                </label>
                <select
                  value={baseCourseType}
                  onChange={(e) => setBaseCourseType(e.target.value)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-medium focus:bg-white focus:outline-none"
                >
                  {allBaseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={durationMonths}
                  onChange={(e) => setDurationMonths(Number(e.target.value))}
                  placeholder="12"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Monthly Fee (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(Number(e.target.value))}
                  placeholder="2000"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Admission Fee (PKR) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={admissionFee}
                  onChange={(e) => setAdmissionFee(Number(e.target.value))}
                  placeholder="3000"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
                />
              </div>

              {baseCourseType === 'DIT' && (
                <>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                      1st Sem Exam Fee (DIT Only)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={examFeeSem1}
                      onChange={(e) => setExamFeeSem1(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                      2nd Sem Exam Fee (DIT Only)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={examFeeSem2}
                      onChange={(e) => setExamFeeSem2(Number(e.target.value))}
                      placeholder="1500"
                      className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:bg-white focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="md:col-span-3">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">
                  Course Description
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief course objectives & curriculum details"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:bg-white focus:outline-none"
                />
              </div>

            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A1A1A]">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#F4F2EE] text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#1A1A1A] text-white hover:bg-[#333] border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest flex items-center space-x-1"
              >
                <Check className="w-4 h-4" />
                <span>Save Course</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map(course => {
          const count = getEnrolledCount(course.id);
          const isDit = course.baseCourseType === 'DIT';
          const totalFeeForCourse = (course.durationMonths * course.monthlyFee) + course.admissionFee + course.examFeeSem1 + course.examFeeSem2;

          return (
            <div
              key={course.id}
              className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:bg-[#FDFCFB] transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F2EE] text-[#1A1A1A] font-bold border border-[#1A1A1A]">
                      {course.code}
                    </span>
                    <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] mt-2">{course.name}</h3>
                  </div>

                  <span className="text-xs px-2.5 py-1 bg-[#1A1A1A] text-white border border-[#1A1A1A] font-bold flex items-center space-x-1">
                    <Users className="w-3 h-3" />
                    <span>{count} Enrolled</span>
                  </span>
                </div>

                <p className="text-xs text-[#1A1A1A]/70 mt-2 line-clamp-2">
                  {course.description || 'Standard technical training module at Taleem Institute.'}
                </p>

                <div className="mt-4 pt-3 border-t border-[#1A1A1A] space-y-1.5 text-xs text-[#1A1A1A]">
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60 font-bold uppercase text-[10px]">Duration:</span>
                    <span className="font-bold">{course.durationMonths} Months</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60 font-bold uppercase text-[10px]">Monthly Fee:</span>
                    <span className="font-mono text-emerald-800 font-bold">{formatPKR(course.monthlyFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60 font-bold uppercase text-[10px]">Admission Fee:</span>
                    <span className="font-mono text-[#1A1A1A]">{formatPKR(course.admissionFee)}</span>
                  </div>
                  {isDit && (
                    <div className="flex justify-between text-[#1A1A1A] text-[11px]">
                      <span className="font-bold uppercase text-[10px]">Exam Fees (1st & 2nd Sem):</span>
                      <span className="font-mono font-bold">{formatPKR(course.examFeeSem1 + course.examFeeSem2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-[#1A1A1A] text-[#1A1A1A]">
                    <span className="uppercase text-[10px]">Total Package:</span>
                    <span className="font-mono">{formatPKR(totalFeeForCourse)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#1A1A1A]/20">
                <button
                  onClick={() => startEdit(course)}
                  className="px-3 py-1.5 bg-[#F4F2EE] hover:bg-white text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider flex items-center space-x-1"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => setCourseToDelete(course)}
                  className="px-2.5 py-1.5 bg-rose-50 text-rose-900 border border-rose-800 text-xs font-bold uppercase tracking-wider hover:bg-rose-100 transition rounded"
                  title="Delete Course"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Delete Course Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!courseToDelete}
        title="Delete Course / Batch"
        message="Are you sure you want to delete this course from the institute database?"
        itemName={courseToDelete ? `${courseToDelete.name} (${courseToDelete.code})` : undefined}
        confirmText="Delete Course"
        onConfirm={() => {
          if (courseToDelete) {
            onDeleteCourse(courseToDelete.id);
            setCourseToDelete(null);
          }
        }}
        onClose={() => setCourseToDelete(null)}
      />

    </div>
  );
};
