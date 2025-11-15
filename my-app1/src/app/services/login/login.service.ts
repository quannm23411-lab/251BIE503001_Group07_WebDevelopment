import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, of } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Auth, AuthUser, UserRole } from '../auth/auth'; // chỉnh path nếu khác

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

interface Customer {
  maKhachHang: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  ngaySinh?: string;
  diaChi?: {
    soNhaDuong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };
  thongTinBangLai?: {
    soBangLai: string;
    hangBangLai: string;
    ngayHetHan: string;
  };
  hangThanhVien?: string;
}

export interface UserProfile {
  fullname: string;
  email: string;
  avatar: string;
  role: string;
  customerCode: string | null;
  tier: string;
  phone?: string;
  driverLicense?: string;
  address?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private usersUrl = 'assets/data/users.json';
  private customersUrl = 'assets/data/customers.json';
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

  private loadCustomers(): Observable<Customer[]> {
    return this.http.get<Customer[]>(this.customersUrl);
  }

  /**
   * LOGIN
   * - Check email/password từ users.json
   * - Join data với customers.json (phone, license, address, tier)
   * - Đăng nhập qua Auth + lưu eco_profile
   * - Trả về UserProfile | null
   */
  login(email: string, password: string): Observable<UserProfile | null> {
    const normalizedEmail = email.trim().toLowerCase();

    return this.loadUsers().pipe(
      switchMap(users => {
        const user = users.find(
          u =>
            u.email.toLowerCase() === normalizedEmail &&
            u.password === password
        );

        if (!user) {
          return of(null);
        }

        const authUser: AuthUser = {
          id: user.id,
          email: user.email,
          fullname: user.fullname,
          role: (user.role || '').toLowerCase() as UserRole
        };

        // base profile chỉ từ users.json
        let profile: UserProfile = {
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar ?? '/assets/images/avatars/default.png',
          role: user.role,
          customerCode: user.customerCode,
          tier: user.tier ?? 'EcoBasic'
        };

        // Nếu không có customerCode thì khỏi join, lưu luôn
        if (!user.customerCode) {
          if (this.isBrowser) {
            this.auth.login(authUser);
            localStorage.setItem(this.profileKey, JSON.stringify(profile));
          }
          return of(profile);
        }

        // Có customerCode → join với customers.json
        return this.loadCustomers().pipe(
          map(customers => {
            const customer = customers.find(
              c =>
                c.maKhachHang === user.customerCode ||
                c.email?.toLowerCase() === user.email.toLowerCase()
            );

            if (customer) {
              profile = {
                ...profile,
                phone: customer.soDienThoai,
                driverLicense: customer.thongTinBangLai?.soBangLai,
                address: customer.diaChi
                  ? `${customer.diaChi.soNhaDuong}, ${customer.diaChi.phuongXa}, ${customer.diaChi.quanHuyen}, ${customer.diaChi.tinhThanh}`
                  : undefined,
                tier: customer.hangThanhVien || profile.tier
              };
            }

            if (this.isBrowser) {
              this.auth.login(authUser);
              localStorage.setItem(this.profileKey, JSON.stringify(profile));
            }

            return profile;
          })
        );
      })
    );
  }

  // Check login: dùng Auth
  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  // Profile chi tiết cho UI (header / checkout / account)
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

  // Cho code cũ (header.ts) vẫn gọi được
  getCurrentUser(): UserProfile | null {
    return this.getProfile();
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
