import React, { useState, useEffect } from 'react';
import { obtenerProductos } from '../data/productos';
import ProductCard from '../components/ProductCard';

export default function Productos() {
  const [productos, setProductos] = useState([]);
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    setProductos(obtenerProductos());
  }, []);

  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = filtroCategoria === 'Todas' || p.categoria === filtroCategoria;
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideTexto;
  });

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-4" style={{ color: '#ffffff' }}>
        Catálogo Completo
      </h2>

      {/* Barra de Filtros Oscura */}
      <div
        className="row g-3 mb-4 p-3 mx-0"
        style={{
          backgroundColor: '#121620',
          border: '1px solid #22293a',
          borderRadius: '12px',
        }}
      >
        <div className="col-12 col-md-7">
          <input
            type="text"
            className="form-control py-2"
            style={{
              backgroundColor: '#090b10',
              border: '1px solid #2e384d',
              color: '#ffffff',
            }}
            placeholder="Buscar producto por nombre..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="col-12 col-md-5">
          <select
            className="form-select py-2"
            style={{
              backgroundColor: '#090b10',
              border: '1px solid #2e384d',
              color: '#ffffff',
            }}
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="Todas">Todas las Categorías</option>
            <option value="Consolas">Consolas</option>
            <option value="Periféricos">Periféricos</option>
            <option value="Sillas">Sillas</option>
            <option value="Juegos de Mesa">Juegos de Mesa</option>
          </select>
        </div>
      </div>

      {/* Grilla de Productos */}
      <div className="row g-4">
        {productosFiltrados.length > 0 ? (
          productosFiltrados.map((prod) => (
            <div className="col-12 col-md-6 col-lg-4" key={prod.id}>
              <ProductCard producto={prod} />
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5" style={{ color: '#94a3b8' }}>
            No se encontraron productos con esos filtros.
          </div>
        )}
      </div>
    </div>
  );
}