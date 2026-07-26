import React from 'react';
import { UserRole, StaffUser } from '../types';
import { 
  LayoutDashboard, 
  Users,
  UserPlus, 
  BookOpen, 
  Receipt, 
  FileText, 
  QrCode, 
  Contact, 
  GraduationCap, 
  UserX, 
  ShieldCheck,
  ChevronRight,
  Settings,
  X,
  AlertTriangle,
  TrendingDown,
  DollarSign,
  PieChart,
  Database
} from 'lucide-react';

export type TabType = 
  | 'dashboard' 
  | 'students_list'
  | 'add_student' 
  | 'courses' 
  | 'submit_fee' 
  | 'fee_records' 
  | 'defaulter_list'
  | 'expenses'
  | 'staff_payroll'
  | 'financial_statement'
  | 'attendance' 
  | 'id_cards' 
  | 'pass_out' 
  | 'suspended' 
  | 'access_control'
  | 'general_settings'
  | 'backup';

interface SidebarProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentRole: UserRole;
  userPermissions?: StaffUser['permissions'];
  activeStudentsCount: number;
  passOutCount: number;
  suspendedCount: number;
  isMobileMenuOpen?: boolean;
  onCloseMobileMenu?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  currentRole,
  userPermissions,
  activeStudentsCount,
  passOutCount,
  suspendedCount,
  isMobileMenuOpen = false,
  onCloseMobileMenu,
}) => {
  const menuItems: {
    id: TabType;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    roles: UserRole[];
    accentColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      roles: ['super_admin', 'accountant', 'teacher'],
      accentColor: 'text-indigo-500',
    },
    {
      id: 'students_list',
      label: 'Students List & Directory',
      icon: Users,
      badge: activeStudentsCount,
      badgeColor: 'bg-[#1A1A1A] text-white border-slate-600',
      roles: ['super_admin', 'accountant', 'teacher'],
      accentColor: 'text-sky-500',
    },
    {
      id: 'add_student',
      label: 'Admission / Add Student',
      icon: UserPlus,
      roles: ['super_admin', 'accountant'],
      accentColor: 'text-blue-500',
    },
    {
      id: 'submit_fee',
      label: 'Submit Fee & Receipt',
      icon: Receipt,
      roles: ['super_admin', 'accountant'],
      accentColor: 'text-emerald-500',
    },
    {
      id: 'attendance',
      label: 'QR Attendance System',
      icon: QrCode,
      roles: ['super_admin', 'teacher'],
      accentColor: 'text-cyan-500',
    },
    {
      id: 'courses',
      label: 'Course & Batches',
      icon: BookOpen,
      roles: ['super_admin'],
      accentColor: 'text-amber-500',
    },
    {
      id: 'fee_records',
      label: 'Fee Records & Reports',
      icon: FileText,
      roles: ['super_admin', 'accountant'],
      accentColor: 'text-teal-500',
    },
    {
      id: 'defaulter_list',
      label: 'Fee Defaulter List',
      icon: AlertTriangle,
      roles: ['super_admin', 'accountant'],
      accentColor: 'text-rose-500',
    },
    {
      id: 'expenses',
      label: 'Institute Expenses',
      icon: TrendingDown,
      roles: ['super_admin', 'accountant'],
      accentColor: 'text-rose-400',
    },
    {
      id: 'staff_payroll',
      label: 'Staff Salary & Advances',
      icon: DollarSign,
      roles: ['super_admin'],
      accentColor: 'text-emerald-400',
    },
    {
      id: 'financial_statement',
      label: 'Monthly Profit & Loss',
      icon: PieChart,
      roles: ['super_admin'],
      accentColor: 'text-emerald-500',
    },
    {
      id: 'id_cards',
      label: 'Student QR ID Cards',
      icon: Contact,
      roles: ['super_admin', 'accountant', 'teacher'],
      accentColor: 'text-purple-500',
    },
    {
      id: 'pass_out',
      label: 'Pass Out Students',
      icon: GraduationCap,
      badge: passOutCount,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      roles: ['super_admin'],
      accentColor: 'text-emerald-600',
    },
    {
      id: 'suspended',
      label: 'Suspended Students',
      icon: UserX,
      badge: suspendedCount,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
      roles: ['super_admin'],
      accentColor: 'text-rose-500',
    },
    {
      id: 'access_control',
      label: 'Staff Registration & Access',
      icon: ShieldCheck,
      roles: ['super_admin'],
      accentColor: 'text-indigo-600',
    },
    {
      id: 'general_settings',
      label: 'Institute Settings',
      icon: Settings,
      roles: ['super_admin'],
      accentColor: 'text-purple-600',
    },
    {
      id: 'backup',
      label: 'Database Backup & Restore',
      icon: Database,
      roles: ['super_admin'],
      accentColor: 'text-emerald-500',
    },
  ];

  const visibleItems = menuItems.filter(item => {
    if (currentRole === 'super_admin') return true;
    if (item.roles.includes(currentRole)) return true;

    if (!userPermissions) return false;

    switch (item.id) {
      case 'add_student':
        return !!userPermissions.canAddStudent;
      case 'submit_fee':
        return !!userPermissions.canSubmitFee;
      case 'attendance':
        return !!userPermissions.canTakeAttendance;
      case 'courses':
        return !!userPermissions.canManageCourses;
      case 'fee_records':
      case 'defaulter_list':
        return !!userPermissions.canViewFinancials || !!userPermissions.canSubmitFee;
      case 'expenses':
        return !!userPermissions.canManageExpenses || !!userPermissions.canViewFinancials || !!userPermissions.canSubmitFee;
      case 'staff_payroll':
        return !!userPermissions.canManagePayroll || currentRole === 'super_admin' || currentRole === 'accountant';
      case 'financial_statement':
        return !!userPermissions.canViewFinancials;
      case 'pass_out':
      case 'suspended':
        return !!userPermissions.canManageStatus;
      case 'access_control':
        return !!userPermissions.canManageUsers;
      case 'backup':
        return !!userPermissions.canManageUsers || currentRole === 'super_admin';
      default:
        return false;
    }
  });

  const handleItemClick = (id: TabType) => {
    onSelectTab(id);
    if (onCloseMobileMenu) {
      onCloseMobileMenu();
    }
  };

  const sidebarContent = (
    <div className="w-64 bg-slate-900 border-r border-slate-800 shrink-0 min-h-full h-full p-4 flex flex-col justify-between text-slate-100 shadow-xl overflow-y-auto overscroll-contain scroll-smooth touch-pan-y [webkit-overflow-scrolling:touch]">
      <div className="space-y-4">
        
        <div className="px-2 pt-1 flex items-center justify-between">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Navigation Modules
          </h3>
          {onCloseMobileMenu && (
            <button
              onClick={onCloseMobileMenu}
              className="md:hidden p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="space-y-1">
          {visibleItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/30 font-extrabold scale-[1.01]'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3 truncate">
                  <div className={`p-1.5 rounded-lg ${isActive ? 'bg-white/20 text-white' : 'bg-slate-800/80 ' + (item.accentColor || 'text-indigo-400')}`}>
                    <Icon className="w-4 h-4 shrink-0" />
                  </div>
                  <span className="truncate text-xs font-semibold">{item.label}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 ? (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-bold ${
                    isActive ? 'bg-white text-indigo-900 border-white' : item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}>
                    {item.badge}
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-4 h-4 text-white/80" />
                ) : null}
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Status Widget */}
      <div className="pt-4 border-t border-slate-800/80 mt-6">
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 p-3.5 rounded-2xl border border-slate-700/60 shadow-inner text-xs space-y-1.5">
          <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider">
            <span className="text-slate-400">System Status:</span>
            <span className="flex items-center text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5"></span>
              ACTIVE
            </span>
          </div>
          <p className="text-xs font-bold text-white tracking-tight">80mm POS Thermal Engine</p>
          <p className="text-[10px] text-indigo-300 font-medium">Multi-copy & Dynamic Settings</p>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible md+) */}
      <aside className="hidden md:flex min-h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] overflow-y-auto overscroll-contain scroll-smooth print:hidden">
        {sidebarContent}
      </aside>

      {/* Mobile Slide-Over Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden print:hidden">
          {/* Backdrop Blur */}
          <div 
            onClick={onCloseMobileMenu}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Content */}
          <div className="relative z-10 flex-1 max-w-xs w-full max-h-screen h-full overflow-y-auto overscroll-contain scroll-smooth touch-pan-y [webkit-overflow-scrolling:touch]">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

