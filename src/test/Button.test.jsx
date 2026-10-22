import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Button from '../components/Button';

describe('Pruebas unitarias en el componente Button.jsx', () => {
  it('debe renderizar el texto del botón correctamente', () => {
    render(<Button>Guardar Producto</Button>);
    expect(screen.getByText('Guardar Producto')).toBeTruthy();
  });

  it('debe aplicar la variante de color especificada', () => {
    const { container } = render(<Button variant="danger">Eliminar</Button>);
    const boton = container.querySelector('button');
    expect(boton.classList.contains('btn-danger')).toBe(true);
  });

  it('debe ejecutar la función onClick al hacer clic', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Hacer Clic</Button>);

    const boton = screen.getByText('Hacer Clic');
    fireEvent.click(boton);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('no debe ejecutar onClick si el botón está deshabilitado', () => {
    const handleClick = vi.fn();
    render(<Button disabled onClick={handleClick}>Deshabilitado</Button>);

    const boton = screen.getByText('Deshabilitado');
    fireEvent.click(boton);

    expect(handleClick).not.toHaveBeenCalled();
  });
});
