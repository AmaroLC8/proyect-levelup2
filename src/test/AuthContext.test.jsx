import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { obtenerUsuarioPorCodigoReferido } from '../data/usuarios';

// Monta solo el Provider para probar el hook useAuth sin ninguna página
const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

const datosRegistro = {
  nombre: 'María',
  apellidos: 'Soto',
  correo: 'maria@gmail.com',
  fechaNacimiento: '2000-01-01',
  password: 'maria1234',
  codigoReferido: '',
};

describe('Pruebas del estado global de sesión (AuthContext)', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('comienza sin usuario cuando no hay sesión guardada', () => {
    const { result } = renderAuth();

    expect(result.current.usuario).toBeNull();
    expect(result.current.esAdmin).toBe(false);
  });

  it('recupera la sesión guardada en localStorage al recargar la página', () => {
    localStorage.setItem('levelup_sesion', '2');
    const { result } = renderAuth();

    expect(result.current.usuario.nombre).toBe('Pedro');
  });

  it('iniciarSesion con credenciales correctas abre la sesión y detecta al administrador', () => {
    const { result } = renderAuth();

    let respuesta;
    act(() => {
      respuesta = result.current.iniciarSesion('ADMIN@levelup.cl', 'admin1234');
    });

    expect(respuesta.ok).toBe(true);
    expect(result.current.usuario.correo).toBe('admin@levelup.cl');
    expect(result.current.esAdmin).toBe(true);
    expect(localStorage.getItem('levelup_sesion')).toBe('1');
  });

  it('iniciarSesion con contraseña incorrecta devuelve un error y no abre sesión', () => {
    const { result } = renderAuth();

    let respuesta;
    act(() => {
      respuesta = result.current.iniciarSesion('admin@levelup.cl', 'clave-mala1');
    });

    expect(respuesta).toEqual({ ok: false, error: 'Correo o contraseña incorrectos' });
    expect(result.current.usuario).toBeNull();
  });

  it('registrar rechaza correos ya usados y códigos de referido inexistentes', () => {
    const { result } = renderAuth();

    let repetido;
    let referidoMalo;
    act(() => {
      repetido = result.current.registrar({ ...datosRegistro, correo: 'pedro@duocuc.cl' });
      referidoMalo = result.current.registrar({ ...datosRegistro, codigoReferido: 'NOEXISTE' });
    });

    expect(repetido.error).toMatch(/ya existe una cuenta/i);
    expect(referidoMalo.error).toMatch(/código de referido no existe/i);
    expect(result.current.usuario).toBeNull();
  });

  it('registrar con código de referido da puntos a ambos usuarios y abre la sesión (RF4)', () => {
    const { result } = renderAuth();

    act(() => {
      result.current.registrar({ ...datosRegistro, codigoReferido: 'lvlpedro' });
    });

    expect(result.current.usuario.nombre).toBe('María');
    expect(result.current.usuario.puntos).toBe(100);
    expect(obtenerUsuarioPorCodigoReferido('LVLPEDRO').puntos).toBe(200);
  });

  it('cerrarSesion borra el usuario y la sesión guardada', () => {
    localStorage.setItem('levelup_sesion', '2');
    const { result } = renderAuth();

    act(() => {
      result.current.cerrarSesion();
    });

    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('levelup_sesion')).toBeNull();
  });
});
