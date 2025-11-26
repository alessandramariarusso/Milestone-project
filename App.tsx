import React, { useState, useEffect } from 'react';
import { Milestone, TimelineSettings } from './types';
import MilestoneForm from './components/MilestoneForm';
import TimelineView from './components/TimelineView';
import { Plus, Calendar as CalendarIcon, Layout } from 'lucide-react';

const App: React.FC = () => {
  // State initialized from LocalStorage
  const [view, setView] = useState<'form' | 'timeline'>('form');
  
  const [milestones, setMilestones] = useState<Milestone[]>(() => {
    try {
      const saved = localStorage.getItem('timeline_milestones');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Failed to load milestones from storage", e);
      return [];
    }
  });
  
  const [settings, setSettings] = useState<TimelineSettings>(() => {
    try {
      const saved = localStorage.getItem('timeline_settings');
      return saved ? JSON.parse(saved) : { startYear: 2025, yearsToShow: 6 };
    } catch (e) {
      console.error("Failed to load settings from storage", e);
      return { startYear: 2025, yearsToShow: 6 };
    }
  });

  // Persist Data Effects
  useEffect(() => {
    localStorage.setItem('timeline_milestones', JSON.stringify(milestones));
  }, [milestones]);

  useEffect(() => {
    localStorage.setItem('timeline_settings', JSON.stringify(settings));
  }, [settings]);

  // Modal State for Edit/Add
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  
  // Delete Confirmation
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  // Logic to auto-expand timeline if event is out of bounds
  const checkAndAdjustRange = (dateStr: string) => {
    const year = parseInt(dateStr.split('-')[0]);
    if (isNaN(year)) return;

    setSettings(prev => {
      const { startYear, yearsToShow } = prev;
      const endYear = startYear + yearsToShow - 1;
      
      let newStart = startYear;
      let newToShow = yearsToShow;

      // Expand backwards
      if (year < startYear) {
        const diff = startYear - year;
        newStart = year;
        newToShow = yearsToShow + diff;
      } 
      // Expand forwards
      else if (year > endYear) {
        const diff = year - endYear;
        newToShow = yearsToShow + diff;
      }

      if (newStart !== startYear || newToShow !== yearsToShow) {
        return { startYear: newStart, yearsToShow: newToShow };
      }
      return prev;
    });
  };

  // Handlers
  const handleSaveMilestone = (newMilestone: Milestone) => {
    // Check if we need to expand the view
    checkAndAdjustRange(newMilestone.date);

    setMilestones(prev => {
      const exists = prev.find(m => m.id === newMilestone.id);
      if (exists) {
        return prev.map(m => m.id === newMilestone.id ? newMilestone : m);
      }
      return [...prev, newMilestone];
    });
    setEditingMilestone(null);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setMilestones(prev => prev.filter(m => m.id !== itemToDelete));
      setItemToDelete(null);
    }
  };

  const handleDateChange = (id: string, newDate: string) => {
    // Check if drag resulted in a date outside current view
    checkAndAdjustRange(newDate);
    
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, date: newDate } : m));
  };

  // Views
  const renderMainScreen = () => (
    <div className="flex flex-col items-center justify-center min-h-full p-8 bg-slate-50">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
        
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Project Timeline</h1>
          <p className="text-slate-500 text-lg">Organizza e visualizza le tue milestone di progetto.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {/* Card Add */}
          <button 
            onClick={() => {
              setEditingMilestone(null);
              setIsModalOpen(true);
            }}
            className="group relative bg-white border border-slate-200 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left flex flex-col justify-between h-48 overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Plus size={80} />
            </div>
            <div>
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                <Plus size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Aggiungi Evento</h3>
              <p className="text-slate-500 text-sm mt-2">Crea una nuova milestone con data e segnalino.</p>
            </div>
            <div className="flex items-center text-blue-600 font-semibold text-sm mt-4">
               Inizia ora &rarr;
            </div>
          </button>

          {/* Card View */}
          <button 
            onClick={() => setView('timeline')}
            className="group relative bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all text-left flex flex-col justify-between h-48 overflow-hidden text-white"
          >
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity text-white">
               <Layout size={80} />
            </div>
            <div>
              <div className="w-12 h-12 bg-slate-700 text-green-400 rounded-full flex items-center justify-center mb-4">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-xl font-bold">Visualizza Timeline</h3>
              <p className="text-slate-400 text-sm mt-2">Accedi alla tabella interattiva degli eventi ({milestones.length} attivi).</p>
            </div>
             <div className="flex items-center text-green-400 font-semibold text-sm mt-4">
               Apri Calendario &rarr;
            </div>
          </button>
        </div>
      </div>

      <MilestoneForm 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMilestone}
        initialData={null}
      />
    </div>
  );

  return (
    <>
      {view === 'form' ? renderMainScreen() : (
        <TimelineView 
          milestones={milestones}
          onEdit={(m) => {
            setEditingMilestone(m);
            setIsModalOpen(true);
          }}
          onDelete={(id) => setItemToDelete(id)}
          onDateChange={handleDateChange}
          settings={settings}
          onSettingsChange={setSettings}
          onBack={() => setView('form')}
        />
      )}

      {/* Edit Modal (Available globally for call from Timeline) */}
      <MilestoneForm 
        isOpen={isModalOpen && view === 'timeline'}
        onClose={() => {
            setIsModalOpen(false);
            setEditingMilestone(null);
        }}
        onSave={handleSaveMilestone}
        initialData={editingMilestone}
      />

      {/* Delete Confirmation Dialog */}
      {itemToDelete && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-2xl animate-in zoom-in duration-200">
              <h3 className="text-lg font-bold text-slate-900 mb-2">Conferma Eliminazione</h3>
              <p className="text-slate-600 mb-6">Sei sicuro di voler eliminare questo evento? L'azione non è reversibile.</p>
              <div className="flex justify-end gap-3">
                 <button 
                    onClick={() => setItemToDelete(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                 >
                    Annulla
                 </button>
                 <button 
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-bold"
                 >
                    Elimina
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default App;