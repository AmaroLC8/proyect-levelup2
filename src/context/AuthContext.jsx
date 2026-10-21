import React, { createContext, useContext, useState } from 'react';
import {
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  obtenerUsuarioPorCodigoReferido,
  crearUsuario,
  sumarPuntos,
  PUNTOS_POR_REFERIDO,
} from '../data/usuarios';

const AuthContext = createContext();
const SESION_KEY = 'levelup_sesion';

export const AuthProvider = ({ children }) => {
  // Solo se guarda el id en la sesión; los datos se leen siempre desde usuarios.js
  const [usuarioId, setUsuarioId] = useState(() => {
    const guardado = localStorage.getItem(SESION_KEY);
    return guardado ? Number(guardado) : null;
  });

  const usuario = usuarioId ? obtenerUsuarioPorId(usuarioId) ?? null : null;

  const abrirSesion = (id) => {
    localStorage.setItem(SESION_KEY, String(id));
    setUsuarioId(id);
  };

  // Retorna { ok, error, usuario } para que el formulario muestre el mensaje
  const iniciarSesion = (correo, password) => {
    const encontrado = obtenerUsuarioPorCorreo(correo);
    if (!encontrado || encontrado.password !== password) {
      return { ok: false, error: 'Correo o contraseña incorrectos' };
    }
    abrirSesion(encontrado.id);
    return { ok: true, usuario: encontrado };
  };

  const registrar = (datos) => {
    if (obtenerUsuarioPorCorreo(datos.correo)) {
      return { ok: false, error: 'Ya existe una cuenta registrada con ese correo' };
    }

    const referente = datos.codigoReferido ? obtenerUsuarioPorCodigoReferido(datos.codigoReferido) : null;
    if (datos.codigoReferido && !referente) {
      return { ok: false, error: 'El código de referido no existe' };
    }

    const { codigoReferido, ...datosUsuario } = datos;
    const nuevo = crearUsuario({ ...datosUsuario, referidoPor: codigoReferido || null });

    // Referido exitoso: ambos usuarios ganan puntos LevelUp (RF4)
    if (referente) {
      sumarPuntos(referente.id, PUNTOS_POR_REFERIDO);
      sumarPuntos(nuevo.id, PUNTOS_POR_REFERIDO);
    }

    abrirSesion(nuevo.id);
    return { ok: true, usuario: nuevo };
  };

  const cerrarSesion = () => {
    localStorage.removeItem(SESION_KEY);
    setUsuarioId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        esAdmin: usuario?.rol === 'admin',
        iniciarSesion,
        registrar,
        cerrarSesion,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
