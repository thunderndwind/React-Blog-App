import React from 'react';

interface FormErrorMessageProps {
  errors?: string | string[];
  className?: string;
}

export default function FormErrorMessage({ errors, className = '' }: FormErrorMessageProps) {
  if (!errors || (Array.isArray(errors) && errors.length === 0)) {
    return null;
  }

  const errorMessages = Array.isArray(errors) ? errors : [errors];

  return (
    <div className={`mt-2 text-sm text-red-600 dark:text-red-400 ${className}`}>
      {errorMessages.map((message, index) => (
        <p key={index} className="flex items-start mb-1 last:mb-0">
          <svg className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
          </svg>
          <span>{message}</span>
        </p>
      ))}
    </div>
  );
} 