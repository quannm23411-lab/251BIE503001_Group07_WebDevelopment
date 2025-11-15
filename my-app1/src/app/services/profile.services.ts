import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs'; // <-- Đã sửa đường dẫn

// --- 1. ĐỊNH NGHĨA KHUÔN MẪU PROFILE ---
export interface Profile {
  customerCode?: string;
  fullname: string;
  email: string;
  avatar: string;
  tier: string;
  password?: string;
  phone?: string;
  dob?: string; // Ngày sinh
  address?: {
    soNhaDuong: string;
    phuongXa: string;
    quanHuyen: string;
    tinhThanh: string;
  };
  driverLicense?: {
    soBangLai: string;
    hangBangLai: string;
    ngayHetHan: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private http = inject(HttpClient);

  // --- 2. HÀM TẢI PROFILE CHUYÊN DỤNG ---
  loadProfile(): Observable<Profile> {
    const baseProfile = this.getBaseProfileFromLocal();
    const customers$ = this.http.get<any[]>('assets/data/customers.json').pipe(catchError(() => of([])));
    const users$ = this.http.get<any>('assets/data/users.json').pipe(catchError(() => of(null))); 

    return forkJoin({
      customers: customers$,
      usersData: users$
    }).pipe(
      map(({ customers, usersData }) => {
        let mergedProfile: Profile = { ...baseProfile };

        // Hợp nhất customers.json
        if (mergedProfile.customerCode) {
          const customerData = customers.find(c => c.maKhachHang === mergedProfile.customerCode);
          if (customerData) {
            mergedProfile.fullname = customerData.hoTen || mergedProfile.fullname;
            mergedProfile.phone = customerData.soDienThoai;
            mergedProfile.dob = customerData.ngaySinh;
            mergedProfile.address = customerData.diaChi;
            mergedProfile.driverLicense = customerData.thongTinBangLai;
            mergedProfile.tier = customerData.hangThanhVien || mergedProfile.tier;
          }
        }
        
        // Hợp nhất users.json
        if (usersData && mergedProfile.email) {
          let usersList: any[] = [];
          if (Array.isArray(usersData)) {
            usersList = usersData;
          } else if (usersData.users && Array.isArray(usersData.users)) {
            usersList = usersData.users; 
          }

          if (!mergedProfile.password) {
             const userData = usersList.find(u => u.email && u.email.toLowerCase() === mergedProfile.email.toLowerCase());
             if (userData) {
               mergedProfile.password = userData.password;
             }
          }
        }
        
        return mergedProfile;
      })
    );
  }

  // --- 3. HÀM LƯU PROFILE CHUYÊN DỤNG ---
  saveProfile(profileData: Profile): void {
    localStorage.setItem('eco_profile', JSON.stringify(profileData));
  }
  
  private getBaseProfileFromLocal(): {
    customerCode?: string;
    fullname: string;
    email: string;
    avatar: string;
    tier: string;
    password?: string;
  } {
    const raw = localStorage.getItem('eco_profile');
    if (raw) {
      try {
        const profile = JSON.parse(raw);
        return {
          customerCode: profile.customerCode,
          fullname: profile.fullname || 'Khách EcoMove',
          email: profile.email || '',
          avatar: profile.avatar || '/assets/images/avatars/default.png',
          tier: profile.tier || 'EcoBasic',
          password: profile.password 
        };
      } catch { /* Bỏ qua */ }
    }
    return {
      fullname: 'Khách EcoMove',
      email: '',
      avatar: '/assets/images/avatars/default.png',
      tier: 'EcoBasic'
    };
  }
}