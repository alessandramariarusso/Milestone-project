import * as XLSX from 'xlsx';
import { Milestone, TimelineSettings } from '../types';

export const exportToExcel = (milestones: Milestone[], settings: TimelineSettings) => {
  const wb = XLSX.utils.book_new();
  const wsData: (string | number)[][] = [];

  // Title Row
  wsData.push(["Timeline Planner Export"]);
  wsData.push([]);

  // Header Rows (Year / Month)
  const yearsRow: (string | number)[] = ["Anno"];
  const monthsRow: string[] = ["Mese"];

  const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

  for (let i = 0; i < settings.yearsToShow; i++) {
    const year = settings.startYear + i;
    yearsRow.push(year);
    // Fill empty cells for the rest of the year (11 cells)
    for (let m = 0; m < 11; m++) yearsRow.push("");
    
    // Add months
    months.forEach(m => monthsRow.push(m));
  }

  wsData.push(yearsRow);
  wsData.push(monthsRow);

  // Data Rows
  // We will list events simply for now, as positioning visually in Excel cells is complex
  // without creating a massive sparse matrix. 
  // However, to satisfy "suddiviso come il calendario", let's try a visual approach.
  
  wsData.push([]); // Spacer

  // Sort milestones by date
  const sortedMilestones = [...milestones].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Create a list view below the visual header
  wsData.push(["Data", "Nome", "Delta", "Tipo Segnalino"]);
  
  sortedMilestones.forEach(m => {
    wsData.push([
      m.date,
      m.name,
      m.weeksDelta,
      m.marker.label
    ]);
  });

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge cells for years
  const merges = [];
  // Title merge
  merges.push({ s: { r: 0, c: 0 }, e: { r: 0, c: 12 } });

  // Year merges
  let colIndex = 1;
  for (let i = 0; i < settings.yearsToShow; i++) {
    merges.push({ s: { r: 2, c: colIndex }, e: { r: 2, c: colIndex + 11 } });
    colIndex += 12;
  }
  ws['!merges'] = merges;

  // Column widths
  const wscols = [{ wch: 15 }]; // First col width
  for(let i=0; i < settings.yearsToShow * 12; i++) {
      wscols.push({ wch: 3 }); // Narrow columns for months
  }
  ws['!cols'] = wscols;

  XLSX.utils.book_append_sheet(wb, ws, "Timeline");
  XLSX.writeFile(wb, "Timeline_Export.xlsx");
};
