import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  id?: number;
  email: string;
  fullname?: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private storageKey = 'authUser';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) { }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  login(user: AuthUser) {
    if (!this.isBrowser) return;
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  logout() {
    if (!this.isBrowser) return;
    localStorage.removeItem(this.storageKey);
  }

  isLoggedIn(): boolean {
    if (!this.isBrowser) return false;
    return !!localStorage.getItem(this.storageKey);
  }

  getCurrentUser(): AuthUser | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
