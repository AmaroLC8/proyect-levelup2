import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

// Componentes a testear
import ProductCard from '../components/ProductCard';
import Carrito from '../pages/Carrito';
import Checkout from '../pages/Checkout';
import AdminDashboard from '../pages/admin/AdminDashboard';

// Mock del Contexto de Carrito para simular funciones y estados
const mockAgregarAlCarrito = vi.fn();
const mockModificarCantidad = vi.fn();
const mockEliminarDelCarrito = vi.fn();
const mockVaciarCarrito = vi.fn();

let mockCarritoState = [];
let mockTotalMonto = 0;

vi.mock('../context/CartContext', () => ({
  useCart: () => ({
    carrito: mockCarritoState,
    agregarAlCarrito: mockAgregarAlCarrito,
    modificarCantidad: mockModificarCantidad,
    eliminarDelCarrito: mockEliminarDelCarrito,
    vaciarCarrito: mockVaciarCarrito,
    totalItems: mockCarritoState.length,
    totalMonto: mockTotalMonto,
  }),
}));

// Producto simulado de prueba
const productoMock = {
  id: 1,
  nombre: 'PlayStation 5 Slim 1TB',
  categoria: 'Consolas',
  precio: 499990,
  stock: 8,
  stockCritico: 3,
  imagen: 'https://via.placeholder.com/200',
  descripcion: 'Consola Sony PlayStation 5 con lector de discos.',
};

describe('Suite de Pruebas Unitarias - Level-Up Gamer (10/10 Requeridas)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCarritoState = [];
    mockTotalMonto = 0;
  });

  // ==========================================
  // GRUPO 1: PROPIEDADES (PROPS) Y RENDERIZADO BÁSICO
  // ==========================================

  it('1. Debe renderizar correctamente la información básica del producto recibida por Props', () => {
    render(
      <BrowserRouter>
        <ProductCard producto={productoMock} />
      </BrowserRouter>
    );

    // Valida que el nombre del producto aparezca en el DOM
    const titulo = screen.getByText('PlayStation 5 Slim 1TB');
    expect(titulo).toBeInTheDocument();

    // Valida que la descripción recibida por props se muestre
    expect(screen.getByText(/Consola Sony PlayStation 5/i)).toBeInTheDocument();
  });

  it('2. Debe recibir y renderizar la propiedad categoría como una etiqueta (badge)', () => {
    render(
      <BrowserRouter>
        <ProductCard producto={productoMock} />
      </BrowserRouter>
    );

    const badgeCategoria = screen.getByText('Consolas');
    expect(badgeCategoria).toBeInTheDocument();
    expect(badgeCategoria).toHaveClass('badge');
  });

  it('3. Debe renderizar el precio formateado en moneda local chilena (CLP)', () => {
    render(
      <BrowserRouter>
        <ProductCard producto={productoMock} />
      </BrowserRouter>
    );

    // El precio debe contener el formato de pesos ($)
    const precio = screen.getByText(/\$499\.990/i);
    expect(precio).toBeInTheDocument();
  });

  // ==========================================
  // GRUPO 2: SIMULACIÓN DE EVENTOS Y MOCKS
  // ==========================================

  it('4. Debe ejecutar la función agregarAlCarrito al hacer clic en el botón Añadir (Evento Click)', () => {
    render(
      <BrowserRouter>
        <ProductCard producto={productoMock} />
      </BrowserRouter>
    );

    const botonAnadir = screen.getByRole('button', { name: /añadir/i });
    fireEvent.click(botonAnadir);

    // Verifica que el Mock fue llamado exactamente 1 vez con el producto correcto
    expect(mockAgregarAlCarrito).toHaveBeenCalledTimes(1);
    expect(mockAgregarAlCarrito).toHaveBeenCalledWith(productoMock);
  });

  // ==========================================
  // GRUPO 3: RENDERIZADO CONDICIONAL
  // ==========================================

  it('5. Debe mostrar el mensaje condicional "Tu carrito está vacío" cuando no hay ítems', () => {
    mockCarritoState = [];
    render(
      <BrowserRouter>
        <Carrito />
      </BrowserRouter>
    );

    const mensajeVacio = screen.getByText(/tu carrito está vacío/i);
    expect(mensajeVacio).toBeInTheDocument();
  });

  it('6. Debe renderizar la tabla con productos cuando el carrito NO está vacío', () => {
    mockCarritoState = [{ ...productoMock, cantidad: 2 }];
    mockTotalMonto = 999980;

    render(
      <BrowserRouter>
        <Carrito />
      </BrowserRouter>
    );

    // Verifica que el producto aparezca en la tabla y no el aviso de vacío
    expect(screen.getByText('PlayStation 5 Slim 1TB')).toBeInTheDocument();
    expect(screen.queryByText(/tu carrito está vacío/i)).not.toBeInTheDocument();
  });

  it('7. Debe ejecutar la función modificarCantidad (+1) al pulsar el botón de incremento en el carrito', () => {
    mockCarritoState = [{ ...productoMock, cantidad: 1 }];

    render(
      <BrowserRouter>
        <Carrito />
      </BrowserRouter>
    );

    const botonIncrementar = screen.getByText('+');
    fireEvent.click(botonIncrementar);

    expect(mockModificarCantidad).toHaveBeenCalledWith(productoMock.id, 1);
  });

  // ==========================================
  // GRUPO 4: MANEJO DE ESTADO (STATE) Y FORMULARIOS
  // ==========================================

  it('8. Debe actualizar el Estado (State) del formulario de Checkout cuando el usuario escribe en un input', () => {
    mockCarritoState = [{ ...productoMock, cantidad: 1 }];

    render(
      <BrowserRouter>
        <AuthProvider>
          <Checkout />
        </AuthProvider>
      </BrowserRouter>
    );

    const inputNombre = screen.getByPlaceholderText(/tu nombre gamer|ej: pedro/i);
    fireEvent.change(inputNombre, { target: { value: 'Lukas Meza' } });

    // Verifica que el valor del estado interno se refleje en el DOM
    expect(inputNombre.value).toBe('Lukas Meza');
  });

  it('9. Debe mostrar condicionalmente un mensaje de error si el usuario envía el formulario con campos vacíos', () => {
    mockCarritoState = [{ ...productoMock, cantidad: 1 }];

    render(
      <BrowserRouter>
        <AuthProvider>
          <Checkout />
        </AuthProvider>
      </BrowserRouter>
    );

    const botonPagar = screen.getByRole('button', { name: /pagar ahora/i });
    fireEvent.click(botonPagar);

    // Valida la aparición del mensaje de error
    const errorMsg = screen.getByText(/por favor completa todos los campos obligatorios/i);
    expect(errorMsg).toBeInTheDocument();
  });

  // ==========================================
  // GRUPO 5: LÓGICA DE NEGOCIO Y DASHBOARD ADMIN
  // ==========================================

  it('10. Debe renderizar correctamente el título y las métricas del panel de administración', () => {
    render(
      <BrowserRouter>
        <AdminDashboard />
      </BrowserRouter>
    );

    expect(screen.getByText(/panel de administración/i)).toBeInTheDocument();
    expect(screen.getByText(/órdenes realizadas/i)).toBeInTheDocument();
    expect(screen.getByText(/alertas de inventario/i)).toBeInTheDocument();
  });
});