import React from 'react';

/**
 * Componente de Botón Reutilizable con estilos estandarizados de Bootstrap.
 *
 * Props:
 * - variant: 'info' | 'primary' | 'success' | 'warning' | 'danger' | 'outline-info' | etc.
 * - size: 'sm' | 'md' | 'lg'
 * - icon: Nombre del ícono de Bootstrap Icons (ej: 'plus-circle', 'pencil', 'trash')
 * - onClick: Función ejecutable al hacer clic
 * - type: 'button' | 'submit' | 'reset'
 * - disabled: boolean
 * - className: Clases adicionales
 */
export default function Button({
  children,
  variant = 'info',
  size = 'md',
  icon = null,
  onClick,
  type = 'button',
  disabled = false,
  className = ''
}) {
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';
  const variantClass = `btn-${variant}`;

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && <i className={`bi bi-${icon} me-1`}></i>}
      {children}
    </button>
  );
}