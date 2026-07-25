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
  onUpdateBaseCategory?: (oldName: string, newName: string) => void;
  onDeleteBaseCategory?: (catName: string) => void;
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
  onUpdateBaseCategory,
  onDeleteBaseCategory,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');
  const [editingCategoryOldName, setEditingCategoryOldName] = useState<string | null>(null);
  const [editingCategoryNewName, setEditingCategoryNewName] = useState('');
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const defaultBaseCategories = ['DIT', 'CIT', 'English Language', 'Web Development', 'Graphics Designing', 'YouTube Automation', 'Course Wise', 'Other'];
  const allBaseCategories = customBaseCategories && customBaseCategories.length > 0 ? customBaseCategories : defaultBaseCategories;

  // New Course Fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [baseCourseType, setBaseCourseType] = useState<Course['baseCourseType']>('DIT');
  const [durationMonths, setDurationMonths] = useState(12);
  const [monthlyFee, setMonthlyFee] = useState(2000);
  const [admissionFee, setAdmissionFee] = useState(3000);
  const [examFeeSem1, setExamFeeSem1] = useState(1500);
  const [examFeeSem2, setExamFeeSem2] = useState(1500);
  const [totalCourseFee, setTotalCourseFee] = useState(8000);
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
    setTotalCourseFee(8000);
    setDescription('');
    setShowAddForm(false);
    setEditingCourseId(null);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const isCourseWise = baseCourseType === 'Course Wise';

    if (editingCourseId) {
      const existing = courses.find(c => c.id === editingCourseId);
      if (existing) {
        onUpdateCourse({
          ...existing,
          name: name.trim(),
          code: code.trim() || name.slice(0, 4).toUpperCase(),
          baseCourseType,
          durationMonths: Number(durationMonths) || 1,
          monthlyFee: isCourseWise ? 0 : Number(monthlyFee) || 0,
          admissionFee: isCourseWise ? 0 : Number(admissionFee) || 0,
          examFeeSem1: baseCourseType === 'DIT' ? Number(examFeeSem1) || 0 : 0,
          examFeeSem2: baseCourseType === 'DIT' ? Number(examFeeSem2) || 0 : 0,
          totalCourseFee: isCourseWise ? Number(totalCourseFee) || 0 : ((Number(durationMonths) || 1) * (Number(monthlyFee) || 0) + (Number(admissionFee) || 0)),
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
        monthlyFee: isCourseWise ? 0 : Number(monthlyFee) || 0,
        admissionFee: isCourseWise ? 0 : Number(admissionFee) || 0,
        examFeeSem1: baseCourseType === 'DIT' ? Number(examFeeSem1) || 0 : 0,
        examFeeSem2: baseCourseType === 'DIT' ? Number(examFeeSem2) || 0 : 0,
        totalCourseFee: isCourseWise ? Number(totalCourseFee) || 0 : ((Number(durationMonths) || 1) * (Number(monthlyFee) || 0) + (Number(admissionFee) || 0)),
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
    setTotalCourseFee(course.totalCourseFee || (course.durationMonths * course.monthlyFee + course.admissionFee));
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
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl sm:text-2xl font-bold">
            Cm
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A] leading-tight">Course & Batch Management</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold leading-normal">Add & manage courses, batches (DIT 2026-27, CIT, English, Web Dev), duration & fee rules</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto shrink-0">
          {currentRole === 'super_admin' && (
            <button
              onClick={() => {
                setNewCategoryInput('');
                setEditingCategoryOldName(null);
                setShowCategoryModal(true);
              }}
              className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-white hover:bg-[#F4F2EE] text-[#1A1A1A] font-bold text-xs uppercase tracking-widest border-2 border-[#1A1A1A] flex items-center space-x-2 transition"
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>Manage Base Categories</span>
            </button>
          )}

          <button
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
            className="flex-1 sm:flex-none justify-center px-3.5 sm:px-4 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center space-x-2 transition"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>Add New Course / Batch</span>
          </button>
        </div>
      </div>

      {/* Manage Base Categories Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-[#1A1A1A] p-6 max-w-lg w-full shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#1A1A1A]">
              <div className="flex items-center space-x-2">
                <Layers className="w-5 h-5 text-[#1A1A1A]" />
                <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">Base Categories Manager</h3>
              </div>
              <button onClick={() => setShowCategoryModal(false)} className="text-[#1A1A1A] hover:bg-[#F4F2EE] px-2 py-1 border border-[#1A1A1A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Add New Category Box */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCategoryInput.trim()) return;
                if (onAddBaseCategory) {
                  onAddBaseCategory(newCategoryInput.trim());
                }
                setNewCategoryInput('');
              }}
              className="bg-[#F4F2EE] border border-[#1A1A1A] p-3 rounded-lg space-y-2"
            >
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A]">
                ➕ Add New Base Category
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  value={newCategoryInput}
                  onChange={(e) => setNewCategoryInput(e.target.value)}
                  placeholder="e.g. Mobile App Dev, Robotics..."
                  className="flex-1 bg-white border border-[#1A1A1A] px-3 py-1.5 text-xs font-bold text-[#1A1A1A] focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1A1A1A] text-white text-xs font-bold uppercase hover:bg-[#333] transition shrink-0"
                >
                  Add Category
                </button>
              </div>
            </form>

            {/* List of Existing Base Categories */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/70">
                Existing Base Categories ({allBaseCategories.length})
              </h4>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {allBaseCategories.map(catName => {
                  const isEditingThis = editingCategoryOldName === catName;
                  const isDefault = defaultBaseCategories.includes(catName);
                  const coursesCount = courses.filter(c => c.baseCourseType === catName).length;

                  return (
                    <div
                      key={catName}
                      className="flex items-center justify-between p-2.5 bg-white border border-[#1A1A1A] rounded gap-2"
                    >
                      {isEditingThis ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingCategoryNewName}
                            onChange={(e) => setEditingCategoryNewName(e.target.value)}
                            className="flex-1 bg-[#FDFCFB] border border-[#1A1A1A] px-2 py-1 text-xs font-bold text-[#1A1A1A] focus:outline-none"
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              if (editingCategoryNewName.trim() && onUpdateBaseCategory) {
                                onUpdateBaseCategory(catName, editingCategoryNewName.trim());
                              }
                              setEditingCategoryOldName(null);
                            }}
                            className="p-1 bg-emerald-700 text-white hover:bg-emerald-800"
                            title="Save Rename"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingCategoryOldName(null)}
                            className="p-1 bg-gray-300 text-gray-800 hover:bg-gray-400"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-[#1A1A1A] truncate">{catName}</span>
                              {isDefault ? (
                                <span className="text-[9px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 border border-slate-300 rounded">
                                  Default
                                </span>
                              ) : (
                                <span className="text-[9px] bg-purple-100 text-purple-900 font-bold px-1.5 py-0.5 border border-purple-300 rounded">
                                  Custom
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-[#1A1A1A]/60 mt-0.5 font-mono">
                              {coursesCount} course{coursesCount === 1 ? '' : 's'} assigned
                            </p>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => {
                                setEditingCategoryOldName(catName);
                                setEditingCategoryNewName(catName);
                              }}
                              className="p-1.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] transition rounded"
                              title="Rename / Update Category"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => setCategoryToDelete(catName)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-700 hover:text-white border border-rose-800 text-rose-800 transition rounded"
                              title="Delete Base Category"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[#1A1A1A]/20">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="px-5 py-2 bg-[#1A1A1A] text-white text-xs font-bold uppercase hover:bg-[#333] transition"
              >
                Close
              </button>
            </div>
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

              {baseCourseType === 'Course Wise' ? (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-amber-900 mb-1">
                      Total Course Package Fee (Lump-Sum) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={totalCourseFee}
                      onChange={(e) => setTotalCourseFee(Number(e.target.value))}
                      placeholder="8000"
                      className="w-full bg-amber-50 border-2 border-amber-800 px-3.5 py-2 text-xs text-[#1A1A1A] font-mono font-bold focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-3 bg-amber-50 border border-amber-800 p-3 rounded text-xs text-amber-900 font-medium space-y-1">
                    <p className="font-bold flex items-center space-x-1">
                      <span>📌 Course Wise Fee Structure Enabled</span>
                    </p>
                    <p className="text-[11px] leading-relaxed">
                      For <strong>Course Wise</strong> courses, monthly tuition fee and admission fee items are automatically disabled (set to Rs 0). Students enrolled under this category are charged only this fixed lump-sum total course fee.
                    </p>
                  </div>
                </>
              ) : (
                <>
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
                </>
              )}

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
          const isCourseWise = course.baseCourseType === 'Course Wise';
          const totalFeeForCourse = isCourseWise 
            ? (course.totalCourseFee || 0)
            : ((course.durationMonths * course.monthlyFee) + course.admissionFee + course.examFeeSem1 + course.examFeeSem2);

          return (
            <div
              key={course.id}
              className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm flex flex-col justify-between space-y-4 hover:bg-[#FDFCFB] transition"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 bg-[#F4F2EE] text-[#1A1A1A] font-bold border border-[#1A1A1A]">
                        {course.code}
                      </span>
                      {isCourseWise && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-600 font-mono">
                          COURSE WISE
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] mt-2">{course.name}</h3>
                  </div>

                  <span className="text-xs px-2.5 py-1 bg-[#1A1A1A] text-white border border-[#1A1A1A] font-bold flex items-center space-x-1 shrink-0">
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
                    <span className={`font-mono font-bold ${isCourseWise ? 'text-amber-800 text-[11px]' : 'text-emerald-800'}`}>
                      {isCourseWise ? 'N/A (Disabled)' : formatPKR(course.monthlyFee)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#1A1A1A]/60 font-bold uppercase text-[10px]">Admission Fee:</span>
                    <span className={`font-mono ${isCourseWise ? 'text-amber-800 text-[11px]' : 'text-[#1A1A1A]'}`}>
                      {isCourseWise ? 'N/A (Disabled)' : formatPKR(course.admissionFee)}
                    </span>
                  </div>
                  {isDit && (
                    <div className="flex justify-between text-[#1A1A1A] text-[11px]">
                      <span className="font-bold uppercase text-[10px]">Exam Fees (1st & 2nd Sem):</span>
                      <span className="font-mono font-bold">{formatPKR(course.examFeeSem1 + course.examFeeSem2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold pt-1 border-t border-[#1A1A1A] text-[#1A1A1A]">
                    <span className="uppercase text-[10px]">{isCourseWise ? 'Total Course Fee:' : 'Total Package:'}</span>
                    <span className="font-mono text-emerald-800 font-extrabold">{formatPKR(totalFeeForCourse)}</span>
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
