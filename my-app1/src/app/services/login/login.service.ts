import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private usersUrl = 'assets/data/users.json';

  constructor(private http: HttpClient) {}

  // Load toàn bộ user từ JSON
  private loadUsers(): Observable<User[]> {
    return this.http.get<{ users: User[] }>(this.usersUrl).pipe(
      map(res => res.users)
    );
  }

  // LOGIN
  login(email: string, password: string): Observable<User | null> {
    return this.loadUsers().pipe(
      map(users => {
        const user = users.find(
          u =>
            u.email.toLowerCase() === email.toLowerCase() &&
            u.password === password
        );

        if (!user) return null;

        const profile = {
          fullname: user.fullname,
          email: user.email,
          avatar: user.avatar ?? '/assets/images/avatars/default.png',
          role: user.role,                    // ⭐ Quan trọng để check admin
          customerCode: user.customerCode,
          tier: user.tier ?? 'EcoBasic'
        };

        localStorage.setItem('eco_profile', JSON.stringify(profile));

        return user;
      })
    );
  }

  // Kiểm tra đã đăng nhập chưa
  isLoggedIn(): boolean {
    return !!localStorage.getItem('eco_profile');
  }

  // Lấy user hiện tại
  getCurrentUser(): any {
    const raw = localStorage.getItem('eco_profile');
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  // ⭐ KIỂM TRA ADMIN
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'admin';
  }

  // ⭐ Nếu cần check khách hàng
  isCustomer(): boolean {
    const user = this.getCurrentUser();
    return user && user.role === 'customer';
  }

  // LOGOUT
  logout(): void {
    localStorage.removeItem('eco_profile');
  }
}
