import { Routes } from '@angular/router';

// === Import layouts ===
import { MainLayout } from './pages/main-layout/main-layout';

// === Import các trang người dùng ===
import { Homepage } from './pages/homepage/homepage';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// === Import các trang admin ===
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { AdminMain } from './pages/admin/admin-main/admin-main';
import { AdminOrder } from './pages/admin/admin-order/admin-order';
import { AdminBikeDetail } from './pages/admin/admin-bike-detail/admin-bike-detail';
import { AdminBike } from './pages/admin/admin-bike/admin-bike';

// ================== ROUTES ==================

export const routes: Routes = [
  // === CÁC TRANG XÁC THỰC (Không có Header/Footer) ===
  { path: 'login', component: Login },
  { path: 'register', component: Register },

  // === CÁC TRANG ADMIN (tạm chưa có layout riêng, sẽ thêm sau) ===
  {
    path: 'admin',
    component: AdminLayout,  // ✅ layout cố định
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: AdminMain },
      { path: 'bike', component: AdminBike },
      { path: 'bike-detail', component: AdminBikeDetail },
      { path: 'order', component: AdminOrder }
    ]
  },


  // === CÁC TRANG CHÍNH (người dùng - có Header/Footer) ===
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Homepage },
      // ví dụ: { path: 'about', component: About },
    ]
  },

  // === Fallback (nếu route không tồn tại) ===
  { path: '**', redirectTo: '' }
];
