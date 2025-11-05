import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from './services/auth/auth';

// === Layouts ===
import { MainLayout } from './pages/main-layout/main-layout';

// === User pages ===
import { Homepage } from './pages/homepage/homepage';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';

// === Admin pages ===
import { AdminLayout } from './pages/admin/admin-layout/admin-layout';
import { AdminMain } from './pages/admin/admin-main/admin-main';
import { AdminOrder } from './pages/admin/admin-order/admin-order';
import { AdminBikeDetail } from './pages/admin/admin-bike-detail/admin-bike-detail';
import { AdminBike } from './pages/admin/admin-bike/admin-bike';

/* ====== 1. HÀM KIỂM TRA ADMIN ====== */
const requireAdmin = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  // Nếu chưa đăng nhập
  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  // Nếu không phải admin
  if (!auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

/* ====== 2. Chặn user đã login vào login/register ====== */
const redirectIfLoggedIn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  if (auth.isLoggedIn()) {
    router.navigate(['/']);
    return false;
  }
  return true;
};

/* ====== 3. ROUTE CẤU HÌNH ====== */
export const routes: Routes = [
  // ==== Auth ====
  { path: 'login', component: Login, canActivate: [redirectIfLoggedIn] },
  { path: 'register', component: Register, canActivate: [redirectIfLoggedIn] },

  // ==== ADMIN (chặn cả con) ====
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [requireAdmin],         // chặn route cha
    canActivateChild: [requireAdmin],    // ✅ chặn tất cả route con
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main', component: AdminMain },
      { path: 'bike', component: AdminBike },
      { path: 'bike-detail', component: AdminBikeDetail },
      { path: 'order', component: AdminOrder }
    ]
  },

  // ==== PUBLIC ====
  {
    path: '',
    component: MainLayout,
    children: [
      { path: '', component: Homepage },
    ]
  },

  { path: '**', redirectTo: '' }
];
