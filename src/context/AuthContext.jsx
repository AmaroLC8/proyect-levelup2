import React, { createContext, useContext, useState, useEffect, startTransition } from 'react';
import { login, registro, obtenerSesion } from '../services/authService';
import { ROLES } from '../utils/roles';

// Estado global de la sesión. La sesión la entrega el backend con JWT:
// - "token": el JWT que api.js envía en cada petición (Authorization: Bearer <token>).
// - "usuario": los datos del usuario (sin contraseña), para mostrar su nombre y decidir qué ve según su rol.
// Ambos se guardan en localStorage para que la sesión siga abierta al recargar la página.

const AuthContext = createContext();
const TOKEN_KEY = 'token';
const USUARIO_KEY = 'usuario';

// Lee el usuario guardado. Si el texto está dañado, se considera que no hay sesión.
const leerUsuarioGuardado = () => {
  if (!localStorage.getItem(TOKEN_KEY)) return null;
  try {
    return JSON.parse(localStorage.getItem(USUARIO_KEY));
  } catch {
    return null;
  }
};

// Borra el token y el usuario guardados
const borrarSesionGuardada = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
};

export const AuthProvider = ({ children }) => {
  // Al recargar se usa de inmediato el usuario guardado (así no hay una pantalla de carga);
  // luego el useEffect de abajo confirma con el backend que el token sigue sirviendo.
  const [usuario, setUsuario] = useState(leerUsuarioGuardado);

  // Guarda los datos del usuario en el estado y en localStorage
  const guardarUsuario = (datos) => {
    localStorage.setItem(USUARIO_KEY, JSON.stringify(datos));
    setUsuario(datos);
  };

  // En transición para que se aplique junto con la navegación de React Router;
  // si no, al salir desde /admin la ruta protegida alcanza a redirigir a /login
  const cerrarSesion = () => {
    borrarSesionGuardada();
    startTransition(() => setUsuario(null));
  };

  // Al abrir la app: si hay un token guardado, se valida con GET /auth/me.
  // - Responde bien → se actualizan los datos (ej: puntos o rol cambiados por el admin).
  // - Responde 401 (token vencido o inválido) → se cierra la sesión.
  // - El backend no responde → se mantiene la sesión guardada; las páginas mostrarán su propio error.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    obtenerSesion()
      .then((datos) => {
        // Si el usuario cerró sesión mientras se esperaba la respuesta, no se vuelve a abrir
        if (!localStorage.getItem(TOKEN_KEY)) return;
        localStorage.setItem(USUARIO_KEY, JSON.stringify(datos));
        setUsuario(datos);
      })
      .catch((err) => {
        if (err.status === 401) {
          borrarSesionGuardada();
          setUsuario(null);
        }
      });
  }, []);

  /**
   * POST /auth/login. Guarda el token y el usuario, y devuelve el usuario
   * (Login.jsx lo usa para redirigir según el rol).
   * Si el backend responde con error (401 credenciales incorrectas) lanza el Error para que el formulario lo muestre.
   */
  const iniciarSesion = async (correo, password) => {
    const respuesta = await login(correo.trim(), password);
    localStorage.setItem(TOKEN_KEY, respuesta.token);
    guardarUsuario(respuesta.usuario);
    return respuesta.usuario;
  };

  /**
   * POST /auth/registro y luego login automático (el registro del backend no entrega token).
   * Errores posibles (los lanza para que Registro.jsx los muestre): correo repetido (409),
   * menor de edad o código de referido inexistente (400).
   */
  const registrarse = async (datos) => {
    await registro(datos);
    return iniciarSesion(datos.correo, datos.password);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        // Helpers de rol: el backend envía el rol en mayúsculas
        esAdmin: usuario?.rol === ROLES.ADMIN,
        esVendedor: usuario?.rol === ROLES.VENDEDOR,
        esCliente: usuario?.rol === ROLES.CLIENTE,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        // Después de editar el perfil, para que la Navbar muestre el nombre nuevo
        actualizarUsuarioSesion: guardarUsuario,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
