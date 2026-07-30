import React, { useState } from 'react';
import { 
  InstituteSettings, 
  PublicStaffMember, 
  PublicEvent, 
  OnlineApplication, 
  Course, 
  Student 
} from '../types';
import { 
  Globe, 
  Megaphone, 
  Users, 
  Calendar, 
  Inbox, 
  Save, 
  Plus, 
  Trash2, 
  CheckCircle, 
  UserPlus, 
  Image as ImageIcon,
  MessageCircle,
  Sparkles,
  Award,
  Link as LinkIcon,
  Phone,
  Mail,
  MapPin,
  Upload,
  Camera
} from 'lucide-react';

interface WebsiteCMSManagerProps {
  settings: InstituteSettings;
  staff: PublicStaffMember[];
  events: PublicEvent[];
  applications: OnlineApplication[];
  courses: Course[];
  onSaveSettings: (s: InstituteSettings) => void;
  onSaveStaff: (member: PublicStaffMember) => void;
  onDeleteStaff: (id: string) => void;
  onSaveEvent: (ev: PublicEvent) => void;
  onDeleteEvent: (id: string) => void;
  onUpdateAppStatus: (appId: string, status: 'pending' | 'accepted' | 'rejected') => void;
  onDeleteApp?: (appId: string) => void;
  onConvertAppToStudent: (app: OnlineApplication) => void;
  showToast: (msg: string) => void;
}

export const WebsiteCMSManager: React.FC<WebsiteCMSManagerProps> = ({
  settings,
  staff,
  events,
  applications,
  courses,
  onSaveSettings,
  onSaveStaff,
  onDeleteStaff,
  onSaveEvent,
  onDeleteEvent,
  onUpdateAppStatus,
  onDeleteApp,
  onConvertAppToStudent,
  showToast,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'general' | 'director' | 'staff' | 'events' | 'inbox'>('general');

  // General Settings Local State
  const [generalForm, setGeneralForm] = useState<InstituteSettings>({ ...settings });

  // Staff Modal / Form
  const [editingStaff, setEditingStaff] = useState<PublicStaffMember | null>(null);
  const [staffName, setStaffName] = useState('');
  const [staffDesignation, setStaffDesignation] = useState('');
  const [staffPhotoUrl, setStaffPhotoUrl] = useState('');
  const [staffDescription, setStaffDescription] = useState('');

  // Event Modal / Form
  const [editingEvent, setEditingEvent] = useState<PublicEvent | null>(null);
  const [eventTitle, setEventTitle] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventImageUrl, setEventImageUrl] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventDescription, setEventDescription] = useState('');

  // Save General Settings
  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(generalForm);
    showToast('Website content & settings updated successfully!');
  };

  // Staff Save
  const handleSaveStaffMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffDesignation.trim()) {
      showToast('Name and Designation are required.');
      return;
    }

    const member: PublicStaffMember = {
      id: editingStaff ? editingStaff.id : `staff-${Date.now()}`,
      name: staffName.trim(),
      designation: staffDesignation.trim(),
      photoUrl: staffPhotoUrl.trim() || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      description: staffDescription.trim() || 'Faculty member at Taleem Institute.',
    };

    onSaveStaff(member);
    setEditingStaff(null);
    setStaffName('');
    setStaffDesignation('');
    setStaffPhotoUrl('');
    setStaffDescription('');
    showToast('Staff member saved successfully!');
  };

  // Event Save
  const handleSaveEventItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate.trim()) {
      showToast('Title and Date are required.');
      return;
    }

    const ev: PublicEvent = {
      id: editingEvent ? editingEvent.id : `ev-${Date.now()}`,
      title: eventTitle.trim(),
      date: eventDate.trim(),
      imageUrl: eventImageUrl.trim() || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600',
      description: eventDescription.trim(),
      location: eventLocation.trim() || undefined,
    };

    onSaveEvent(ev);
    setEditingEvent(null);
    setEventTitle('');
    setEventDate('');
    setEventImageUrl('');
    setEventLocation('');
    setEventDescription('');
    showToast('Event item saved successfully!');
  };

  return (
    <div className="space-y-8 p-4 sm:p-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Super Admin Controls</span>
          <h2 className="font-serif italic text-2xl font-bold text-slate-900 mt-0.5">Website CMS & Front-End Manager</h2>
          <p className="text-xs text-slate-500 mt-1">Control front-end marquee notices, director message, staff gallery, events, and online admission inbox.</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full">
            Online Applications: {applications.filter(a => a.status === 'pending').length} New
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('general')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'general' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>General & Marquee</span>
        </button>

        <button
          onClick={() => setActiveSubTab('director')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'director' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Director Message & Mission</span>
        </button>

        <button
          onClick={() => setActiveSubTab('staff')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'staff' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Staff Gallery ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('events')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'events' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Events & Photos ({events.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('inbox')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeSubTab === 'inbox' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Inbox className="w-4 h-4" />
          <span>Online Applications Inbox ({applications.length})</span>
        </button>
      </div>

      {/* SUB-TAB 1: GENERAL & MARQUEE */}
      {activeSubTab === 'general' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-serif italic text-xl font-bold text-slate-900 border-b pb-3">Marquee Notice & Branding Settings</h3>

          {/* Marquee Text */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-2">
            <label className="block text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Megaphone className="w-4 h-4 text-amber-700" />
              <span>Marquee Announcement Banner Text</span>
            </label>
            <input
              type="text"
              value={generalForm.marqueeText || ''}
              onChange={(e) => setGeneralForm({ ...generalForm, marqueeText: e.target.value })}
              placeholder="e.g. 🎉 Admissions Open for DIT & CIT Batch 2026! Contact WhatsApp 0348-1064487 for details."
              className="w-full px-3.5 py-2.5 rounded-xl border border-amber-300 bg-white text-sm text-slate-900 font-medium"
            />
          </div>

          {/* Hero Banner */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Front-End Hero Headline Title</label>
              <input
                type="text"
                value={generalForm.heroTitle || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, heroTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Front-End Hero Subtitle</label>
              <input
                type="text"
                value={generalForm.heroSubtitle || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, heroSubtitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Helpline</label>
              <input
                type="text"
                value={generalForm.phone}
                onChange={(e) => setGeneralForm({ ...generalForm, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">WhatsApp Direct Phone Number</label>
              <input
                type="text"
                value={generalForm.whatsappPhone || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, whatsappPhone: e.target.value })}
                placeholder="923481064487"
                className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold text-emerald-700"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Default WhatsApp Chat Message</label>
              <input
                type="text"
                value={generalForm.whatsappDefaultMessage || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, whatsappDefaultMessage: e.target.value })}
                placeholder="Hello Taleem Institute! I would like to inquire about course admissions..."
                className="w-full px-3.5 py-2 rounded-xl border text-sm text-slate-800"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                value={generalForm.email}
                onChange={(e) => setGeneralForm({ ...generalForm, email: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Campus Address</label>
            <input
              type="text"
              value={generalForm.address}
              onChange={(e) => setGeneralForm({ ...generalForm, address: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            />
          </div>

          {/* Social Links */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Facebook URL</label>
              <input
                type="url"
                value={generalForm.socialFacebook || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, socialFacebook: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">TikTok URL</label>
              <input
                type="url"
                value={generalForm.socialTiktok || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, socialTiktok: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Instagram URL</label>
              <input
                type="url"
                value={generalForm.socialInstagram || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, socialInstagram: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">YouTube URL</label>
              <input
                type="url"
                value={generalForm.socialYoutube || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, socialYoutube: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Website Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 2: DIRECTOR MESSAGE & MISSION */}
      {activeSubTab === 'director' && (
        <form onSubmit={handleSaveGeneral} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <h3 className="font-serif italic text-xl font-bold text-slate-900 border-b pb-3">Managing Director & Core Statements</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Director Name</label>
              <input
                type="text"
                value={generalForm.directorName || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, directorName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Director Title</label>
              <input
                type="text"
                value={generalForm.directorTitle || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, directorTitle: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Director Photo (Upload from PC / Device)</label>
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                <img
                  src={generalForm.directorPicUrl || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=400'}
                  alt="Director Preview"
                  className="w-24 h-24 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                />
                <div className="flex-1 space-y-2 w-full">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs">
                      <Upload className="w-3.5 h-3.5 text-white" />
                      <span>Choose File from PC</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (uploadEv) => {
                              const res = uploadEv.target?.result as string;
                              if (res) setGeneralForm({ ...generalForm, directorPicUrl: res });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <p className="text-[10px] text-slate-500">Live preview above. Select image from your laptop or PC storage.</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Director's Message to Students</label>
            <textarea
              rows={4}
              value={generalForm.directorMessage || ''}
              onChange={(e) => setGeneralForm({ ...generalForm, directorMessage: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl border text-sm"
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Mission Statement</label>
              <textarea
                rows={3}
                value={generalForm.missionStatement || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, missionStatement: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              ></textarea>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Vision Statement</label>
              <textarea
                rows={3}
                value={generalForm.visionStatement || ''}
                onChange={(e) => setGeneralForm({ ...generalForm, visionStatement: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border text-sm"
              ></textarea>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Director & Mission Info</span>
            </button>
          </div>
        </form>
      )}

      {/* SUB-TAB 3: STAFF GALLERY */}
      {activeSubTab === 'staff' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-slate-900">Faculty & Staff Gallery</h3>
              <p className="text-xs text-slate-500">Manage team members displayed on the About Us page.</p>
            </div>
            <button
              onClick={() => {
                setEditingStaff(null);
                setStaffName('');
                setStaffDesignation('');
                setStaffPhotoUrl('');
                setStaffDescription('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Staff Member</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveStaffMember} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-800">{editingStaff ? 'Edit Staff Member' : 'Add New Staff Member'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="e.g. Engr. Ali Raza"
                  className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Designation *</label>
                <input
                  type="text"
                  required
                  value={staffDesignation}
                  onChange={(e) => setStaffDesignation(e.target.value)}
                  placeholder="e.g. Senior IT Lecturer"
                  className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image (Upload from PC / Device)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEv) => {
                            const res = uploadEv.target?.result as string;
                            if (res) setStaffPhotoUrl(res);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Short Description / Qualification</label>
              <input
                type="text"
                value={staffDescription}
                onChange={(e) => setStaffDescription(e.target.value)}
                placeholder="e.g. MS in Computer Science, 8+ years teaching experience."
                className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {editingStaff ? 'Update Member' : 'Add to Staff Gallery'}
            </button>
          </form>

          {/* List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {staff.map((m) => (
              <div key={m.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover border" />
                  <div>
                    <strong className="text-slate-900 text-sm block">{m.name}</strong>
                    <span className="text-xs text-emerald-700 font-medium">{m.designation}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingStaff(m);
                      setStaffName(m.name);
                      setStaffDesignation(m.designation);
                      setStaffPhotoUrl(m.photoUrl);
                      setStaffDescription(m.description);
                    }}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteStaff(m.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: EVENTS GALLERY */}
      {activeSubTab === 'events' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-slate-900">Events & Photo Gallery</h3>
              <p className="text-xs text-slate-500">Post campus news, annual ceremonies, and lab highlights.</p>
            </div>
            <button
              onClick={() => {
                setEditingEvent(null);
                setEventTitle('');
                setEventDate('');
                setEventImageUrl('');
                setEventLocation('');
                setEventDescription('');
              }}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Event Item</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveEventItem} className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-4">
            <h4 className="font-bold text-sm text-slate-800">{editingEvent ? 'Edit Event' : 'Add New Event'}</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Event Title *</label>
                <input
                  type="text"
                  required
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="e.g. Annual Diploma Distribution Ceremony 2026"
                  className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Date *</label>
                <input
                  type="text"
                  required
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  placeholder="e.g. Oct 15, 2026"
                  className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Photo Image (Upload from PC / Device)</label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <label className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-xs">
                    <Upload className="w-3.5 h-3.5 text-white" />
                    <span>Choose File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (uploadEv) => {
                            const res = uploadEv.target?.result as string;
                            if (res) setEventImageUrl(res);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Location (Optional)</label>
                <input
                  type="text"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  placeholder="e.g. Main Auditorium"
                  className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Event description..."
                className="w-full px-3.5 py-2 rounded-xl border bg-white text-sm"
              ></textarea>
            </div>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              {editingEvent ? 'Update Event' : 'Publish Event Item'}
            </button>
          </form>

          {/* List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.map((ev) => (
              <div key={ev.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex gap-4">
                <img src={ev.imageUrl} alt={ev.title} className="w-24 h-24 rounded-xl object-cover border" />
                <div className="flex-1 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase">{ev.date}</span>
                  <h4 className="font-bold text-slate-900 text-sm">{ev.title}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                  <div className="pt-2 flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">📍 {ev.location || 'Campus'}</span>
                    <button
                      onClick={() => onDeleteEvent(ev.id)}
                      className="text-rose-600 text-xs font-semibold hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 5: ONLINE APPLICATIONS INBOX */}
      {activeSubTab === 'inbox' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div>
              <h3 className="font-serif italic text-xl font-bold text-slate-900">Online Admission Applications</h3>
              <p className="text-xs text-slate-500">Student applications submitted online through the website form. Enrolling or rejecting clears the item from inbox history & updates top notification badges.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                Pending: {applications.filter(a => a.status === 'pending').length}
              </span>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                Total Inbox: {applications.length}
              </span>
            </div>
          </div>

          {applications.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">No online admission applications submitted yet. All inboxes are clear!</div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="p-5 rounded-2xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-slate-300 transition"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <strong className="text-slate-900 text-base font-bold">{app.applicantName}</strong>
                      <span className="text-xs text-slate-500">S/O {app.fatherName}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === 'accepted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-xs text-slate-600 pt-1">
                      <span>Course: <strong className="text-emerald-700">{app.courseName}</strong></span>
                      <span>Phone / WA: <strong className="text-slate-900">{app.mobileNo}</strong></span>
                      <span>Gender: <strong>{app.gender}</strong></span>
                      <span>Date: <span className="font-mono">{new Date(app.submittedAt).toLocaleDateString()}</span></span>
                    </div>

                    <p className="text-xs text-slate-500">Address: {app.address}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <a
                      href={`https://wa.me/${app.mobileNo.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(app.applicantName)},%20this%20is%20Taleem%20Institute%20admissions%20office.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => onConvertAppToStudent(app)}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transform hover:-translate-y-0.5 transition-all cursor-pointer"
                      title="Enroll student and clear from online application inbox history"
                    >
                      <UserPlus className="w-4 h-4 text-white" />
                      <span>Enroll Now →</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Are you sure you want to reject and clear the application for ${app.applicantName}?`)) {
                          onUpdateAppStatus(app.id, 'rejected');
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer border border-rose-200"
                      title="Reject application and clear from inbox history"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-700" />
                      <span>Reject & Clear</span>
                    </button>

                    {onDeleteApp && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Remove application for ${app.applicantName} from inbox history?`)) {
                            onDeleteApp(app.id);
                          }
                        }}
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                        title="Delete application from inbox history"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
