import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Componentes generales y de seguridad
import Navbar from "./components/Navbar";
import RutaProtegidaAdmin from "./components/RutaProtegida";
import AdminLayout from "./components/AdminLayout";

// Páginas Públicas y de Cliente
import Home from "./pages/Home";
import Productos from "./pages/Productos";
import DetalleProducto from "./pages/DetalleProducto";
import Categorias from "./pages/Categorias";
import Ofertas from "./pages/Ofertas";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Nosotros from "./pages/Nosotros";
import Blog from "./pages/Blog";
import DetalleBlog from "./pages/DetalleBlog";
import Contacto from "./pages/Contacto";
import Carrito from "./pages/Carrito";
import Checkout from "./pages/Checkout";
import PagoExitoso from "./pages/PagoExitoso";
import PagoError from "./pages/PagoError";
import Perfil from "./pages/Perfil"; // <--- Perfil del Cliente

// Páginas Administrador
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrdenes from "./pages/admin/AdminOrdenes";
import VerBoletaAdmin from "./pages/admin/VerBoletaAdmin";
import AdminProductos from "./pages/admin/AdminProductos";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminReportes from "./pages/admin/AdminReportes";
import AdminPerfil from "./pages/admin/AdminPerfil"; // <--- Perfil del Admin

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <div className="d-flex flex-column min-vh-100">
            <Navbar />

            <main className="flex-grow-1">
              <Routes>
                {/* 1. Rutas Públicas de la Tienda */}
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

                {/* 2. Perfil del Cliente (FUERA de /admin) */}
                <Route path="/perfil" element={<Perfil />} />

                {/* 3. Rutas Protegidas del Panel Administrador */}
                <Route element={<RutaProtegidaAdmin />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="ordenes" element={<AdminOrdenes />} />
                    <Route path="ordenes/:id" element={<VerBoletaAdmin />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route path="categorias" element={<AdminCategorias />} />
                    <Route path="usuarios" element={<AdminUsuarios />} />
                    <Route path="reportes" element={<AdminReportes />} />
                    <Route path="perfil" element={<AdminPerfil />} />
                  </Route>
                </Route>
              </Routes>
            </main>

            <footer className="py-4 text-center text-secondary border-top border-secondary" style={{ backgroundColor: '#0b0d14' }}>
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