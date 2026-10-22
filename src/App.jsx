import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminOrdenes from "./pages/admin/AdminOrdenes";
import VerBoletaAdmin from "./pages/admin/VerBoletaAdmin";

// Contextos
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";

// Componentes generales
import Navbar from "./components/Navbar";
import RutaProtegidaAdmin from "./components/RutaProtegida";
import AdminLayout from "./components/AdminLayout";

// Páginas Públicas
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

// Páginas Administrador (Solo importamos los archivos que YA existen)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProductos from "./pages/admin/AdminProductos";

// Componente auxiliar para secciones en desarrollo
const EnConstruccion = ({ titulo }) => (
  <div className="text-light p-5 text-center">
    <h3 className="text-info mb-3">{titulo}</h3>
    <p className="text-secondary">
      Esta sección se implementará en los siguientes puntos.
    </p>
  </div>
);

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

                {/* Rutas Protegidas del Panel Administrador */}
                <Route element={<RutaProtegidaAdmin />}>
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="ordenes" element={<AdminOrdenes />} />
                    <Route path="ordenes/:id" element={<VerBoletaAdmin />} />
                    <Route path="productos" element={<AdminProductos />} />
                    <Route
                      path="categorias"
                      element={<EnConstruccion titulo="Gestión de Categorías" />}
                    />
                    <Route
                      path="usuarios"
                      element={<EnConstruccion titulo="Gestión de Usuarios" />}
                    />
                    <Route
                      path="reportes"
                      element={<EnConstruccion titulo="Reportes y Ventas" />}
                    />
                    <Route
                      path="perfil"
                      element={<EnConstruccion titulo="Perfil de Administrador" />}
                    />
                  </Route>
                </Route>
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}