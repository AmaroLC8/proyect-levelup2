import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { listarProductos } from '../services/productosService';
import { listarCategoriasActivas } from '../services/categoriasService';
import { obtenerPrecioFinal } from '../utils/precios';
import ProductCard from '../components/ProductCard';
import EstadoCarga from '../components/EstadoCarga';

export default function Productos() {
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [precioMaximo, setPrecioMaximo] = useState('');

  // El texto de búsqueda vive en la URL (?buscar=...) para que funcione el buscador de la Navbar
  const [searchParams, setSearchParams] = useSearchParams();
  const busqueda = searchParams.get('buscar') ?? '';
  const setBusqueda = (texto) => setSearchParams(texto ? { buscar: texto } : {}, { replace: true });

  // Se cargan productos y categorías una sola vez, en paralelo (Promise.all).
  // Los filtros se aplican aquí en el navegador, así responden al instante mientras se escribe
  // y se puede filtrar por precio máximo (el backend solo filtra por categoría y texto).
  useEffect(() => {
    Promise.all([listarProductos(), listarCategoriasActivas()])
      .then(([listaProductos, listaCategorias]) => {
        setProductos(listaProductos);
        setCategorias(listaCategorias);
      })
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false));
  }, []);

  const productosFiltrados = productos.filter((p) => {
    // Los productos de categorías desactivadas en el admin no se muestran en la tienda.
    // El backend envía la categoría como objeto, con su campo "activa".
    const categoriaVisible = p.categoria?.activa;
    const coincideCategoria = categoriaVisible && (filtroCategoria === 'Todas' || p.categoria.nombre === filtroCategoria);
    const coincideTexto = p.nombre.toLowerCase().includes(busqueda.toLowerCase());
    const coincidePrecio = !precioMaximo || obtenerPrecioFinal(p) <= Number(precioMaximo);
    return coincideCategoria && coincideTexto && coincidePrecio;
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
        <div className="col-12 col-md-5">
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

        <div className="col-12 col-md-4">
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
            {categorias.map((cat) => (
              <option key={cat.id} value={cat.nombre}>{cat.nombre}</option>
            ))}
          </select>
        </div>

        <div className="col-12 col-md-3">
          <input
            type="number"
            min="0"
            step="1000"
            className="form-control py-2"
            style={{
              backgroundColor: '#090b10',
              border: '1px solid #2e384d',
              color: '#ffffff',
            }}
            placeholder="Precio máximo ($)"
            value={precioMaximo}
            onChange={(e) => setPrecioMaximo(e.target.value)}
          />
        </div>
      </div>

      <EstadoCarga cargando={cargando} error={error} />

      {/* Grilla de Productos (se muestra cuando ya terminó la carga sin errores) */}
      {!cargando && !error && (
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
      )}
    </div>
  );
}