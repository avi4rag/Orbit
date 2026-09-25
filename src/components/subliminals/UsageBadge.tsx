import React from 'react';
import type { UsageType } from '../../types/subliminal';
import './UsageBadge.css';

interface UsageBadgeProps {
  type: UsageType | string;
  className?: string;
}

export const UsageBadge: React.FC<UsageBadgeProps> = ({ type, className = '' }) => {
  const normalized = (type || 'ONE TIME').toUpperCase();

  let modifier = 'orbit-usage-badge--one-time';
  let label = 'ONE TIME';

  switch (normalized) {
    case 'MORNING':
      modifier = 'orbit-usage-badge--morning';
      label = 'MORNING';
      break;
    case 'DAYTIME':
      modifier = 'orbit-usage-badge--daytime';
      label = 'DAYTIME';
      break;
    case 'NIGHT':
      modifier = 'orbit-usage-badge--night';
      label = 'NIGHT';
      break;
    case 'SLEEP':
      modifier = 'orbit-usage-badge--sleep';
      label = 'SLEEP';
      break;
    case 'FOCUS':
      modifier = 'orbit-usage-badge--focus';
      label = 'FOCUS';
      break;
    case 'REPEAT':
      modifier = 'orbit-usage-badge--repeat';
      label = 'REPEAT';
      break;
    case 'ONE TIME':
    default:
      modifier = 'orbit-usage-badge--one-time';
      label = 'ONE TIME';
      break;
  }

  return (
    <span className={`orbit-usage-badge ${modifier} ${className}`}>
      <span className="orbit-usage-badge-dot" aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
};
