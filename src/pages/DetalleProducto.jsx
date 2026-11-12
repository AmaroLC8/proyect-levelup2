import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProducto, listarProductos } from '../services/productosService';
import { esOferta, obtenerPrecioFinal, obtenerPorcentajeDescuento } from '../utils/precios';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/ProductCard';
import EstadoCarga from '../components/EstadoCarga';
import { formatearDinero } from '../utils/formato';

// Lee el id de la URL y dibuja el detalle con key={id}: al pasar de un producto a otro
// (por ejemplo, desde "Productos relacionados") React crea el detalle desde cero,
// así vuelve a mostrar "Cargando..." y no queda a la vista el producto anterior.
export default function DetalleProducto() {
  const { id } = useParams();
  return <DetalleDeUnProducto key={id} id={id} />;
}

function DetalleDeUnProducto({ id }) {
  const { agregarAlCarrito } = useCart();
  const [producto, setProducto] = useState(null);
  const [relacionados, setRelacionados] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // 1) GET /productos/{id}
    obtenerProducto(id)
      .then((datos) => {
        setProducto(datos);
        // 2) GET /productos?categoriaId=... para los relacionados: hasta 3 de la misma
        //    categoría, sin incluir el actual. Si esta llamada falla, solo no se muestran.
        return listarProductos({ categoriaId: datos.categoria.id })
          .then((lista) => setRelacionados(lista.filter((p) => p.id !== datos.id).slice(0, 3)))
          .catch(() => setRelacionados([]));
      })
      .catch((err) => {
        // Un 404 se muestra como "Producto no encontrado" (más abajo); otro error, en la alerta
        if (err.status !== 404) setError(err.message);
      })
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando || error) {
    return (
      <div className="container py-4">
        <EstadoCarga cargando={cargando} error={error} />
      </div>
    );
  }

  // Si el id de la URL no existe (por ejemplo, producto eliminado desde el admin)
  if (!producto) {
    return (
      <div className="container my-5 text-center">
        <i className="bi bi-search text-secondary" style={{ fontSize: '4rem' }}></i>
        <h3 className="mt-3 text-light">Producto no encontrado</h3>
        <p className="text-secondary">El producto que buscas no existe o ya no está disponible.</p>
        <Link to="/productos" className="btn btn-info mt-2 text-dark fw-bold">
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  const sinStock = producto.stock <= 0;

  return (
    <div className="container py-4">
      {/* Ruta de navegación */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb mb-0">
          <li className="breadcrumb-item">
            <Link to="/" className="text-decoration-none" style={{ color: '#0ea5e9' }}>Home</Link>
          </li>
          <li className="breadcrumb-item">
            <Link to="/productos" className="text-decoration-none" style={{ color: '#0ea5e9' }}>Catálogo</Link>
          </li>
          <li className="breadcrumb-item active text-secondary" aria-current="page">
            {producto.nombre}
          </li>
        </ol>
      </nav>

      <div
        className="row g-0 overflow-hidden mb-5"
        style={{
          backgroundColor: '#121620',
          border: '1px solid #22293a',
          borderRadius: '16px',
          boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
        }}
      >
        {/* Imagen del producto */}
        <div
          className="col-12 col-md-6 d-flex align-items-center justify-content-center p-4"
          style={{ backgroundColor: '#ffffff', minHeight: '320px' }}
        >
          <img
            src={producto.imagen}
            alt={producto.nombre}
            style={{ maxWidth: '100%', maxHeight: '380px', objectFit: 'contain' }}
          />
        </div>

        {/* Información del producto */}
        <div className="col-12 col-md-6 p-4 p-lg-5 d-flex flex-column">
          <span
            className="badge align-self-start mb-3"
            style={{
              backgroundColor: 'rgba(14, 165, 233, 0.15)',
              color: '#38bdf8',
              fontSize: '0.8rem',
              padding: '6px 12px',
              textTransform: 'uppercase',
            }}
          >
            {producto.categoria?.nombre}
          </span>

          <h1 className="fw-bold fs-2 mb-3" style={{ color: '#ffffff' }}>
            {producto.nombre}
          </h1>

          <p className="mb-4" style={{ color: '#94a3b8', lineHeight: '1.7' }}>
            {producto.descripcion}
          </p>

          {esOferta(producto) && (
            <div className="d-flex align-items-center gap-2 mb-1">
              <span className="text-decoration-line-through" style={{ color: '#94a3b8' }}>
                {formatearDinero(producto.precio)}
              </span>
              <span className="badge bg-danger">-{obtenerPorcentajeDescuento(producto)}%</span>
            </div>
          )}
          <div
            className="fs-2 fw-bold mb-2"
            style={{ color: esOferta(producto) ? '#f87171' : '#ffffff' }}
          >
            {formatearDinero(obtenerPrecioFinal(producto))}
          </div>

          <p className={`small mb-4 ${sinStock ? 'text-danger' : 'text-success'}`}>
            <i className={`bi ${sinStock ? 'bi-x-circle' : 'bi-check-circle'} me-1`}></i>
            {sinStock ? 'Sin stock disponible' : `Stock disponible: ${producto.stock} unidades`}
          </p>

          <div className="d-flex flex-wrap gap-2 mt-auto">
            <button
              className="btn btn-lg px-4 fw-semibold d-flex align-items-center gap-2"
              style={{ backgroundColor: '#0ea5e9', color: '#ffffff', border: 'none', borderRadius: '8px' }}
              onClick={() => agregarAlCarrito(producto)}
              disabled={sinStock}
            >
              <i className="bi bi-cart-plus"></i> Añadir al carrito
            </button>
            <Link to="/productos" className="btn btn-lg btn-outline-secondary px-4">
              <i className="bi bi-arrow-left me-1"></i>Seguir comprando
            </Link>
          </div>
        </div>
      </div>

      {/* Productos de la misma categoría */}
      {relacionados.length > 0 && (
        <>
          <h3 className="fw-bold mb-4 pb-3" style={{ color: '#ffffff', borderBottom: '1px solid #22293a' }}>
            Productos relacionados
          </h3>
          <div className="row g-4">
            {relacionados.map((prod) => (
              <div className="col-12 col-md-4" key={prod.id}>
                <ProductCard producto={prod} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
