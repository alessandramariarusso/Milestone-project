import React from 'react';
import { MarkerColor, MarkerShape, MarkerDef } from '../types';

interface IconProps {
  marker: MarkerDef;
  size?: number;
  className?: string;
}

export const MarkerIcon: React.FC<IconProps> = ({ marker, size = 24, className = '' }) => {
  const { shape, color } = marker;

  const commonProps = {
    width: size,
    height: size,
    fill: color,
    stroke: '#374151', // Dark grey border
    strokeWidth: 1.5,
    className: `transition-transform ${className}`,
    viewBox: "0 0 24 24"
  };

  switch (shape) {
    case MarkerShape.TriangleDown:
      return (
        <svg {...commonProps}>
          <path d="M4 6h16l-8 14L4 6z" />
        </svg>
      );
    case MarkerShape.TriangleUp:
      return (
        <svg {...commonProps}>
          <path d="M12 4l8 16H4l8-16z" />
        </svg>
      );
    case MarkerShape.Circle:
      return (
        <svg {...commonProps}>
          <circle cx="12" cy="12" r="9" />
        </svg>
      );
    case MarkerShape.Rhombus:
      return (
        <svg {...commonProps}>
          <path d="M12 2l10 10-10 10L2 12 12 2z" />
        </svg>
      );
    case MarkerShape.Label:
      return (
        <svg {...commonProps} viewBox="0 0 24 24">
          <rect x="2" y="6" width="20" height="12" rx="2" />
        </svg>
      );
    default:
      return null;
  }
};

// Preset definitions based on user request
export const PRESET_MARKERS: MarkerDef[] = [
  { shape: MarkerShape.TriangleDown, color: MarkerColor.Grey, label: 'Triangolo Rov. Grigio' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.LightGreen, label: 'Triangolo Verde Chiaro' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.DarkGreen, label: 'Triangolo Verde Scuro' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.LightBlue, label: 'Triangolo Blu Chiaro' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.DarkBlue, label: 'Triangolo Blu Scuro' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.Yellow, label: 'Triangolo Giallo' },
  { shape: MarkerShape.TriangleUp, color: MarkerColor.Beige, label: 'Triangolo Beige' },
  { shape: MarkerShape.Circle, color: MarkerColor.Red, label: 'Pallino Rosso' },
  { shape: MarkerShape.Rhombus, color: MarkerColor.Azure, label: 'Rombo Azzurro' },
  { shape: MarkerShape.Label, color: MarkerColor.LabelYellow, label: 'Etichetta Gialla' },
];
