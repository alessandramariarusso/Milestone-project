export enum MarkerShape {
  TriangleDown = 'TriangleDown',
  TriangleUp = 'TriangleUp',
  Circle = 'Circle',
  Rhombus = 'Rhombus',
  Label = 'Label'
}

export enum MarkerColor {
  Grey = '#9ca3af',
  LightGreen = '#86efac',
  DarkGreen = '#166534',
  LightBlue = '#93c5fd',
  DarkBlue = '#1e40af',
  Yellow = '#facc15',
  Beige = '#e7e5e4',
  Red = '#ef4444',
  Azure = '#0ea5e9', // For Rhombus
  LabelYellow = '#fef08a' // For Label
}

export interface MarkerDef {
  shape: MarkerShape;
  color: MarkerColor;
  label: string; // For UI selection
}

export interface Milestone {
  id: string;
  name: string;
  date: string; // ISO string YYYY-MM-DD
  weeksDelta: string;
  marker: MarkerDef;
}

export interface TimelineSettings {
  startYear: number;
  yearsToShow: number;
}
