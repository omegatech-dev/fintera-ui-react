import { useState, useRef, useEffect } from 'react';
import Datepicker from 'tailwind-datepicker-react';

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
  const [show, setShow] = useState(false);
  const datePickerRef = useRef(null);

  // Convert string date to Date object for the datepicker
  const selectedDate = value ? new Date(value) : null;

  const options = {
    title: label || "Seleccionar Fecha",
    autoHide: true,
    todayBtn: true,
    clearBtn: true,
    clearBtnText: "Limpiar",
    maxDate: new Date("2030-01-01"),
    minDate: new Date("2020-01-01"),
    theme: {
      background: "bg-white/90 dark:bg-darkblack-600/90 backdrop-blur-xl border border-white/40 dark:border-darkblack-400/40 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-4 overflow-visible",
      todayBtn: "bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/20 active:scale-95",
      clearBtn: "bg-gray-100 hover:bg-gray-200 dark:bg-darkblack-500 dark:hover:bg-darkblack-400 text-bgray-900 dark:text-white font-bold rounded-xl transition-all active:scale-95",
      icons: "text-blue-500 transition-colors hover:text-blue-600",
      text: "text-bgray-900 dark:text-white font-semibold",
      disabledText: "text-bgray-300 dark:text-bgray-700",
      input: "w-full px-5 py-3 pr-12 border-0 rounded-2xl bg-white/60 dark:bg-darkblack-500/60 text-bgray-900 dark:text-white placeholder-bgray-400 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 hover:bg-white/80 dark:hover:bg-darkblack-500/80 cursor-pointer shadow-xs",
      inputIcon: "hidden",
      selected: "bg-blue-600 text-white hover:bg-blue-700 font-bold shadow-md"
    },
    icons: {
      prev: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      ),
      next: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      )
    },
    datepickerClassNames: "absolute z-[1000] mt-1 shadow-xl left-0 top-full",
    defaultDate: selectedDate,
    language: "es",
    disabledDates: [],
    weekDays: ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"],
    inputNameProp: "date",
    inputIdProp: "date",
    inputPlaceholderProp: placeholder,
    inputDateFormatProp: {
      day: "numeric",
      month: "long",
      year: "numeric"
    }
  };

  const handleChange = (selectedDate) => {
    if (selectedDate) {
      // Format date as YYYY-MM-DD for consistency with the existing HTML date inputs
      const formattedDate = selectedDate.toISOString().split('T')[0];
      onChange(formattedDate);
    } else {
      onChange('');
    }
  };

  const handleClose = (state) => {
    setShow(state);
  };

  // Handle clicking outside to close the datepicker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShow(false);
      }
    };

    if (show) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [show]);

  return (
    <div className={`space-y-2 ${className}`} ref={datePickerRef}>
      {label && (
        <label className="block text-sm font-medium text-bgray-900 dark:text-white">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative overflow-visible group">
        <Datepicker
          options={options}
          onChange={handleChange}
          show={show}
          setShow={handleClose}
          classNames={disabled ? "opacity-30 cursor-not-allowed" : ""}
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
      {value && (
        <p className="text-xs text-bgray-500 dark:text-bgray-400">
          Fecha seleccionada: {new Date(value).toLocaleDateString('es-ES', {
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