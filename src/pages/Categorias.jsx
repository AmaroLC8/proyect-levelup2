import React, { useEffect, useState } from 'react';
import { listarProductos } from '../services/productosService';
import { listarCategoriasActivas } from '../services/categoriasService';
import ProductCard from '../components/ProductCard';
import EstadoCarga from '../components/EstadoCarga';

export default function Categorias() {
  // Se administran desde /admin/categorias (RF17); aquí solo se muestran las activas
  const [categorias, setCategorias] = useState([]);
  const [todosLosProductos, setTodosLosProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null); // objeto { id, nombre, ... }
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  // Carga categorías activas y productos una sola vez; al cambiar de categoría
  // se filtra en el navegador, así el cambio es inmediato y sin recargar (RF8)
  useEffect(() => {
    Promise.all([listarCategoriasActivas(), listarProductos()])
      .then(([listaCategorias, listaProductos]) => {
        setCategorias(listaCategorias);
        setTodosLosProductos(listaProductos);
        setCategoriaSeleccionada(listaCategorias[0] ?? null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  // El backend envía la categoría del producto como objeto: se compara por id
  const productosFiltrados = todosLosProductos.filter(
    (p) => p.categoria?.id === categoriaSeleccionada?.id
  );

  return (
    <div className="container my-5">
      <h2 className="text-info fw-bold mb-4">Categorías</h2>

      <EstadoCarga cargando={cargando} error={error} />

      {!cargando && !error && (
        <>
          {/* Botones de Categorías */}
          <div className="row g-3 mb-5">
            {categorias.map((cat) => (
              <div className="col-6 col-md-3" key={cat.id}>
                <button
                  className={`btn w-100 py-3 fw-bold shadow-sm ${
                    categoriaSeleccionada?.id === cat.id ? 'btn-info text-dark' : 'btn-outline-secondary text-light'
                  }`}
                  onClick={() => setCategoriaSeleccionada(cat)}
                >
                  <i className="bi bi-tag-fill me-2"></i>{cat.nombre}
                </button>
              </div>
            ))}
          </div>

          <h4 className="text-secondary border-bottom border-secondary pb-2 mb-4">
            Mostrando: <span className="text-light">{categoriaSeleccionada?.nombre}</span>
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
        </>
      )}
    </div>
  );
}
