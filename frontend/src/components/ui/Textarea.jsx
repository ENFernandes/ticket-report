import { forwardRef } from 'react';

const Textarea = forwardRef(({ 
  label,
  error,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className={`space-y-1.5 ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-dark-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-3 py-2.5 rounded-md
          bg-dark-800 border border-dark-700
          text-dark-100 placeholder-dark-500
          text-sm resize-none
          transition-all duration-150
          hover:border-dark-600
          focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-500/50 focus:border-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
