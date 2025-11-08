import { Routes, Router } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Auth } from './services/auth/auth';

// Guard admin an toàn cho SSR
const requireAdmin = () => {
  const router = inject(Router);
  const auth = inject(Auth);
  const platformId = inject(PLATFORM_ID);
  const isBrowser = isPlatformBrowser(platformId);
  if (!isBrowser) return true;

  if (!auth.isLoggedIn()) { router.navigate(['/login']); return false; }
  if (!auth.isAdmin()) { router.navigate(['/']); return false; }
  return true;
};

export const routes: Routes = [
  // Auth
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },

  // Admin
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [requireAdmin],
    canActivateChild: [requireAdmin],
    children: [
      { path: 'main', loadComponent: () => import('./pages/admin/admin-main/admin-main').then(m => m.AdminMain) },
      { path: 'bike', loadComponent: () => import('./pages/admin/admin-bike/admin-bike').then(m => m.AdminBike) },
      { path: 'order', loadComponent: () => import('./pages/admin/admin-order/admin-order').then(m => m.AdminOrder) },
      { path: 'customer', loadComponent: () => import('./pages/admin/admin-customer/admin-customer').then(m => m.AdminCustomer) },
      { path: '', redirectTo: 'main', pathMatch: 'full' }
    ]
  },

  // User layout + homepage (chỉ mở route có thật)
  {
    path: '',
    loadComponent: () => import('./pages/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/homepage/homepage').then(m => m.Homepage) },

      // Khi nào tạo thư mục thì bỏ comment ba dòng dưới và đảm bảo đường dẫn đúng:
      // { path: 'rent',  loadComponent: () => import('./pages/rent/rent').then(m => m.Rent) },
      // { path: 'blog',  loadComponent: () => import('./pages/blog/blog').then(m => m.Blog) },
      // { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
    ]
  },

  { path: '**', redirectTo: '' }
];
