import React, { useState } from 'react';
import { obtenerProductos } from '../data/productos';
import ProductCard from '../components/ProductCard';

export default function Categorias() {
  const categorias = ['Consolas', 'Periféricos', 'Sillas', 'Juegos de Mesa'];
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Consolas');
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
        {productosFiltrados.map((prod) => (
          <div className="col-12 col-sm-6 col-lg-4" key={prod.id}>
            <ProductCard producto={prod} />
          </div>
        ))}
      </div>
    </div>
  );
}