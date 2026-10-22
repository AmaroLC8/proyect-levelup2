import React, { useState } from 'react';
import { obtenerProductos } from '../data/productos';
import { obtenerCategoriasActivas } from '../data/categorias';
import ProductCard from '../components/ProductCard';

export default function Categorias() {
  // Se administran desde /admin/categorias (RF17)
  const categorias = obtenerCategoriasActivas().map((c) => c.nombre);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(categorias[0] ?? '');
  const todosLosProductos = obtenerProductos();

  const productosFiltrados = todosLosProductos.filter(
    (p) => p.categoria === categoriaSeleccionada
  );

  return (
    <div className="container my-5">
      <h2 className="text-info fw-bold mb-4">Categorías</h2>

      {/* Botones de Categorías */}
      <div className="row g-3 mb-5">
        {categorias.map((cat) => (
          <div className="col-6 col-md-3" key={cat}>
            <button
              className={`btn w-100 py-3 fw-bold shadow-sm ${
                categoriaSeleccionada === cat ? 'btn-info text-dark' : 'btn-outline-secondary text-light'
              }`}
              onClick={() => setCategoriaSeleccionada(cat)}
            >
              <i className="bi bi-tag-fill me-2"></i>{cat}
            </button>
          </div>
        ))}
      </div>

      <h4 className="text-secondary border-bottom border-secondary pb-2 mb-4">
        Mostrando: <span className="text-light">{categoriaSeleccionada}</span>
      </h4>

      <div className="row g-4">
        {productosFiltrados.length === 0 && (
          <div className="col-12 text-center text-secondary py-5">
            Aún no hay productos en esta categoría.
          </div>
        )}
        {productosFiltrados.map((prod) => (
          <div className="col-12 col-sm-6 col-lg-4" key={prod.id}>
            <ProductCard producto={prod} />
          </div>
        ))}
      </div>
    </div>
  );
}