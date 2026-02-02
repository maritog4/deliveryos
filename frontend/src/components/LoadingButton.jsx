import React from 'react';

/**
 * Botón con estado de carga
 * @param {boolean} loading - Si está cargando
 * @param {boolean} disabled - Si está deshabilitado
 * @param {string} children - Texto del botón
 * @param {string} className - Clases CSS adicionales
 * @param {string} loadingText - Texto mientras carga (opcional)
 */
function LoadingButton({ 
  loading = false, 
  disabled = false, 
  children, 
  className = '', 
  loadingText = 'Cargando...',
  ...props 
}) {
  return (
    <button
      disabled={loading || disabled}
      className={`relative ${loading ? 'cursor-wait' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="ml-2">{loadingText}</span>
        </span>
      )}
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
    </button>
  );
}

export default LoadingButton;
