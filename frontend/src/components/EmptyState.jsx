import React from 'react';

/**
 * Estado vacío reutilizable
 * @param {string} icon - Emoji o icono
 * @param {string} title - Título principal
 * @param {string} description - Descripción
 * @param {ReactNode} action - Botón de acción (opcional)
 */
function EmptyState({ icon = '📦', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-8xl mb-6 animate-bounce">
        {icon}
      </div>
      <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">
        {title}
      </h3>
      <p className="text-slate-600 text-center max-w-md mb-6">
        {description}
      </p>
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
