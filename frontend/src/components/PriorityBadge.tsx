import React from 'react';
import { PriorityType } from '../types';

interface PriorityBadgeProps {
  priority: PriorityType;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority }) => {
  const label = priority === 'HIGH' ? '🔴 HIGH' : (priority === 'MEDIUM' ? '🟠 MEDIUM' : '🟢 LOW');
  return (
    <span className={`badge-priority badge-${priority}`}>
      {label}
    </span>
  );
};
