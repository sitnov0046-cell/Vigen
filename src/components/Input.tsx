'use client';

type InputElementType = HTMLInputElement | HTMLTextAreaElement;

interface InputProps extends Omit<React.InputHTMLAttributes<InputElementType>, 'className'> {
  label?: string;
  error?: string;
  className?: string;
  as?: 'input' | 'textarea';
}

export function Input({ 
  label, 
  error, 
  className = '', 
  as = 'input',
  ...props 
}: InputProps) {
  const Component = as;

  const baseStyles = `
    w-full px-3 py-2 text-sm
    bg-white/10 text-white placeholder-white/50
    border border-white/20 rounded-lg
    focus:outline-none focus:ring-2 focus:ring-white/30
    transition-all duration-200
    ${error ? 'border-red-500' : ''}
    ${className}
  `;
  return (
    <div className="space-y-2 w-full">
      {label && (
        <label className="block text-sm font-medium text-white/90">
          {label}
        </label>
      )}
      <Component
        className={`input-field ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-red-400 text-sm mt-1">{error}</p>
      )}
    </div>
  );
}