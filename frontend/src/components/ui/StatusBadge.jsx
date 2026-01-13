import { STATUS_CONFIG } from '../../services/api';
import { Clock, Spinner, MagnifyingGlass, CheckCircle } from '@phosphor-icons/react';

const statusIcons = {
  0: Clock,
  1: Spinner,
  2: MagnifyingGlass,
  3: CheckCircle,
};

export default function StatusBadge({ status, size = 'md' }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG[0];
  const Icon = statusIcons[status] || Clock;

  const sizes = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span 
      className={`
        inline-flex items-center font-medium rounded-md
        border ${config.bgColor} ${config.textColor}
        border-current/20
        ${sizes[size]}
      `}
    >
      <Icon 
        className={`${iconSizes[size]} ${status === 1 ? 'animate-spin' : ''}`} 
        weight="bold" 
      />
      {config.label}
    </span>
  );
}
