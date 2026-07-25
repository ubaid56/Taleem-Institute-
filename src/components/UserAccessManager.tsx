import React, { useState } from 'react';
import { StaffUser, UserRole, Course } from '../types';
import { ShieldCheck, UserPlus, ShieldAlert, UserCheck, BookOpenCheck, Edit2, Trash2, Check, X, KeyRound, Eye, EyeOff, Lock, Camera, Upload, User, DollarSign, Search, Building2, Phone, Mail, Award } from 'lucide-react';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';
import { formatPKR } from '../lib/utils';

interface UserAccessManagerProps {
  users: StaffUser[];
  courses: Course[];
  onAddUser: (user: StaffUser) => void;
  onUpdateUser: (user: StaffUser) => void;
  onDeleteUser: (userId: string) => void;
}

export const UserAccessManager: React.FC<UserAccessManagerProps> = ({
  users,
  courses,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userToDelete, setUserToDelete] = useState<StaffUser | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form Fields
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('teacher');
  const [hasLoginAccess, setHasLoginAccess] = useState<boolean>(true);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [cnic, setCnic] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [baseSalary, setBaseSalary] = useState<string>('0');
  const [assignedCourses, setAssignedCourses] = useState<string[]>([]);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Permissions
  const [canAddStudent, setCanAddStudent] = useState(true);
  const [canEditStudent, setCanEditStudent] = useState(false);
  const [canDeleteStudent, setCanDeleteStudent] = useState(false);
  const [canSubmitFee, setCanSubmitFee] = useState(true);
  const [canManageCourses, setCanManageCourses] = useState(false);
  const [canViewFinancials, setCanViewFinancials] = useState(false);
  const [canTakeAttendance, setCanTakeAttendance] = useState(true);
  const [canManageStatus, setCanManageStatus] = useState(false);
  const [canManageUsers, setCanManageUsers] = useState(false);
  const [canManageExpenses, setCanManageExpenses] = useState(false);
  const [canManagePayroll, setCanManagePayroll] = useState(false);

  const resetForm = () => {
    setName('');
    setUsername('');
    setPassword('');
    setRole('teacher');
    setHasLoginAccess(true);
    setEmail('');
    setPhone('');
    setDesignation('');
    setCnic('');
    setPhotoUrl('');
    setBaseSalary('0');
    setAssignedCourses([]);
    setCanAddStudent(false);
    setCanEditStudent(false);
    setCanDeleteStudent(false);
    setCanSubmitFee(false);
    setCanManageCourses(false);
    setCanViewFinancials(false);
    setCanTakeAttendance(true);
    setCanManageStatus(false);
    setCanManageUsers(false);
    setCanManageExpenses(false);
    setCanManagePayroll(false);
    setShowAddModal(false);
    setEditingUserId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePasswordVisibility = (userId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  const handleRoleChangePreset = (newRole: UserRole) => {
    setRole(newRole);
    if (newRole === 'super_admin') {
      setHasLoginAccess(true);
      setCanAddStudent(true);
      setCanEditStudent(true);
      setCanDeleteStudent(true);
      setCanSubmitFee(true);
      setCanManageCourses(true);
      setCanViewFinancials(true);
      setCanTakeAttendance(true);
      setCanManageStatus(true);
      setCanManageUsers(true);
      setCanManageExpenses(true);
      setCanManagePayroll(true);
    } else if (newRole === 'accountant') {
      setHasLoginAccess(true);
      setCanAddStudent(true);
      setCanEditStudent(false);
      setCanDeleteStudent(false);
      setCanSubmitFee(true);
      setCanManageCourses(false);
      setCanViewFinancials(true);
      setCanTakeAttendance(false);
      setCanManageStatus(false);
      setCanManageUsers(false);
      setCanManageExpenses(true);
      setCanManagePayroll(false);
    } else if (newRole === 'teacher') {
      setHasLoginAccess(true);
      setCanAddStudent(false);
      setCanEditStudent(false);
      setCanDeleteStudent(false);
      setCanSubmitFee(false);
      setCanManageCourses(false);
      setCanViewFinancials(false);
      setCanTakeAttendance(true);
      setCanManageStatus(false);
      setCanManageUsers(false);
      setCanManageExpenses(false);
      setCanManagePayroll(false);
    } else if (newRole === 'other_staff') {
      setHasLoginAccess(false);
      if (!designation) {
        setDesignation('Chokidar / Class 4');
      }
      setCanAddStudent(false);
      setCanEditStudent(false);
      setCanDeleteStudent(false);
      setCanSubmitFee(false);
      setCanManageCourses(false);
      setCanViewFinancials(false);
      setCanTakeAttendance(false);
      setCanManageStatus(false);
      setCanManageUsers(false);
      setCanManageExpenses(false);
      setCanManagePayroll(false);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Auto-generate a clean username if login access is not needed and username was left blank
    let finalUsername = username.trim().toLowerCase();
    if (!finalUsername) {
      if (!hasLoginAccess || role === 'other_staff') {
        const cleanTitle = (designation || 'staff').toLowerCase().replace(/[^a-z0-9]/g, '');
        finalUsername = `staff_${cleanTitle}_${Math.floor(1000 + Math.random() * 9000)}`;
      } else {
        alert('Username is required for staff members with portal login access.');
        return;
      }
    }

    const userObj: StaffUser = {
      id: editingUserId || `usr-${Date.now()}`,
      name: name.trim(),
      username: finalUsername,
      password: password.trim() || (hasLoginAccess ? '123456' : ''),
      hasLoginAccess,
      role,
      email: email.trim(),
      phone: phone.trim(),
      designation: designation.trim() || (role === 'other_staff' ? 'Support Staff / Class 4' : undefined),
      cnic: cnic.trim() || undefined,
      photoUrl: photoUrl.trim() || undefined,
      baseSalary: parseFloat(baseSalary) || 0,
      assignedCourses,
      permissions: {
        canAddStudent: hasLoginAccess ? canAddStudent : false,
        canEditStudent: role === 'super_admin' ? true : (hasLoginAccess ? canEditStudent : false),
        canDeleteStudent: role === 'super_admin' ? true : (hasLoginAccess ? canDeleteStudent : false),
        canSubmitFee: hasLoginAccess ? canSubmitFee : false,
        canManageCourses: hasLoginAccess ? canManageCourses : false,
        canViewFinancials: hasLoginAccess ? canViewFinancials : false,
        canTakeAttendance: hasLoginAccess ? canTakeAttendance : false,
        canManageStatus: role === 'super_admin' ? true : (hasLoginAccess ? canManageStatus : false),
        canManageUsers: role === 'super_admin' ? true : (hasLoginAccess ? canManageUsers : false),
        canManageExpenses: role === 'super_admin' ? true : (hasLoginAccess ? (canManageExpenses || role === 'accountant') : false),
        canManagePayroll: role === 'super_admin' ? true : (hasLoginAccess ? canManagePayroll : false),
      },
    };

    if (editingUserId) {
      onUpdateUser(userObj);
    } else {
      onAddUser(userObj);
    }

    resetForm();
  };

  const startEdit = (usr: StaffUser) => {
    setEditingUserId(usr.id);
    setName(usr.name);
    setUsername(usr.username);
    setPassword(usr.password || '');
    setHasLoginAccess(usr.hasLoginAccess !== false);
    setRole(usr.role);
    setEmail(usr.email);
    setPhone(usr.phone);
    setDesignation(usr.designation || '');
    setCnic(usr.cnic || '');
    setPhotoUrl(usr.photoUrl || '');
    setBaseSalary(String(usr.baseSalary || 0));
    setAssignedCourses(usr.assignedCourses || []);
    setCanAddStudent(usr.permissions.canAddStudent);
    setCanEditStudent(usr.permissions.canEditStudent ?? (usr.role === 'super_admin'));
    setCanDeleteStudent(usr.permissions.canDeleteStudent ?? (usr.role === 'super_admin'));
    setCanSubmitFee(usr.permissions.canSubmitFee);
    setCanManageCourses(usr.permissions.canManageCourses);
    setCanViewFinancials(usr.permissions.canViewFinancials);
    setCanTakeAttendance(usr.permissions.canTakeAttendance);
    setCanManageStatus(usr.permissions.canManageStatus ?? (usr.role === 'super_admin'));
    setCanManageUsers(usr.permissions.canManageUsers ?? (usr.role === 'super_admin'));
    setCanManageExpenses(usr.permissions.canManageExpenses ?? (usr.role === 'accountant' || usr.role === 'super_admin'));
    setCanManagePayroll(usr.permissions.canManagePayroll ?? (usr.role === 'super_admin'));
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto text-[#1A1A1A]">
      
      {/* Header */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#1A1A1A] text-white flex items-center justify-center shrink-0 font-serif italic text-xl sm:text-2xl font-bold">
            Us
          </div>
          <div className="min-w-0">
            <h2 className="font-serif italic font-bold text-xl sm:text-2xl text-[#1A1A1A]">Staff Access & Role Permissions</h2>
            <p className="text-[10px] uppercase tracking-widest text-[#1A1A1A]/70 font-bold">Super Admin role control for Accountants & Course Teachers</p>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
          className="w-full md:w-auto px-5 py-2.5 bg-[#1A1A1A] hover:bg-[#333] text-white font-bold text-xs uppercase tracking-widest border border-[#1A1A1A] flex items-center justify-center space-x-2 transition shrink-0"
        >
          <UserPlus className="w-4 h-4 shrink-0" />
          <span>Add Staff Account</span>
        </button>
      </div>

      {/* Add / Edit Form Modal */}
      {showAddModal && (
        <div className="bg-white border-2 border-[#1A1A1A] p-6 shadow-2xl text-[#1A1A1A]">
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#1A1A1A] mb-4">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-5 h-5 text-[#1A1A1A]" />
              <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A]">
                {editingUserId ? 'Edit Staff Registration & Access' : 'Register New Staff Member'}
              </h3>
            </div>
            <button onClick={resetForm} className="text-[#1A1A1A] hover:bg-[#F4F2EE] px-2.5 py-1 font-bold border border-[#1A1A1A]">✕</button>
          </div>

          <form onSubmit={handleSaveUser} className="space-y-5">
            
            {/* Photo & Basic Details Header */}
            <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-[#F4F2EE] border-2 border-[#1A1A1A]">
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-none border-2 border-[#1A1A1A] bg-white overflow-hidden flex items-center justify-center">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Staff Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-[#1A1A1A]/40" />
                  )}
                </div>
                {photoUrl && (
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute -top-2 -right-2 bg-rose-800 text-white rounded-full p-1 text-[10px] shadow"
                    title="Remove Photo"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Staff Profile Photo</label>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <label className="px-3 py-1.5 bg-[#1A1A1A] hover:bg-[#333] text-white text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center space-x-1">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload Picture</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>

                  <span className="text-[10px] text-[#1A1A1A]/60 uppercase font-bold">OR Photo URL:</span>
                  <input
                    type="url"
                    value={photoUrl}
                    onChange={(e) => setPhotoUrl(e.target.value)}
                    placeholder="https://..."
                    className="bg-white border border-[#1A1A1A] px-2.5 py-1 text-xs font-mono w-full sm:w-64 focus:outline-none"
                  />
                </div>
                <p className="text-[10px] font-mono text-[#1A1A1A]/60">Supports JPEG, PNG or WebP images up to 2MB</p>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Full Staff Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Asad Khan / Gul Zada"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Select Access Role *</label>
                <select
                  value={role}
                  onChange={(e) => handleRoleChangePreset(e.target.value as any)}
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-bold uppercase focus:outline-none"
                >
                  <option value="super_admin">Super Admin (Owner / Director)</option>
                  <option value="accountant">Accountant (Fees, Admissions & Expenses)</option>
                  <option value="teacher">Course Teacher (QR Attendance & Courses)</option>
                  <option value="other_staff">Support Staff / Class 4 / Other (Chokidar, Peon, Sweeper, etc.)</option>
                </select>
              </div>

              <div className="sm:col-span-2 md:col-span-1">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Designation / Title</label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Chokidar / Class 4 / Lecturer"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                />
                {/* Quick Designation Preset Chips */}
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {[
                    '🛡️ Chokidar / Security',
                    '🧹 Class 4 / Peon',
                    '🚗 Driver',
                    '🔧 Maintenance / Gardener',
                    '💻 Lab Assistant'
                  ].map(chip => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setDesignation(chip.replace(/^[^\w\s]+/, '').trim())}
                      className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white border border-[#1A1A1A] text-[#1A1A1A] transition rounded"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">CNIC / Govt ID No.</label>
                <input
                  type="text"
                  value={cnic}
                  onChange={(e) => setCnic(e.target.value)}
                  placeholder="e.g. 17301-1234567-1"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="staff@tist.edu.pk"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0333-4445556"
                  className="w-full bg-[#FDFCFB] border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-emerald-900 mb-1">Monthly Base Salary (PKR)</label>
                <input
                  type="number"
                  min="0"
                  value={baseSalary}
                  onChange={(e) => setBaseSalary(e.target.value)}
                  placeholder="e.g. 25000"
                  className="w-full bg-emerald-50 border border-emerald-800 px-3.5 py-2 text-xs font-mono font-bold text-emerald-950 focus:outline-none"
                />
              </div>

            </div>

            {/* Portal Access Control & Credentials Box */}
            <div className="p-4 bg-[#F4F2EE] border-2 border-[#1A1A1A] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[#1A1A1A]/30">
                <label className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasLoginAccess}
                    onChange={(e) => {
                      const enabled = e.target.checked;
                      setHasLoginAccess(enabled);
                      if (!enabled) {
                        setCanAddStudent(false);
                        setCanSubmitFee(false);
                        setCanTakeAttendance(false);
                      }
                    }}
                    className="w-4 h-4 accent-[#1A1A1A]"
                  />
                  <span>Allow System Portal Login Access Credentials</span>
                </label>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 border ${
                  hasLoginAccess ? 'bg-emerald-100 text-emerald-900 border-emerald-400' : 'bg-slate-200 text-slate-800 border-slate-400'
                }`}>
                  {hasLoginAccess ? '🔑 System Login Enabled' : '🔒 No System Access Required (Class 4 / Chokidar)'}
                </span>
              </div>

              {hasLoginAccess ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1">Username *</label>
                    <input
                      type="text"
                      required={hasLoginAccess}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. asad_teacher"
                      className="w-full bg-white border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-1 flex items-center justify-between">
                      <span>Login Password *</span>
                      <span className="text-[9px] text-amber-800 font-bold bg-amber-100 px-1 border border-amber-300">Secret</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required={hasLoginAccess}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Set password (e.g. pass123)"
                        className="w-full bg-white border border-[#1A1A1A] px-3.5 py-2 text-xs text-[#1A1A1A] font-mono focus:outline-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#1A1A1A]/80 font-mono space-y-1">
                  <p className="font-bold text-[#1A1A1A]">ℹ️ Login access disabled for this staff member.</p>
                  <p className="text-[11px]">They can still receive monthly base salary and advance loan payouts in the Staff Payroll module without needing a login username or password.</p>
                  {username && <p className="text-[10px] text-slate-600">Internal Reference ID: @{username}</p>}
                </div>
              )}
            </div>

            {/* Course Assignments if Teacher */}
            {role === 'teacher' && (
              <div className="pt-2 border-t-2 border-[#1A1A1A]">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Assigned Teaching Courses</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {courses.map(course => {
                    const isAssigned = assignedCourses.includes(course.id);
                    return (
                      <label key={course.id} className={`p-2 border flex items-center space-x-2 text-xs cursor-pointer ${
                        isAssigned ? 'bg-emerald-50 border-emerald-800 font-bold text-emerald-950' : 'bg-[#FDFCFB] border-[#1A1A1A]'
                      }`}>
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedCourses([...assignedCourses, course.id]);
                            } else {
                              setAssignedCourses(assignedCourses.filter(id => id !== course.id));
                            }
                          }}
                          className="accent-emerald-800"
                        />
                        <span className="truncate">{course.title} ({course.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Permissions Checklist */}
            <div className="pt-2 border-t-2 border-[#1A1A1A]">
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#1A1A1A] mb-2">Custom Permission Flags</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-bold uppercase tracking-wider">
                
                <label className="flex items-center space-x-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canAddStudent}
                    onChange={(e) => setCanAddStudent(e.target.checked)}
                    className="accent-[#1A1A1A]"
                  />
                  <span>Can Add Students</span>
                </label>

                <label className="flex items-center space-x-2 bg-amber-50 p-2.5 border border-amber-800 text-amber-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canEditStudent}
                    onChange={(e) => setCanEditStudent(e.target.checked)}
                    className="accent-amber-900"
                  />
                  <span>Can Edit / Update Students</span>
                </label>

                <label className="flex items-center space-x-2 bg-rose-50 p-2.5 border border-rose-800 text-rose-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canDeleteStudent}
                    onChange={(e) => setCanDeleteStudent(e.target.checked)}
                    className="accent-rose-900"
                  />
                  <span>Can Delete Students</span>
                </label>

                <label className="flex items-center space-x-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canSubmitFee}
                    onChange={(e) => setCanSubmitFee(e.target.checked)}
                    className="accent-[#1A1A1A]"
                  />
                  <span>Can Submit Fee & Print Receipts</span>
                </label>

                <label className="flex items-center space-x-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canTakeAttendance}
                    onChange={(e) => setCanTakeAttendance(e.target.checked)}
                    className="accent-[#1A1A1A]"
                  />
                  <span>Can Take QR Attendance</span>
                </label>

                <label className="flex items-center space-x-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canViewFinancials}
                    onChange={(e) => setCanViewFinancials(e.target.checked)}
                    className="accent-[#1A1A1A]"
                  />
                  <span>Can View Financial Reports</span>
                </label>

                <label className="flex items-center space-x-2 bg-[#F4F2EE] p-2.5 border border-[#1A1A1A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageCourses}
                    onChange={(e) => setCanManageCourses(e.target.checked)}
                    className="accent-[#1A1A1A]"
                  />
                  <span>Can Manage Courses & Batches</span>
                </label>

                <label className="flex items-center space-x-2 bg-blue-50 p-2.5 border border-blue-800 text-blue-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageStatus}
                    onChange={(e) => setCanManageStatus(e.target.checked)}
                    className="accent-blue-900"
                  />
                  <span>Can Manage Pass Out / Suspended</span>
                </label>

                <label className="flex items-center space-x-2 bg-purple-50 p-2.5 border border-purple-800 text-purple-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManageUsers}
                    onChange={(e) => setCanManageUsers(e.target.checked)}
                    className="accent-purple-900"
                  />
                  <span>Can Manage Staff & Access</span>
                </label>

                <label className="flex items-center space-x-2 bg-emerald-50 p-2.5 border border-emerald-800 text-emerald-950 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={canManagePayroll}
                    onChange={(e) => setCanManagePayroll(e.target.checked)}
                    className="accent-emerald-900"
                  />
                  <span>Can Manage Staff Salary & Payroll</span>
                </label>

              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t-2 border-[#1A1A1A]">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-[#F4F2EE] text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-[#1A1A1A] hover:bg-[#333] text-white border border-[#1A1A1A] text-xs font-bold uppercase tracking-widest flex items-center space-x-1 shadow-sm"
              >
                <Check className="w-4 h-4" />
                <span>Save Staff Account</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Staff Search & Filter Bar */}
      <div className="bg-white border-2 border-[#1A1A1A] p-4 shadow-sm flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Search className="w-4 h-4 text-[#1A1A1A]/50 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search staff by name, role, phone or designation..."
            className="w-full sm:w-80 bg-[#FDFCFB] border border-[#1A1A1A] px-3 py-2 text-xs font-mono focus:outline-none"
          />
        </div>

        <div className="text-xs font-mono font-bold text-[#1A1A1A]">
          Total Registered Staff: {users.length}
        </div>
      </div>

      {/* User Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {users
          .filter(usr => 
            usr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            usr.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
            usr.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (usr.designation && usr.designation.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (usr.phone && usr.phone.includes(searchQuery))
          )
          .map(usr => (
            <div
              key={usr.id}
              className="bg-white border-2 border-[#1A1A1A] p-5 shadow-sm space-y-4 flex flex-col justify-between text-[#1A1A1A]"
            >
              <div>
                
                {/* Staff Header with Profile Image */}
                <div className="flex items-start space-x-3">
                  <div className="w-14 h-14 border-2 border-[#1A1A1A] bg-[#F4F2EE] shrink-0 overflow-hidden flex items-center justify-center">
                    {usr.photoUrl ? (
                      <img src={usr.photoUrl} alt={usr.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-7 h-7 text-[#1A1A1A]/50" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-serif italic font-bold text-lg text-[#1A1A1A] truncate">{usr.name}</h3>
                      <span className={`px-2 py-0.5 text-[9px] font-bold uppercase border shrink-0 ${
                        usr.role === 'other_staff'
                          ? 'bg-amber-100 text-amber-900 border-amber-400'
                          : 'bg-[#F4F2EE] text-[#1A1A1A] border-[#1A1A1A]'
                      }`}>
                        {usr.role === 'other_staff' ? 'Support / Class 4' : usr.role.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-700 truncate">{usr.designation || 'Staff Member'}</p>
                    <p className="font-mono text-[11px] text-[#1A1A1A]/70 font-bold">@{usr.username}</p>
                  </div>
                </div>

                {/* Login Credentials Box */}
                {usr.hasLoginAccess !== false ? (
                  <div className="mt-4 p-2.5 bg-slate-100 border border-[#1A1A1A] space-y-1 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-600">Portal Login:</span>
                      <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-900 px-1 border border-emerald-300">🔑 Enabled</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-600">Username:</span>
                      <span className="font-bold text-slate-900">@{usr.username}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-600">Password:</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-[#1A1A1A] bg-white px-1.5 py-0.5 border border-slate-300">
                          {showPasswordMap[usr.id] ? (usr.password || '123456') : '••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(usr.id)}
                          className="text-slate-600 hover:text-slate-900 p-0.5"
                          title={showPasswordMap[usr.id] ? "Hide Password" : "Show Password"}
                        >
                          {showPasswordMap[usr.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-2.5 bg-slate-50 border border-dashed border-slate-400 space-y-1 text-xs font-mono text-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Portal Access:</span>
                      <span className="text-[9px] font-bold uppercase bg-slate-200 text-slate-800 px-1.5 py-0.5 border border-slate-400">🔒 Disabled (No Login Required)</span>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-0.5">Staff Ref ID: @{usr.username}</p>
                  </div>
                )}

                {/* Contact & Financial Info */}
                <div className="mt-3 space-y-1 text-xs text-[#1A1A1A] font-mono">
                  {usr.cnic && <p className="text-[11px]">Govt CNIC: <strong>{usr.cnic}</strong></p>}
                  <p className="text-[11px]">Phone: <strong>{usr.phone || 'N/A'}</strong></p>
                  <p className="text-[11px] truncate">Email: <strong>{usr.email || 'N/A'}</strong></p>
                  <p className="text-[11px] text-emerald-900 font-bold">Base Salary: <strong>{formatPKR(usr.baseSalary || 0)}</strong></p>
                </div>

                {/* Assigned Teaching Courses if Any */}
                {usr.assignedCourses && usr.assignedCourses.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[#1A1A1A]/20">
                    <p className="text-[10px] uppercase font-bold text-[#1A1A1A]/70">Teaching Courses:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {usr.assignedCourses.map(cid => {
                        const c = courses.find(course => course.id === cid);
                        return c ? (
                          <span key={cid} className="text-[9px] font-bold uppercase px-1.5 py-0.5 bg-emerald-100 text-emerald-900 border border-emerald-300">
                            {c.code}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Permissions Badges */}
                <div className="mt-3 pt-3 border-t border-[#1A1A1A] space-y-1">
                  <p className="text-[10px] uppercase text-[#1A1A1A] font-bold tracking-widest">Active Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {usr.permissions.canAddStudent && <span className="text-[9px] px-2 py-0.5 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] font-bold uppercase">Add Student</span>}
                    {(usr.role === 'super_admin' || usr.permissions.canEditStudent) && <span className="text-[9px] px-2 py-0.5 border border-amber-800 bg-amber-50 text-amber-900 font-bold uppercase">Edit Student</span>}
                    {(usr.role === 'super_admin' || usr.permissions.canDeleteStudent) && <span className="text-[9px] px-2 py-0.5 border border-rose-800 bg-rose-50 text-rose-900 font-bold uppercase">Delete Student</span>}
                    {usr.permissions.canSubmitFee && <span className="text-[9px] px-2 py-0.5 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] font-bold uppercase">Submit Fee</span>}
                    {usr.permissions.canTakeAttendance && <span className="text-[9px] px-2 py-0.5 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] font-bold uppercase">QR Attendance</span>}
                    {usr.permissions.canViewFinancials && <span className="text-[9px] px-2 py-0.5 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] font-bold uppercase">Financial Reports</span>}
                    {usr.permissions.canManageCourses && <span className="text-[9px] px-2 py-0.5 border border-[#1A1A1A] bg-[#FDFCFB] text-[#1A1A1A] font-bold uppercase">Courses Admin</span>}
                    {(usr.role === 'super_admin' || usr.permissions.canManageStatus) && <span className="text-[9px] px-2 py-0.5 border border-blue-800 bg-blue-50 text-blue-900 font-bold uppercase">Pass Out / Suspended</span>}
                    {(usr.role === 'super_admin' || usr.permissions.canManageUsers) && <span className="text-[9px] px-2 py-0.5 border border-purple-800 bg-purple-50 text-purple-900 font-bold uppercase">Staff & Access</span>}
                    {usr.permissions.canManageExpenses && <span className="text-[9px] px-2 py-0.5 border border-indigo-800 bg-indigo-50 text-indigo-900 font-bold uppercase">Expense Manager</span>}
                    {usr.permissions.canManagePayroll && <span className="text-[9px] px-2 py-0.5 border border-emerald-800 bg-emerald-50 text-emerald-900 font-bold uppercase">Staff Salary & Payroll</span>}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#1A1A1A]">
                <button
                  onClick={() => startEdit(usr)}
                  className="px-3 py-1.5 bg-[#F4F2EE] hover:bg-[#1A1A1A] hover:text-white text-[#1A1A1A] border border-[#1A1A1A] text-xs font-bold uppercase tracking-wider flex items-center space-x-1 transition"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>

                {usr.role !== 'super_admin' && (
                  <button
                    onClick={() => setUserToDelete(usr)}
                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-800 text-xs transition rounded"
                    title="Delete Staff User"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-800" />
                  </button>
                )}
              </div>

            </div>
          ))}
      </div>

      {/* Delete User Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!userToDelete}
        title="Delete Staff Account"
        message="Are you sure you want to delete this staff user account?"
        itemName={userToDelete ? `${userToDelete.name} (@${userToDelete.username})` : undefined}
        confirmText="Delete Staff Account"
        onConfirm={() => {
          if (userToDelete) {
            onDeleteUser(userToDelete.id);
            setUserToDelete(null);
          }
        }}
        onClose={() => setUserToDelete(null)}
      />

    </div>
  );
};
