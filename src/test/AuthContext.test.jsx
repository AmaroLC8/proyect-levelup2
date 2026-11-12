import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { login, registro } from '../services/authService';
import { simularAuth, simularSesion, ADMIN, VENDEDOR, PEDRO } from './sesionSimulada';

// authService se reemplaza por funciones simuladas: no se llama al backend real
vi.mock('../services/authService');

// Monta solo el Provider para probar el hook useAuth sin ninguna página
const renderAuth = () => renderHook(() => useAuth(), { wrapper: AuthProvider });

const datosRegistro = {
  nombre: 'María',
  apellidos: 'Soto',
  correo: 'maria@gmail.com',
  fechaNacimiento: '2000-01-01',
  password: 'maria1234',
  codigoReferido: null,
};

describe('Pruebas del estado global de sesión (AuthContext)', () => {
  let db; // usuarios del backend simulado

  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    db = simularAuth();
  });

  it('comienza sin usuario cuando no hay sesión guardada', () => {
    const { result } = renderAuth();

    expect(result.current.usuario).toBeNull();
    expect(result.current.esAdmin).toBe(false);
    expect(result.current.esVendedor).toBe(false);
  });

  it('iniciarSesion guarda el token y el usuario, y detecta el rol ADMIN', async () => {
    const { result } = renderAuth();

    let usuario;
    await act(async () => {
      usuario = await result.current.iniciarSesion('admin@levelup.cl', 'admin1234');
    });

    expect(login).toHaveBeenCalledWith('admin@levelup.cl', 'admin1234');
    expect(usuario.rol).toBe('ADMIN');
    expect(result.current.esAdmin).toBe(true);
    expect(localStorage.getItem('token')).toBe('token-1');
    expect(JSON.parse(localStorage.getItem('usuario')).correo).toBe('admin@levelup.cl');
  });

  it('esVendedor y esCliente según el rol que envía el backend', async () => {
    const { result } = renderAuth();

    await act(async () => {
      await result.current.iniciarSesion('vendedor@levelup.cl', 'vendedor1234');
    });
    expect(result.current.esVendedor).toBe(true);
    expect(result.current.esAdmin).toBe(false);

    await act(async () => {
      await result.current.iniciarSesion('pedro@duocuc.cl', 'pedro1234');
    });
    expect(result.current.esCliente).toBe(true);
  });

  it('iniciarSesion con contraseña incorrecta lanza el error del backend y no abre sesión', async () => {
    const { result } = renderAuth();

    await expect(
      act(() => result.current.iniciarSesion('admin@levelup.cl', 'clave-mala1'))
    ).rejects.toThrow('Correo o contraseña incorrectos');

    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('recupera la sesión guardada y la confirma con /auth/me', async () => {
    simularSesion(PEDRO);
    db.usuarios.find((u) => u.id === PEDRO.id).puntos = 300; // cambió en el backend

    const { result } = renderAuth();
    // Primero se muestra el usuario guardado...
    expect(result.current.usuario.nombre).toBe('Pedro');
    // ...y luego se actualiza con la respuesta de /auth/me
    await waitFor(() => expect(result.current.usuario.puntos).toBe(300));
  });

  it('si /auth/me responde 401 (token vencido), cierra la sesión', async () => {
    localStorage.setItem('token', 'token-vencido');
    localStorage.setItem('usuario', JSON.stringify(ADMIN));

    const { result } = renderAuth();

    await waitFor(() => expect(result.current.usuario).toBeNull());
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });

  it('registrarse crea la cuenta y abre la sesión con login automático', async () => {
    const { result } = renderAuth();

    await act(async () => {
      await result.current.registrarse({ ...datosRegistro, codigoReferido: 'lvlpedro' });
    });

    expect(registro).toHaveBeenCalled();
    expect(login).toHaveBeenCalledWith('maria@gmail.com', 'maria1234');
    expect(result.current.usuario).toMatchObject({ nombre: 'María', rol: 'CLIENTE', puntos: 100 });
    expect(db.usuarios.find((u) => u.correo === 'pedro@duocuc.cl').puntos).toBe(200);
  });

  it('registrarse con correo repetido lanza el error del backend', async () => {
    const { result } = renderAuth();

    await expect(
      act(() => result.current.registrarse({ ...datosRegistro, correo: 'pedro@duocuc.cl' }))
    ).rejects.toThrow(/ya existe un usuario registrado/i);
    expect(result.current.usuario).toBeNull();
  });

  it('cerrarSesion borra el usuario, el token y los datos guardados', () => {
    simularSesion(VENDEDOR);
    const { result } = renderAuth();

    act(() => {
      result.current.cerrarSesion();
    });

    expect(result.current.usuario).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('usuario')).toBeNull();
  });
});
