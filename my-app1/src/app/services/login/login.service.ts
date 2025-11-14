import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth, AuthUser, UserRole } from '../auth/auth'; // chỉnh path cho khớp project

interface User {
  id: number;
  email: string;
  password: string;
  fullname: string;
  role: string;
  avatar: string;
  customerCode: string | null;
  tier?: string;
}

export interface UserProfile {
  fullname: string;
  email: string;
  avatar: string;
  role: string;
  customerCode: string | null;
  tier: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private usersUrl = 'assets/data/users.json';
  private profileKey = 'eco_profile';

  constructor(
    private http: HttpClient,
    private auth: Auth,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private loadUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(this.usersUrl).pipe(
      map(res => res.users)
    );
  }

  /**
   * LOGIN
   * - Check email/password
   * - Đăng nhập vào Auth (cho guard / quyền truy cập)
   * - Lưu profile chi tiết cho UI (header/account/checkout)
   * - Trả về UserProfile | null cho LoginComponent xử lý
   */
  login(email: string, password: string): Observable<UserProfile | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.loadUsers().pipe(
      map(users => {
        const user = users.find(
          u =>
            u.email.toLowerCase() === normalizedEmail &&
            u.password === password
        );

        if (!user) return null;

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: user.role as UserRole // đảm bảo users.json chỉ có 'admin' | 'customer'
        };

        const profile: UserProfile = {
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar ?? '/assets/images/avatars/default.png',
          role: user.role,
          customerCode: user.customerCode,
          tier: user.tier ?? 'EcoBasic'
        };

        if (this.isBrowser) {
          this.auth.login(authUser);
          localStorage.setItem(this.profileKey, JSON.stringify(profile));
        }

        return profile;
      })
    );
  }

  // Cho chỗ nào cần check login nhưng không muốn import Auth trực tiếp
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  // Profile chi tiết cho header / account / checkout
  getProfile(): UserProfile | null {
    if (!this.isBrowser) return null;
    const raw = localStorage.getItem(this.profileKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  }
  // Lấy thông tin user đang đăng nhập từ Auth
  // Cho các component (header, account, ...) dùng mà không cần import Auth
  getCurrentUser(): AuthUser | null {
    return this.auth.getCurrentUser();
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }

  isCustomer(): boolean {
    const user = this.auth.getCurrentUser();
    return user?.role === 'customer';
  }

  logout(): void {
    if (!this.isBrowser) return;
    this.auth.logout();
    localStorage.removeItem(this.profileKey);
  }
}
