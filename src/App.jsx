import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';

// Páginas de la tienda
import Home from './pages/Home';
import Productos from './pages/Productos';
import DetalleProducto from './pages/DetalleProducto';
import Categorias from './pages/Categorias';
import Ofertas from './pages/Ofertas';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Nosotros from './pages/Nosotros';
import Blog from './pages/Blog';
import DetalleBlog from './pages/DetalleBlog';
import Contacto from './pages/Contacto';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import PagoExitoso from './pages/PagoExitoso';
import PagoError from './pages/PagoError';

// Panel de Administración
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProductos from './pages/admin/AdminProductos';

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />

            <main className="flex-grow-1">
              <Routes>
                {/* Rutas de la Tienda Pública */}
                <Route path="/" element={<Home />} />
                <Route path="/productos" element={<Productos />} />
                <Route path="/producto/:id" element={<DetalleProducto />} />
                <Route path="/categorias" element={<Categorias />} />
                <Route path="/ofertas" element={<Ofertas />} />
                <Route path="/login" element={<Login />} />
                <Route path="/registro" element={<Registro />} />
                <Route path="/nosotros" element={<Nosotros />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<DetalleBlog />} />
                <Route path="/contacto" element={<Contacto />} />
                <Route path="/carrito" element={<Carrito />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/pago-exitoso" element={<PagoExitoso />} />
                <Route path="/pago-error" element={<PagoError />} />

                {/* Rutas del Panel Administrador */}
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/productos" element={<AdminProductos />} />
              </Routes>
            </main>

            <footer className="py-4 text-center text-secondary border-top border-secondary mt-5" style={{ backgroundColor: '#0b0d14' }}>
              <div className="container">
                <p className="mb-1 text-light fw-bold">LEVEL-UP GAMER © 2026 - Duoc UC</p>
                <small>Desarrollo Fullstack II - Evaluación Parcial N° 2</small>
              </div>
            </footer>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}
