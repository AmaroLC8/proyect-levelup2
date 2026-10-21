import { esCorreoDuoc } from '../utils/validaciones';

// Contraseñas en texto plano solo porque es una simulación sin backend
const USUARIOS_INICIALES = [
  {
    id: 1,
    nombre: "Admin",
    apellidos: "Level-Up",
    correo: "admin@levelup.cl",
    password: "admin1234",
    fechaNacimiento: "1995-05-10",
    rol: "admin",
    descuentoDuoc: false,
    puntos: 0,
    codigoReferido: "LVLADMIN",
  },
  {
    id: 2,
    nombre: "Pedro",
    apellidos: "Hacker",
    correo: "pedro@duocuc.cl",
    password: "pedro1234",
    fechaNacimiento: "2002-08-20",
    rol: "cliente",
    descuentoDuoc: true,
    puntos: 100,
    codigoReferido: "LVLPEDRO",
  },
];

const STORAGE_KEY = "levelup_usuarios";

// Puntos LevelUp que ganan ambos usuarios por un referido exitoso (RF4)
export const PUNTOS_POR_REFERIDO = 100;

const inicializarStorage = () => {
  const guardados = localStorage.getItem(STORAGE_KEY);
  if (!guardados) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(USUARIOS_INICIALES));
    return USUARIOS_INICIALES;
  }
  return JSON.parse(guardados);
};

const guardarUsuarios = (usuarios) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
};

// Código único que el usuario comparte para referir amigos, ej: LVLMARIA42
const generarCodigoReferido = (nombre) =>
  `LVL${nombre.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 5)}${Math.floor(Math.random() * 90 + 10)}`;

export const obtenerUsuarios = () => inicializarStorage();

export const obtenerUsuarioPorId = (id) => {
  const usuarios = obtenerUsuarios();
  return usuarios.find((u) => u.id === Number(id));
};

export const obtenerUsuarioPorCorreo = (correo) => {
  const usuarios = obtenerUsuarios();
  return usuarios.find((u) => u.correo.toLowerCase() === correo.trim().toLowerCase());
};

export const obtenerUsuarioPorCodigoReferido = (codigo) => {
  const usuarios = obtenerUsuarios();
  return usuarios.find((u) => u.codigoReferido === codigo.trim().toUpperCase());
};

export const crearUsuario = (nuevoUsuario) => {
  const usuarios = obtenerUsuarios();
  const usuarioConId = {
    rol: "cliente",
    puntos: 0,
    ...nuevoUsuario,
    id: Date.now(),
    correo: nuevoUsuario.correo.trim().toLowerCase(),
    descuentoDuoc: esCorreoDuoc(nuevoUsuario.correo),
    codigoReferido: generarCodigoReferido(nuevoUsuario.nombre),
  };
  guardarUsuarios([...usuarios, usuarioConId]);
  return usuarioConId;
};

export const actualizarUsuario = (id, datosActualizados) => {
  const usuarios = obtenerUsuarios();
  const listaActualizada = usuarios.map((u) =>
    u.id === Number(id)
      ? {
          ...u,
          ...datosActualizados,
          id: Number(id),
          descuentoDuoc: esCorreoDuoc(datosActualizados.correo ?? u.correo),
        }
      : u
  );
  guardarUsuarios(listaActualizada);
  return true;
};

export const eliminarUsuario = (id) => {
  const usuarios = obtenerUsuarios();
  guardarUsuarios(usuarios.filter((u) => u.id !== Number(id)));
  return true;
};

export const sumarPuntos = (id, puntos) => {
  const usuario = obtenerUsuarioPorId(id);
  if (usuario) actualizarUsuario(id, { puntos: (usuario.puntos || 0) + puntos });
};
