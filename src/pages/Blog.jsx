import React from 'react';
import { Link } from 'react-router-dom';
import { obtenerBlogs } from '../data/blogs';
import { formatearFechaLarga } from '../utils/formato';

export default function Blog() {
  const blogs = obtenerBlogs();

  return (
    <div className="container py-4">
      <h2 className="fw-bold mb-1" style={{ color: '#ffffff' }}>
        Blog Level-Up
      </h2>
      <p className="mb-4" style={{ color: '#94a3b8' }}>
        Guías, novedades y comparativas del mundo gamer.
      </p>

      <div className="row g-4">
        {blogs.map((blog) => (
          <div className="col-12 col-md-6" key={blog.id}>
            <div
              className="h-100 d-flex flex-column"
              style={{
                backgroundColor: '#121620',
                border: '1px solid #22293a',
                borderRadius: '14px',
                overflow: 'hidden',
                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              }}
            >
              <div
                className="d-flex align-items-center justify-content-center p-3"
                style={{ height: '220px', backgroundColor: '#ffffff' }}
              >
                <img
                  src={blog.imagen}
                  alt={blog.titulo}
                  style={{ maxWidth: '100%', maxHeight: '190px', objectFit: 'contain' }}
                />
              </div>

              <div className="p-4 d-flex flex-column flex-grow-1">
                <div className="d-flex justify-content-between align-items-center mb-2 small">
                  <span className="badge" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
                    {blog.categoria}
                  </span>
                  <span style={{ color: '#94a3b8' }}>{formatearFechaLarga(blog.fecha)}</span>
                </div>
                <h4 className="fw-bold mb-2" style={{ color: '#ffffff' }}>
                  {blog.titulo}
                </h4>
                <p className="flex-grow-1" style={{ color: '#94a3b8' }}>
                  {blog.resumen}
                </p>
                <Link
                  to={`/blog/${blog.id}`}
                  className="btn align-self-start fw-semibold"
                  style={{ backgroundColor: '#0ea5e9', color: '#ffffff', borderRadius: '8px' }}
                >
                  Leer más <i className="bi bi-arrow-right ms-1"></i>
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
