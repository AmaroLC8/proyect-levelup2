import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider } from '../context/AuthContext';
import { CartProvider, useCart } from '../context/CartContext';
import { obtenerProductoPorId } from '../data/productos';

// El carrito necesita la sesión para saber si aplica el descuento Duoc
const Proveedores = ({ children }) => (
  <AuthProvider>
    <CartProvider>{children}</CartProvider>
  </AuthProvider>
);

const renderCarrito = () => renderHook(() => useCart(), { wrapper: Proveedores });

describe('Pruebas del estado global del carrito (CartContext)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('agregarAlCarrito agrega el producto con cantidad 1 y cobra el precio de oferta', () => {
    const { result } = renderCarrito();

    act(() => {
      result.current.agregarAlCarrito(obtenerProductoPorId(2)); // Silla: 159.990 en oferta a 129.990
    });

    expect(result.current.carrito).toHaveLength(1);
    expect(result.current.carrito[0].cantidad).toBe(1);
    expect(result.current.carrito[0].precio).toBe(129990);
  });

  it('agregar el mismo producto otra vez suma la cantidad en vez de duplicarlo', () => {
    const { result } = renderCarrito();
    const ps5 = obtenerProductoPorId(1);

    act(() => {
      result.current.agregarAlCarrito(ps5);
      result.current.agregarAlCarrito(ps5);
      result.current.agregarAlCarrito(obtenerProductoPorId(3));
    });

    expect(result.current.carrito).toHaveLength(2);
    expect(result.current.carrito[0].cantidad).toBe(2);
    expect(result.current.totalItems).toBe(3);
  });

  it('modificarCantidad elimina el producto cuando la cantidad llega a 0', () => {
    const { result } = renderCarrito();

    act(() => {
      result.current.agregarAlCarrito(obtenerProductoPorId(1));
      result.current.modificarCantidad(1, 1);
    });
    expect(result.current.carrito[0].cantidad).toBe(2);

    act(() => {
      result.current.modificarCantidad(1, -1);
      result.current.modificarCantidad(1, -1);
    });
    expect(result.current.carrito).toHaveLength(0);
  });

  it('eliminarDelCarrito quita un producto y vaciarCarrito deja el carrito vacío', () => {
    const { result } = renderCarrito();

    act(() => {
      result.current.agregarAlCarrito(obtenerProductoPorId(1));
      result.current.agregarAlCarrito(obtenerProductoPorId(5));
      result.current.eliminarDelCarrito(1);
    });
    expect(result.current.carrito.map((item) => item.id)).toEqual([5]);

    act(() => {
      result.current.vaciarCarrito();
    });
    expect(result.current.carrito).toEqual([]);
    expect(result.current.totalMonto).toBe(0);
  });

  it('sin sesión Duoc no hay descuento: el total es igual al subtotal', () => {
    const { result } = renderCarrito();

    act(() => {
      result.current.agregarAlCarrito(obtenerProductoPorId(5)); // Mouse: 29.990
      result.current.modificarCantidad(5, 1);
    });

    expect(result.current.subtotal).toBe(59980);
    expect(result.current.descuento).toBe(0);
    expect(result.current.totalMonto).toBe(59980);
  });

  it('con un usuario Duoc aplica el 20% de descuento sobre el subtotal (RF3)', () => {
    localStorage.setItem('levelup_sesion', '2'); // pedro@duocuc.cl
    const { result } = renderCarrito();

    act(() => {
      result.current.agregarAlCarrito(obtenerProductoPorId(1)); // PS5: 499.990
    });

    expect(result.current.subtotal).toBe(499990);
    expect(result.current.descuento).toBe(99998);
    expect(result.current.totalMonto).toBe(399992);
  });

  it('guarda el carrito en localStorage y lo recupera al volver a cargar (ERS 3.3.3)', () => {
    const primero = renderCarrito();
    act(() => {
      primero.result.current.agregarAlCarrito(obtenerProductoPorId(3));
    });
    primero.unmount();

    const segundo = renderCarrito();
    expect(segundo.result.current.carrito).toHaveLength(1);
    expect(segundo.result.current.carrito[0].nombre).toBe('Catan El Juego');
  });
});
