import React from 'react';
import { PublicEvent } from '../../types';
import { Calendar, MapPin, Image as ImageIcon } from 'lucide-react';

interface PublicEventsPageProps {
  events: PublicEvent[];
}

export const PublicEventsPage: React.FC<PublicEventsPageProps> = ({ events }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider">
          Campus Gallery & News
        </span>
        <h1 className="font-serif italic text-3xl sm:text-4xl font-extrabold text-slate-900">
          Events & Photo Highlights
        </h1>
        <p className="text-slate-600 text-sm">
          Seminars, annual ceremonies, diploma distribution functions, and lab activities at Taleem Institute.
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">No events posted yet</h3>
          <p className="text-xs text-slate-500 mt-1">Check back soon for news and photos of campus events!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((ev) => (
            <div
              key={ev.id}
              className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="h-52 overflow-hidden bg-slate-100 relative">
                  <img
                    src={ev.imageUrl || 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=600'}
                    alt={ev.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-xs text-emerald-300 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{ev.date}</span>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="font-serif italic text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {ev.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {ev.description}
                  </p>
                </div>
              </div>

              {ev.location && (
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{ev.location}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
