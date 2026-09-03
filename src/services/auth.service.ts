import { type AuthResponse, type LoginRequest, type RegisterRequest, type User } from '../models';
import { APP_CONFIG } from '../config/app.config';

export class AuthService {
  private static readonly AUTH_URL = APP_CONFIG.AUTH_DATA_URL;
  private static readonly TOKEN_KEY = 'encurso_token';
  private static readonly USER_KEY = 'encurso_user';
  private static listeners: Array<(user: User | null) => void> = [];

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getStoredUser(): User | null {
    const raw = localStorage.getItem(this.USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  static isAdmin(): boolean {
    const user = this.getStoredUser();
    return user?.role === 'ADMIN';
  }

  static subscribe(listener: (user: User | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static notify(user: User | null): void {
    this.listeners.forEach((listener) => listener(user));
  }

  static async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.AUTH_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'Error al registrar usuario.');
    }

    const data: AuthResponse = await response.json();
    this.setSession(data);
    return data;
  }

  static async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${this.AUTH_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => null);
      throw new Error(error?.message ?? 'Credenciales inválidas o error de conexión.');
    }

    const data: AuthResponse = await response.json();
    this.setSession(data);
    return data;
  }

  static async fetchCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${this.AUTH_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user: User = await response.json();
      localStorage.setItem(this.USER_KEY, JSON.stringify(user));
      this.notify(user);
      return user;
    } catch {
      return this.getStoredUser();
    }
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.notify(null);
  }

  private static setSession(authData: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authData.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authData.user));
    this.notify(authData.user);
  }
}
