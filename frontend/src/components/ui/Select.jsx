import { useState, useRef, useEffect } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';

export default function Select({ 
  label,
  value, 
  onChange, 
  options = [], 
  placeholder = 'Selecionar...',
  className = '',
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-1.5 ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <div className="relative">
        {/* Trigger */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full h-10 px-3 rounded-md
            bg-dark-800 border border-dark-700
            text-left text-sm
            transition-all duration-150
            hover:border-dark-600
            focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50
            disabled:opacity-50 disabled:cursor-not-allowed
            inline-flex items-center justify-between gap-2
            ${isOpen ? 'border-accent ring-1 ring-accent/50' : ''}
          `}
        >
          <span className={`truncate ${selectedOption ? 'text-dark-100' : 'text-dark-500'}`}>
            {selectedOption?.label || placeholder}
          </span>
          <CaretDown 
            className={`w-4 h-4 text-dark-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 py-1 bg-dark-850 border border-dark-700 rounded-md shadow-lg animate-slide-down">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-sm text-left
                  flex items-center justify-between gap-2
                  hover:bg-dark-800 transition-colors
                  ${option.value === value ? 'text-accent' : 'text-dark-200'}
                `}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="w-4 h-4" weight="bold" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
