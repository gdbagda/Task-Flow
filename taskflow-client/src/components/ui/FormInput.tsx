import React, { useState } from 'react';

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  autoComplete?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

const EyeIcon: React.FC<{ open: boolean }> = ({ open }) =>
  open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

const FormInput: React.FC<FormInputProps> = ({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  hint,
  required,
  autoComplete,
  icon,
  disabled,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="form-group">
      <label className="form-label" htmlFor={id}>
        {label}
        {required && <span aria-hidden="true">*</span>}
      </label>
      <div className="input-wrapper">
        {icon && (
          <span className="input-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={
            error ? `${id}-error` : hint ? `${id}-hint` : undefined
          }
          className={[
            'form-input',
            icon ? 'has-icon' : '',
            isPassword ? 'has-action' : '',
            error ? 'error' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {isPassword && (
          <button
            type="button"
            className="input-action"
            onClick={() => setShowPassword((p) => !p)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
      {error && (
        <p className="form-error" id={`${id}-error`} role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="form-hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
    </div>
  );
};

export default FormInput;