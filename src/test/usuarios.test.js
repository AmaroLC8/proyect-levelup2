import { describe, it, expect, beforeEach } from 'vitest';
import {
  obtenerUsuarios,
  obtenerUsuarioPorId,
  obtenerUsuarioPorCorreo,
  obtenerUsuarioPorCodigoReferido,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  sumarPuntos,
} from '../data/usuarios';

describe('Pruebas unitarias en data/usuarios.js (CRUD)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('carga el administrador y el cliente de prueba', () => {
    const usuarios = obtenerUsuarios();
    expect(usuarios).toHaveLength(2);
    expect(usuarios[0].rol).toBe('admin');
  });

  it('crearUsuario guarda el correo en minúsculas, activa el descuento Duoc y genera código de referido', () => {
    const nuevo = crearUsuario({
      nombre: 'María',
      apellidos: 'Soto',
      correo: '  Maria@DuocUC.cl ',
      password: 'maria1234',
      fechaNacimiento: '2001-03-15',
    });

    expect(nuevo.correo).toBe('maria@duocuc.cl');
    expect(nuevo.descuentoDuoc).toBe(true);
    expect(nuevo.rol).toBe('cliente');
    expect(nuevo.puntos).toBe(0);
    // El código usa solo letras sin tilde del nombre: "María" -> "MARA"
    expect(nuevo.codigoReferido).toMatch(/^LVLMARA\d{2}$/);
    expect(obtenerUsuarios()).toHaveLength(3);
  });

  it('busca usuarios por correo (sin importar mayúsculas) y por código de referido', () => {
    expect(obtenerUsuarioPorCorreo('PEDRO@duocuc.cl').id).toBe(2);
    expect(obtenerUsuarioPorCodigoReferido('lvlpedro').nombre).toBe('Pedro');
    expect(obtenerUsuarioPorCorreo('nadie@gmail.com')).toBeUndefined();
  });

  it('actualizarUsuario recalcula el descuento Duoc si cambia el correo', () => {
    actualizarUsuario(2, { correo: 'pedro@gmail.com' });

    const pedro = obtenerUsuarioPorId(2);
    expect(pedro.correo).toBe('pedro@gmail.com');
    expect(pedro.descuentoDuoc).toBe(false);
    expect(pedro.nombre).toBe('Pedro');
  });

  it('sumarPuntos acumula puntos LevelUp y eliminarUsuario quita la cuenta', () => {
    sumarPuntos(2, 50);
    expect(obtenerUsuarioPorId(2).puntos).toBe(150);

    eliminarUsuario(2);
    expect(obtenerUsuarioPorId(2)).toBeUndefined();
  });
});
