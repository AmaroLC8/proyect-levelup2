import { describe, it, expect } from 'vitest';
import {
  esCorreoValido,
  esCorreoDuoc,
  esPasswordSegura,
  calcularEdad,
  esMayorDeEdad,
  esNombreValido,
  validarNombreCompleto,
  validarRegistro,
} from '../utils/validaciones';

// Datos de un registro correcto; cada prueba cambia solo el campo que quiere revisar
const registroValido = {
  nombre: 'Ana',
  apellidos: 'Soto',
  correo: 'ana@gmail.com',
  fechaNacimiento: '2000-05-10',
  password: 'ana12345',
  confirmarPassword: 'ana12345',
};

describe('Pruebas unitarias en utils/validaciones.js', () => {
  it('esCorreoValido acepta correos con dominio y rechaza formatos incompletos', () => {
    expect(esCorreoValido('ana@gmail.com')).toBe(true);
    expect(esCorreoValido('a@b')).toBe(false);
    expect(esCorreoValido('ana.gmail.com')).toBe(false);
    expect(esCorreoValido('ana @gmail.com')).toBe(false);
  });

  it('esCorreoDuoc reconoce @duoc.cl y @duocuc.cl sin importar mayúsculas', () => {
    expect(esCorreoDuoc('alumno@duocuc.cl')).toBe(true);
    expect(esCorreoDuoc('PROFE@DUOC.CL')).toBe(true);
    expect(esCorreoDuoc('alumno@gmail.com')).toBe(false);
    expect(esCorreoDuoc('duoc.cl@gmail.com')).toBe(false);
  });

  it('esPasswordSegura exige 8 caracteres combinando letras y números (ERS 3.3.2)', () => {
    expect(esPasswordSegura('abc12345')).toBe(true);
    expect(esPasswordSegura('abc123')).toBe(false);
    expect(esPasswordSegura('abcdefgh')).toBe(false);
    expect(esPasswordSegura('12345678')).toBe(false);
  });

  it('esNombreValido acepta letras con tildes, ñ y nombres compuestos', () => {
    ['Ana', 'María José', 'Muñoz', 'Pérez-Cotapos', "O'Higgins", '  Lukas  '].forEach((nombre) =>
      expect(esNombreValido(nombre)).toBe(true)
    );
  });

  it('esNombreValido rechaza arrobas, números, símbolos y nombres de una sola letra', () => {
    ['J@ime', 'Ana1', 'Soto#', 'ana@gmail.com', 'A', 'María  José', '-Ana', 'x'.repeat(51)].forEach((nombre) =>
      expect(esNombreValido(nombre)).toBe(false)
    );
  });

  it('validarNombreCompleto devuelve el primer error encontrado o null', () => {
    expect(validarNombreCompleto('Ana', 'Soto')).toBeNull();
    expect(validarNombreCompleto('', 'Soto')).toBe('Nombre y apellidos son obligatorios');
    expect(validarNombreCompleto('An@', 'Soto')).toMatch(/^El nombre solo puede tener letras/);
    expect(validarNombreCompleto('Ana', 'S0to')).toMatch(/^El apellido solo puede tener letras/);
  });

  it('calcularEdad no suma el año si todavía no es el cumpleaños', () => {
    const hoy = new Date('2026-10-21T12:00:00');
    expect(calcularEdad('2008-10-21', hoy)).toBe(18);
    expect(calcularEdad('2008-10-22', hoy)).toBe(17);
    expect(calcularEdad('2008-11-01', hoy)).toBe(17);
  });

  it('esMayorDeEdad distingue adultos de menores', () => {
    expect(esMayorDeEdad('1990-01-01')).toBe(true);
    expect(esMayorDeEdad('2020-01-01')).toBe(false);
  });

  it('validarRegistro no devuelve errores con datos correctos', () => {
    expect(validarRegistro(registroValido)).toEqual({});
  });

  it('validarRegistro marca cada campo obligatorio vacío', () => {
    const errores = validarRegistro({
      ...registroValido,
      nombre: ' ',
      apellidos: '',
      fechaNacimiento: '',
    });
    expect(Object.keys(errores)).toEqual(['nombre', 'apellidos', 'fechaNacimiento']);
  });

  it('validarRegistro rechaza nombres y apellidos con caracteres que no son letras', () => {
    const errores = validarRegistro({ ...registroValido, nombre: 'An@', apellidos: 'Soto123' });
    expect(errores.nombre).toMatch(/solo puede tener letras/);
    expect(errores.apellidos).toMatch(/solo puede tener letras/);
  });

  it('validarRegistro rechaza menores de edad, contraseñas débiles y contraseñas distintas', () => {
    const errores = validarRegistro({
      ...registroValido,
      fechaNacimiento: '2015-01-01',
      password: 'abc',
      confirmarPassword: 'otra',
    });
    expect(errores.fechaNacimiento).toMatch(/mayor de 18/);
    expect(errores.password).toMatch(/8 caracteres/);
    expect(errores.confirmarPassword).toMatch(/no coinciden/);
  });
});
