import React from 'react';
import { Link } from 'react-router-dom';

const VALORES = [
  { icono: 'bi-controller', titulo: 'Pasión gamer', texto: 'Somos jugadores antes que vendedores: recomendamos lo que usaríamos.' },
  { icono: 'bi-truck', titulo: 'Despacho a todo Chile', texto: 'Llegamos desde Arica a Punta Arenas con seguimiento de cada pedido.' },
  { icono: 'bi-trophy', titulo: 'Comunidad', texto: 'Puntos LevelUp, referidos y descuentos para quienes juegan con nosotros.' },
];

const EQUIPO = ['Amaro López', 'Lukas Meza', 'Maximiliano Mella'];

export default function Nosotros() {
  return (
    <div className="container py-4">
      {/* Presentación */}
      <div className="row align-items-center g-4 mb-5">
        <div className="col-12 col-lg-7">
          <h1 className="fw-bold display-6 mb-3" style={{ color: '#ffffff' }}>
            Somos <span style={{ color: '#0ea5e9' }}>Level-Up Gamer</span>
          </h1>
          <p className="fs-5" style={{ color: '#94a3b8', lineHeight: '1.7' }}>
            Una tienda online chilena creada por y para la comunidad gamer. Nacimos con la idea de reunir en un
            solo lugar consolas, periféricos, sillas y juegos de mesa, con precios justos y una atención cercana.
          </p>
          <Link to="/productos" className="btn btn-info text-dark fw-bold px-4 mt-2">
            Ver catálogo
          </Link>
        </div>
        <div className="col-12 col-lg-5">
          <div className="row g-3 text-center">
            {[
              ['+5.000', 'Clientes'],
              ['16', 'Regiones'],
              ['20%', 'Dcto. Duoc'],
              ['24/7', 'Tienda online'],
            ].map(([numero, etiqueta]) => (
              <div className="col-6" key={etiqueta}>
                <div className="p-3" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '12px' }}>
                  <div className="fs-3 fw-bold" style={{ color: '#0ea5e9' }}>{numero}</div>
                  <small style={{ color: '#94a3b8' }}>{etiqueta}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Misión y visión */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <div className="h-100 p-4" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px' }}>
            <h4 className="fw-bold text-info"><i className="bi bi-bullseye me-2"></i>Misión</h4>
            <p className="mb-0" style={{ color: '#cbd5e1' }}>
              Ofrecer productos gamer de calidad con una experiencia de compra simple, segura y personalizada,
              premiando la fidelidad de nuestra comunidad.
            </p>
          </div>
        </div>
        <div className="col-12 col-md-6">
          <div className="h-100 p-4" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px' }}>
            <h4 className="fw-bold text-info"><i className="bi bi-eye me-2"></i>Visión</h4>
            <p className="mb-0" style={{ color: '#cbd5e1' }}>
              Ser la tienda online líder para gamers en Chile, reconocida por su comunidad, su servicio técnico
              y su programa de gamificación.
            </p>
          </div>
        </div>
      </div>

      {/* Valores */}
      <h3 className="fw-bold mb-4" style={{ color: '#ffffff' }}>Lo que nos mueve</h3>
      <div className="row g-4 mb-5">
        {VALORES.map((valor) => (
          <div className="col-12 col-md-4" key={valor.titulo}>
            <div className="h-100 p-4 text-center" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px' }}>
              <i className={`bi ${valor.icono} text-info`} style={{ fontSize: '2.5rem' }}></i>
              <h5 className="fw-bold mt-3" style={{ color: '#ffffff' }}>{valor.titulo}</h5>
              <p className="mb-0" style={{ color: '#94a3b8' }}>{valor.texto}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Equipo */}
      <h3 className="fw-bold mb-4" style={{ color: '#ffffff' }}>Nuestro equipo</h3>
      <div className="row g-4">
        {EQUIPO.map((nombre) => (
          <div className="col-12 col-md-4" key={nombre}>
            <div className="p-4 text-center" style={{ backgroundColor: '#121620', border: '1px solid #22293a', borderRadius: '14px' }}>
              <i className="bi bi-person-circle text-secondary" style={{ fontSize: '3rem' }}></i>
              <h5 className="fw-bold mt-2 mb-0" style={{ color: '#ffffff' }}>{nombre}</h5>
              <small style={{ color: '#94a3b8' }}>Desarrollador Fullstack</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
