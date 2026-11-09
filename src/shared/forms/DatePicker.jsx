import { useId } from 'react';

const DatePicker = ({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  label,
  required = false,
  disabled = false,
  className = "",
  error = null
}) => {
  const inputId = useId();

  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const parsedDate = value ? new Date(`${value}T00:00:00`) : null;
  const selectedDate = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-bgray-900 dark:text-white"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative overflow-visible group">
        <input
          id={inputId}
          type="date"
          value={value || ""}
          onChange={handleChange}
          placeholder={placeholder}
          aria-label={!label ? placeholder : undefined}
          aria-invalid={error ? true : undefined}
          required={required}
          disabled={disabled}
          min="2020-01-01"
          max="2030-01-01"
          className="w-full px-5 py-3 pr-12 border border-gray-100 dark:border-darkblack-400 rounded-2xl bg-white/60 dark:bg-darkblack-500/60 text-bgray-900 dark:text-white placeholder-bgray-400 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 hover:bg-white/80 dark:hover:bg-darkblack-500/80 cursor-pointer shadow-xs disabled:opacity-30 disabled:cursor-not-allowed [color-scheme:light] dark:[color-scheme:dark]"
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none group-focus-within:text-blue-500 transition-colors">
          <svg className="w-5 h-5 text-bgray-400 dark:text-gray-200" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {selectedDate && (
        <p className="text-xs text-bgray-500 dark:text-bgray-400">
          Fecha seleccionada: {selectedDate.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      )}
    </div>
  );
};

export default DatePicker;
