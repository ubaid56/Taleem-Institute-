import React, { useState } from 'react';
import { InstituteSettings } from '../../types';
import { MapPin, Phone, Mail, MessageCircle, Send, Clock, Building2, CheckCircle2 } from 'lucide-react';

interface PublicContactPageProps {
  settings: InstituteSettings;
  showToast: (msg: string) => void;
}

export const PublicContactPage: React.FC<PublicContactPageProps> = ({ settings, showToast }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const formattedWhatsapp = settings.whatsappPhone 
    ? settings.whatsappPhone.replace(/[^0-9]/g, '') 
    : '923481064487';

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Please fill in your name, phone, and message.');
      return;
    }
    setSubmitted(true);
    showToast('Your message has been sent. Our team will contact you shortly!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Get in Touch
        </span>
        <h1 className="font-serif italic text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact Us & Visit Our Campus
        </h1>
        <p className="text-slate-600 text-sm">
          Have questions about admission fees, course schedules, or diploma validity? Contact our admissions office.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Info Cards */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Contact Card */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
            <h3 className="font-serif italic text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
              Institute Contact Information
            </h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-slate-800 text-sm font-semibold">Campus Address</strong>
                  <p className="text-slate-600 mt-0.5 leading-relaxed">{settings.address}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-slate-800 text-sm font-semibold">Phone Helpline</strong>
                  <p className="text-slate-600 mt-0.5">{settings.phone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-slate-800 text-sm font-semibold">Email Address</strong>
                  <p className="text-slate-600 mt-0.5">{settings.email}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <strong className="block text-slate-800 text-sm font-semibold">Office & Lab Hours</strong>
                  <p className="text-slate-600 mt-0.5">Monday – Saturday: 08:00 AM – 06:00 PM</p>
                </div>
              </div>
            </div>

            {/* DIRECT WHATSAPP BUTTON (EXPLICITLY REQUESTED) */}
            <div className="pt-4 border-t border-slate-100">
              <a
                href={`https://wa.me/${formattedWhatsapp}?text=Hello%20Taleem%20Institute!%20I%20have%20a%20question.`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Chat Directly on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Registration Info Card */}
          <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 shadow-md space-y-2 border border-slate-800">
            <span className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">Government Registration</span>
            <h4 className="font-serif italic text-lg font-bold text-white">{settings.instituteName}</h4>
            <p className="text-xs text-slate-400">Official Registration No: <strong className="text-white font-mono">{settings.registrationNo}</strong></p>
            <p className="text-xs text-slate-400">Managing Director: <strong className="text-white">{settings.ownerName}</strong></p>
          </div>
        </div>

        {/* Right Inquiry Form */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md">
            <h3 className="font-serif italic text-2xl font-bold text-slate-900 mb-2">Send an Instant Inquiry</h3>
            <p className="text-xs text-slate-500 mb-6">Fill out the form below to receive detailed course prospectuses and fee structure info.</p>

            {submitted ? (
              <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h4 className="text-lg font-bold text-slate-900">Inquiry Received!</h4>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Thank you <strong>{name}</strong>. Our admissions officer will contact you on <strong>{phone}</strong> via phone call or WhatsApp.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold mt-2"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Usman Khan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Phone / WhatsApp No *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 03481064487"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Your Question / Inquiry *</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Ask about course fee, class timings, diploma verification..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 text-sm text-slate-800"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Message</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
