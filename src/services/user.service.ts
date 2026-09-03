import { type User, type UserRequest } from '../models';
import { APP_CONFIG } from '../config/app.config';

export class UserService {
  private static readonly DATA_URL = APP_CONFIG.USERS_DATA_URL;

  /**
   * Obtiene todos los usuarios registrados desde la API.
   */
  static async getAllUsers(): Promise<User[]> {
    const response = await fetch(this.DATA_URL);
    if (!response.ok) {
      throw new Error(`Error HTTP al obtener usuarios: ${response.status} (${response.statusText})`);
    }

    const rawData = await response.json();
    if (!Array.isArray(rawData)) {
      throw new Error('La respuesta de usuarios no tiene un formato válido.');
    }

    return rawData.map((item: any): User => ({
      id: String(item.id),
      name: String(item.name || 'Sin nombre'),
      email: String(item.email || ''),
    }));
  }

  /**
   * Obtiene el usuario actual simulado en backend.
   */
  static async getCurrentUser(): Promise<User> {
    const response = await fetch(`${this.DATA_URL}/me`);
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo obtener el usuario actual.');
    }
    const item = await response.json();
    return {
      id: String(item.id),
      name: String(item.name),
      email: String(item.email),
    };
  }

  /**
   * Obtiene el detalle de un usuario por su ID.
   */
  static async getUserById(id: string): Promise<User> {
    const response = await fetch(`${this.DATA_URL}/${id}`);
    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'Usuario no encontrado.');
    }
    const item = await response.json();
    return {
      id: String(item.id),
      name: String(item.name),
      email: String(item.email),
    };
  }

  /**
   * Crea un nuevo usuario.
   */
  static async create(user: UserRequest): Promise<User> {
    const response = await fetch(this.DATA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo crear el usuario.');
    }

    const item = await response.json();
    return {
      id: String(item.id),
      name: String(item.name),
      email: String(item.email),
    };
  }

  /**
   * Actualiza los datos de un usuario existente.
   */
  static async update(id: string, user: UserRequest): Promise<User> {
    const response = await fetch(`${this.DATA_URL}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo actualizar el usuario.');
    }

    const item = await response.json();
    return {
      id: String(item.id),
      name: String(item.name),
      email: String(item.email),
    };
  }

  /**
   * Elimina un usuario por su ID.
   */
  static async delete(id: string): Promise<void> {
    const response = await fetch(`${this.DATA_URL}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'No se pudo eliminar el usuario.');
    }
  }
}
