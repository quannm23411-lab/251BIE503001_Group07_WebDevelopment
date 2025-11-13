import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { map, catchError, throwError, switchMap } from 'rxjs';
import { Auth, AuthUser } from '../auth/auth';

interface User extends AuthUser {
  password: string;
  avatar?: string;
  customerCode?: string;
}

interface Customer {
  maKhachHang: string;
  hoTen: string;
  email: string;
  soDienThoai: string;
  ngaySinh: string;
  diaChi: {
    soNhaDuong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };
  thongTinBangLai: {
    soBangLai: string;
    hangBangLai: string;
    ngayHetHan: string;
  };
  ngayDangKy: string;
  hangThanhVien: string;
}

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private auth = inject(Auth);

  private usersUrl = 'assets/data/users.json';
  private customersUrl = 'assets/data/customers.json';
  private profileStorageKey = 'eco_profile';

  login(email: string, password: string) {
    return this.http.get<{ users: User[] }>(this.usersUrl).pipe(
      // tìm user trong users.json
      map(res => {
        const found = res.users.find(
          u => u.email === email && u.password === password
        );
        if (!found) {
          throw new Error('Sai email hoặc mật khẩu');
        }
        return found;
      }),
      // sau khi có user, tìm thêm thông tin khách trong customers.json
      switchMap(found => {
        const { password: plainPassword, ...safe } = found;

        return this.http.get<Customer[]>(this.customersUrl).pipe(
          map(customers => {
            const customer = customers.find(c => c.email === safe.email) || null;

            // map hạng thành viên sang tier
            let tier: 'EcoGold' | 'EcoSilver' | 'EcoBasic' = 'EcoBasic';
            if (customer?.hangThanhVien === 'Vàng') tier = 'EcoGold';
            else if (customer?.hangThanhVien === 'Bạc') tier = 'EcoSilver';

            const profile = {
              avatar:
                found.avatar ||
                '/assets/images/avatar/default.png',
              fullname:
                safe.fullname ||
                customer?.hoTen ||
                'Khách EcoMove',
              email: safe.email,
              password: plainPassword, // chỉ cho bản mock UI
              tier,
              customerCode:
                found.customerCode || customer?.maKhachHang || null,
              phone: customer?.soDienThoai || '',
              birthdate: customer?.ngaySinh || '',
              address: customer
                ? `${customer.diaChi.soNhaDuong}, ${customer.diaChi.phuongXa}, ${customer.diaChi.quanHuyen}, ${customer.diaChi.tinhThanh}`
                : ''
            };

            // lưu profile chi tiết cho các trang Account
            if (typeof localStorage !== 'undefined') {
              localStorage.setItem(
                this.profileStorageKey,
                JSON.stringify(profile)
              );
            }

            // lưu thông tin đơn giản cho Auth
            const authUser: AuthUser = {
              id: safe.id,
              email: safe.email,
              fullname: profile.fullname,
              role: safe.role
            };
            this.auth.login(authUser);

            return authUser;
          })
        );
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }

  getUser() {
    return this.auth.getCurrentUser();
  }

  isLoggedIn() {
    return this.auth.isLoggedIn();
  }

  isAdmin() {
    return this.auth.isAdmin();
  }
}
