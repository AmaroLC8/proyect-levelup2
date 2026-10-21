import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerBlogPorId, obtenerBlogs } from '../data/blogs';

export default function DetalleBlog() {
  const { id } = useParams();
  const blog = obtenerBlogPorId(id);

  if (!blog) {
    return (
      <div className="container my-5 text-center">
        <i className="bi bi-journal-x text-secondary" style={{ fontSize: '4rem' }}></i>
        <h3 className="mt-3 text-light">Publicación no encontrada</h3>
        <Link to="/blog" className="btn btn-info mt-2 text-dark fw-bold">
          Volver al Blog
        </Link>
      </div>
    );
  }

  const otrosBlogs = obtenerBlogs().filter((b) => b.id !== blog.id);

  const fecha = new Date(`${blog.fecha}T00:00:00`).toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="container py-4" style={{ maxWidth: '860px' }}>
      <Link to="/blog" className="text-decoration-none small" style={{ color: '#0ea5e9' }}>
        <i className="bi bi-arrow-left me-1"></i>Volver al Blog
      </Link>

      <article className="mt-3">
        <span className="badge mb-3" style={{ backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}>
          {blog.categoria}
        </span>
        <h1 className="fw-bold mb-2" style={{ color: '#ffffff' }}>
          {blog.titulo}
        </h1>
        <p className="small mb-4" style={{ color: '#94a3b8' }}>
          <i className="bi bi-person me-1"></i>{blog.autor} · <i className="bi bi-calendar3 mx-1"></i>{fecha}
        </p>

        <div
          className="d-flex align-items-center justify-content-center p-4 mb-4"
          style={{ backgroundColor: '#ffffff', borderRadius: '16px' }}
        >
          <img src={blog.imagen} alt={blog.titulo} style={{ maxWidth: '100%', maxHeight: '360px', objectFit: 'contain' }} />
        </div>

        {blog.contenido.map((parrafo, idx) => (
          <p key={idx} className="fs-5 mb-4" style={{ color: '#cbd5e1', lineHeight: '1.8' }}>
            {parrafo}
          </p>
        ))}
      </article>

      {otrosBlogs.length > 0 && (
        <div className="pt-4 mt-5" style={{ borderTop: '1px solid #22293a' }}>
          <h5 className="fw-bold mb-3" style={{ color: '#ffffff' }}>Otras publicaciones</h5>
          {otrosBlogs.map((otro) => (
            <Link
              key={otro.id}
              to={`/blog/${otro.id}`}
              className="d-block text-decoration-none p-3 mb-2"
              style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '10px', color: '#ffffff' }}
            >
              <i className="bi bi-journal-text text-info me-2"></i>{otro.titulo}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
