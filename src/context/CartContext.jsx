import React, { createContext, useContext, useState, useEffect } from 'react';
import { obtenerPrecioFinal } from '../data/productos';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [carrito, setCarrito] = useState(() => {
    const guardado = localStorage.getItem('levelup_cart');
    return guardado ? JSON.parse(guardado) : [];
  });

  // Guardar automáticamente en localStorage cuando el carrito cambie
  useEffect(() => {
    localStorage.setItem('levelup_cart', JSON.stringify(carrito));
  }, [carrito]);

  // Agregar al carrito
  const agregarAlCarrito = (producto) => {
    setCarrito((prev) => {
      const existe = prev.find((item) => item.id === producto.id);
      if (existe) {
        return prev.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        );
      }
      // Se guarda el precio final para que las ofertas se cobren en el carrito
      return [...prev, { ...producto, precio: obtenerPrecioFinal(producto), cantidad: 1 }];
    });
  };

  // Modificar cantidad (+ / -)
  const modificarCantidad = (id, cambio) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + cambio;
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

  // Cálculos automáticos de cantidad total y monto total
  const totalItems = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  const totalMonto = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{
        carrito,
        agregarAlCarrito,
        modificarCantidad,
        eliminarDelCarrito,
        vaciarCarrito,
        totalItems,
        totalMonto,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook personalizado para usar el carrito fácilmente
export const useCart = () => useContext(CartContext);