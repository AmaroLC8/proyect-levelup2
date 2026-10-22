import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerPrecioFinal } from '../data/productos';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Descuento de por vida para usuarios registrados con correo Duoc (RF1 y RF3)
export const PORCENTAJE_DESCUENTO_DUOC = 20;

export const CartProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('levelup_cart');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Guardar automáticamente en localStorage cuando el carrito cambie
  useEffect(() => {
    localStorage.setItem('levelup_cart', JSON.stringify(carrito));
  }, [carrito]);

  // Agregar al carrito validando stock
  const agregarAlCarrito = (producto) => {
    if (producto.stock <= 0) {
      alert(`Lo sentimos, "${producto.nombre}" no tiene stock disponible.`);
      return;
    }

    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        if (existe.cantidad >= producto.stock) {
          alert(`No puedes agregar más unidades. Stock máximo disponible: ${producto.stock}`);
          return prev;
        }
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Se almacena precio final y se garantiza que conserve el stock
      return [
        ...prev,
        {
          ...producto,
          precio: obtenerPrecioFinal(producto),
          cantidad: 1,
          stock: Number(producto.stock),
        },
      ];
    });
  };

  // Modificar cantidad (+ / -) validando stock
  const modificarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + cambio;

            // Validación de stock al sumar unidades
            if (cambio > 0 && nuevaCantidad > item.stock) {
              alert(`Solo hay ${item.stock} unidades disponibles en stock.`);
              return item;
            }

            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  // Eliminar un producto
  const eliminarDelCarrito = (id) => {
    setCarrito((prev) => prev.filter((item) => item.id !== id));
  };

  // Vaciar carrito
  const vaciarCarrito = () => {
    setCarrito([]);
  };

  // Cálculos automáticos: cantidad, subtotal, descuento Duoc y total a pagar
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const subtotal = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const descuento = usuario?.descuentoDuoc
    ? Math.round((subtotal * PORCENTAJE_DESCUENTO_DUOC) / 100)
    : 0;
  const totalMonto = subtotal - descuento;

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        modificarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        totalItems,
        subtotal,
        descuento,
        totalMonto,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el carrito fácilmente
export const useCart = () => useContext(CartContext);