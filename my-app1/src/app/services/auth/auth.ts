import { Injectable } from '@angular/core';

export type UserRole = 'admin' | 'customer';

export interface AuthUser {
  id?: number;
  email: string;
  fullname?: string;
  role: UserRole;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private storageKey = 'authUser'; // đổi key cho rõ ràng

  /** Lưu user sau khi đăng nhập thành công */
  login(user: AuthUser) {
    localStorage.setItem(this.storageKey, JSON.stringify(user));
  }

  /** Đăng xuất */
  logout() {
    localStorage.removeItem(this.storageKey);
  }

  /** Đang đăng nhập hay chưa */
  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.storageKey);
  }

  /** Lấy user hiện tại */
  getCurrentUser(): AuthUser | null {
    const raw = localStorage.getItem(this.storageKey);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }

  /** Có phải admin không */
  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }
}
