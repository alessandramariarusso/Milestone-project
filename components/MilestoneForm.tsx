import React, { useState, useEffect } from 'react';
import { Milestone, MarkerDef } from '../types';
import { MarkerIcon, PRESET_MARKERS } from './Icons';
import { X, Calendar, Check, Hash } from 'lucide-react';

interface MilestoneFormProps {
  initialData?: Milestone | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (milestone: Milestone) => void;
}

const MilestoneForm: React.FC<MilestoneFormProps> = ({ initialData, isOpen, onClose, onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [weeksDelta, setWeeksDelta] = useState('');
  const [selectedMarker, setSelectedMarker] = useState<MarkerDef>(PRESET_MARKERS[0]);
  const [isMarkerModalOpen, setIsMarkerModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name);
        // Ensure date is in YYYY-MM format for the input
        const formattedDate = initialData.date.substring(0, 7); 
        setDate(formattedDate);
        setWeeksDelta(initialData.weeksDelta);
        setSelectedMarker(initialData.marker);
      } else {
        // Reset for new entry - Default to current month YYYY-MM
        setName('');
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        setDate(`${year}-${month}`);
        setWeeksDelta('');
        setSelectedMarker(PRESET_MARKERS[0]);
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialData ? initialData.id : crypto.randomUUID(),
      name,
      date, // This will be YYYY-MM
      weeksDelta,
      marker: selectedMarker
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-slate-800 text-white p-4 flex justify-between items-center">
          <h2 className="text-xl font-bold">{initialData ? 'Modifica Milestone' : 'Nuova Milestone'}</h2>
          <button onClick={onClose} className="hover:bg-slate-700 p-1 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600 block">Nome Milestone</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              placeholder="Es. Final Design Release"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date Field - CHANGED TO MONTH ONLY */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 block flex items-center gap-2">
                <Calendar size={16} /> Data (Mese/Anno)
              </label>
              <input
                type="month"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            {/* Weeks Delta Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-600 block flex items-center gap-2">
                <Hash size={16} /> Delta Settimane
              </label>
              <input
                type="text"
                value={weeksDelta}
                onChange={(e) => setWeeksDelta(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                placeholder="Es. -12w"
              />
            </div>
          </div>

          {/* Marker Selector Trigger */}
          <div className="space-y-2 relative">
            <label className="text-sm font-semibold text-slate-600 block">Segnalino</label>
            <button
              type="button"
              onClick={() => setIsMarkerModalOpen(true)}
              className="w-full flex items-center justify-between px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <MarkerIcon marker={selectedMarker} size={28} />
                <span className="text-slate-700">{selectedMarker.label}</span>
              </div>
              <span className="text-blue-600 text-sm font-medium">Cambia</span>
            </button>

            {/* Marker Selection Modal */}
            {isMarkerModalOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-200 shadow-xl rounded-lg p-3 z-10 grid grid-cols-5 gap-2">
                {PRESET_MARKERS.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedMarker(m);
                      setIsMarkerModalOpen(false);
                    }}
                    className={`p-2 flex flex-col items-center gap-1 rounded hover:bg-slate-100 transition-colors ${
                      selectedMarker.label === m.label ? 'bg-blue-50 border border-blue-200' : ''
                    }`}
                    title={m.label}
                  >
                    <MarkerIcon marker={m} size={24} />
                  </button>
                ))}
              </div>
            )}
            {isMarkerModalOpen && (
              <div className="fixed inset-0 z-0" onClick={() => setIsMarkerModalOpen(false)} />
            )}
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 px-6 rounded-lg shadow-lg transform hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              <Check size={20} />
              Conferma e Salva
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MilestoneForm;