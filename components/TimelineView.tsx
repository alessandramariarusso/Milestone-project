import React, { useRef, useState, useMemo } from 'react';
import { Milestone, TimelineSettings } from '../types';
import { MarkerIcon } from './Icons';
import { Edit2, Trash2, Download, ChevronLeft } from 'lucide-react';
import { exportToExcel } from '../services/excelService';

interface TimelineViewProps {
  milestones: Milestone[];
  onEdit: (m: Milestone) => void;
  onDelete: (id: string) => void;
  onDateChange: (id: string, newDate: string) => void;
  settings: TimelineSettings;
  onSettingsChange: (s: TimelineSettings) => void;
  onBack: () => void;
}

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const MONTH_WIDTH = 30; // px
const YEAR_WIDTH = MONTH_WIDTH * 12;

const TimelineView: React.FC<TimelineViewProps> = ({
  milestones,
  onEdit,
  onDelete,
  onDateChange,
  settings,
  onSettingsChange,
  onBack
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Dragging state
  const [draggedItem, setDraggedItem] = useState<Milestone | null>(null);

  // Calculate total width
  const totalWidth = settings.yearsToShow * YEAR_WIDTH;

  // New Position Logic: Based on Month Index
  const getXPosition = (dateStr: string) => {
    // format YYYY-MM or YYYY-MM-DD
    const parts = dateStr.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]); // 1-12

    if (isNaN(year) || isNaN(month)) return -100;

    const diffYears = year - settings.startYear;
    const totalMonths = (diffYears * 12) + (month - 1);
    
    // Center in the month column
    return (totalMonths * MONTH_WIDTH) + (MONTH_WIDTH / 2);
  };

  const getDateFromPosition = (x: number) => {
    // Adjust x to be relative to the actual grid start
    // We assume x is relative to the start of the year 0
    const monthIndex = Math.floor(x / MONTH_WIDTH);
    
    const yearsToAdd = Math.floor(monthIndex / 12);
    const monthsToAdd = monthIndex % 12;

    const finalYear = settings.startYear + yearsToAdd;
    const finalMonth = monthsToAdd + 1; // 1-12

    const mStr = String(finalMonth).padStart(2, '0');
    return `${finalYear}-${mStr}`;
  };

  // Group milestones by Month Key "YYYY-MM" to determine vertical stacking order
  const positionedMilestones = useMemo(() => {
    // Sort by date first to keep stacking consistent
    const sorted = [...milestones].sort((a, b) => a.date.localeCompare(b.date));
    
    const occupancy: Record<string, number> = {};

    return sorted.map(m => {
      // Get key YYYY-MM
      const key = m.date.substring(0, 7);
      
      const stackIndex = occupancy[key] || 0;
      occupancy[key] = stackIndex + 1;

      return {
        ...m,
        stackIndex
      };
    });
  }, [milestones]);


  const handleDragStart = (e: React.DragEvent, m: Milestone) => {
    setDraggedItem(m);
    e.dataTransfer.effectAllowed = "move";
    if (activeMenuId) setActiveMenuId(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItem || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const scrollLeft = containerRef.current.scrollLeft;
    // 20px padding left
    const x = e.clientX - rect.left + scrollLeft - 20; 

    if (x < 0) return;

    const newDate = getDateFromPosition(x);
    onDateChange(draggedItem.id, newDate);
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b bg-slate-50 shadow-sm z-20">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-600">
            <ChevronLeft />
          </button>
          <h2 className="text-xl font-bold text-slate-800">Timeline Master Plan</h2>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => exportToExcel(milestones, settings)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow transition-all"
          >
            <Download size={16} /> Esporta Excel
          </button>
        </div>
      </div>

      {/* Timeline Container */}
      <div 
        className="flex-1 overflow-x-auto overflow-y-auto timeline-scroll relative bg-slate-50"
        ref={containerRef}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <div 
          className="relative min-h-[800px] p-5"
          style={{ width: `${totalWidth + 100}px` }} 
        >
          {/* Header Structure */}
          <div className="sticky top-0 z-10 bg-slate-50 pb-4 shadow-sm">
             {/* Years Row */}
            <div className="flex h-10">
              {Array.from({ length: settings.yearsToShow }).map((_, idx) => {
                const year = settings.startYear + idx;
                return (
                  <div 
                    key={year} 
                    className="flex-shrink-0 border border-slate-400 bg-slate-800 text-white font-bold flex items-center justify-center relative group"
                    style={{ width: `${YEAR_WIDTH}px` }}
                  >
                     {/* Year Input for customization */}
                     {idx === 0 ? (
                        <div className="flex items-center gap-1">
                            <input 
                                type="number" 
                                value={settings.startYear}
                                onChange={(e) => onSettingsChange({...settings, startYear: parseInt(e.target.value) || 2025})}
                                className="bg-transparent text-center w-20 outline-none border-b border-transparent hover:border-white focus:border-white transition-all"
                            />
                        </div>
                     ) : (
                        <span>{year}</span>
                     )}
                  </div>
                );
              })}
            </div>
            {/* Months Row */}
            <div className="flex h-6">
               {Array.from({ length: settings.yearsToShow }).map((_, yearIdx) => (
                  <div key={yearIdx} className="flex" style={{ width: `${YEAR_WIDTH}px` }}>
                     {MONTHS.map((m, mIdx) => (
                       <div 
                        key={mIdx} 
                        className="flex-1 border-r border-b border-slate-300 bg-white text-xs text-slate-500 flex items-center justify-center font-medium"
                       >
                         {m}
                       </div>
                     ))}
                  </div>
               ))}
            </div>
          </div>

          {/* Grid Lines (Background) */}
          <div className="absolute top-[80px] bottom-0 left-5 pointer-events-none flex">
             {Array.from({ length: settings.yearsToShow * 12 }).map((_, i) => (
                <div 
                  key={i} 
                  className="border-r border-dashed border-slate-200 h-full"
                  style={{ width: `${MONTH_WIDTH}px` }}
                />
             ))}
          </div>

          {/* Milestones Area */}
          <div className="relative mt-8 h-full">
            {/* Visual Header Strip Background */}
            <div className="absolute top-0 left-0 w-full h-8 bg-slate-200/50 pointer-events-none"></div>

            {positionedMilestones.map((m) => {
              const leftPos = getXPosition(m.date);
              
              // STACKING LOGIC: Start from Y=100 (below header) and increment by 120px for each item in the same stack
              // This places them "one under the other"
              const topPos = 40 + (m.stackIndex * 100); 

              // If date is before start year, or way after, hide or show at edge
              if (leftPos < 0) return null;

              return (
                <div
                  key={m.id}
                  className="absolute group flex flex-col items-center cursor-grab active:cursor-grabbing z-20 hover:z-30 transition-all duration-200"
                  style={{ 
                    left: `${leftPos}px`, 
                    top: `${topPos}px`,
                    transform: 'translateX(-50%)' 
                  }}
                  draggable
                  onDragStart={(e) => handleDragStart(e, m)}
                >
                  {/* The Marker */}
                  <div 
                    className="relative cursor-pointer transform hover:scale-110 transition-transform"
                    onClick={(e) => {
                        e.stopPropagation();
                        setActiveMenuId(activeMenuId === m.id ? null : m.id);
                    }}
                  >
                    <MarkerIcon marker={m.marker} size={32} className="drop-shadow-md" />
                    
                    {/* Popover Menu */}
                    {activeMenuId === m.id && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 p-1 flex flex-col min-w-[120px] z-50 animate-in fade-in zoom-in duration-150">
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(m); setActiveMenuId(null); }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 rounded text-sm text-slate-700 w-full text-left"
                        >
                          <Edit2 size={14} /> Modifica
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onDelete(m.id); setActiveMenuId(null); }}
                          className="flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded text-sm text-red-600 w-full text-left"
                        >
                          <Trash2 size={14} /> Elimina
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Info Labels - Visible below marker */}
                  <div className="mt-1 flex flex-col items-center pointer-events-none">
                    <div className="text-[11px] font-bold text-slate-800 bg-white/95 border border-slate-300 px-2 py-0.5 rounded shadow-sm whitespace-nowrap min-w-[60px] max-w-[150px] overflow-hidden text-ellipsis text-center z-10">
                      {m.name}
                    </div>
                    {m.weeksDelta && (
                       <div className="text-[10px] text-slate-500 font-mono mt-0.5 bg-white/60 px-1 rounded">
                         {m.weeksDelta}
                       </div>
                    )}
                  </div>
                  
                  {/* Optional: Small line connecting to the top if needed, but 'one under other' usually implies just floating */}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Overlay to close menu */}
      {activeMenuId && (
        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
      )}
    </div>
  );
};

export default TimelineView;