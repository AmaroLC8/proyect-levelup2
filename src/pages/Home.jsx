import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos } from '../data/productos';
import ProductCard from '../components/ProductCard';
import videoHero from '../assets/ps5.mp4';

export default function Home() {
  const productos = obtenerProductos();

  return (
    <div className="container py-4">
      {/* Video Superior */}
      <div
        className="overflow-hidden mb-4"
        style={{
          borderRadius: '16px',
          border: '1px solid #22293a',
          backgroundColor: '#000000',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}
      >
        <video
          src={videoHero}
          autoPlay
          loop
          muted
          playsInline
          className="w-100 d-block"
          style={{ maxHeight: '380px', objectFit: 'cover' }}
        />
      </div>

      {/* Bloque de Título y Botones */}
      <div className="text-center py-4 mb-5" style={{ maxWidth: '720px', margin: '0 auto' }}>
        <h1 className="fw-bold display-6 mb-3" style={{ color: '#ffffff' }}>
          Desafía tus límites con <span style={{ color: '#0ea5e9' }}>Level-Up Gamer</span>
        </h1>
        <p className="fs-6 mb-4" style={{ color: '#94a3b8' }}>
          Consolas de nueva generación, periféricos competitivos y juegos de mesa con despacho a todo Chile.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Link
            to="/productos"
            className="btn px-4 py-2 fw-semibold"
            style={{ backgroundColor: '#0ea5e9', color: '#ffffff', borderRadius: '8px' }}
          >
            Explorar Catálogo
          </Link>
          <Link
            to="/categorias"
            className="btn px-4 py-2 fw-semibold"
            style={{
              backgroundColor: '#121620',
              color: '#ffffff',
              border: '1px solid #2e384d',
              borderRadius: '8px',
            }}
          >
            Ver Categorías
          </Link>
        </div>
      </div>

      {/* Encabezado Productos Destacados */}
      <div
        className="d-flex justify-content-between align-items-center pb-3 mb-4"
        style={{ borderBottom: '1px solid #22293a' }}
      >
        <h3 className="fw-bold mb-0" style={{ color: '#ffffff' }}>
          Productos Destacados
        </h3>
        <Link to="/productos" className="text-decoration-none fw-semibold" style={{ color: '#0ea5e9' }}>
          Ver catálogo completo →
        </Link>
      </div>

      {/* Grilla de 3 columnas */}
      <div className="row g-4">
        {productos.slice(0, 3).map((prod) => (
          <div className="col-12 col-md-4" key={prod.id}>
            <ProductCard producto={prod} />
          </div>
        ))}
      </div>
    </div>
  );
}