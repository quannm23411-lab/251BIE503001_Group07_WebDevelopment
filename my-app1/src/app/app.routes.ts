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
      { path: 'bike-detail/:id', loadComponent: () => import('./pages/admin/admin-bike-detail/admin-bike-detail').then(m => m.AdminBikeDetail) },
      { path: 'bike-add', loadComponent: () => import('./pages/admin/admin-bike-add/admin-bike-add').then(m => m.AdminBikeAdd) },
      { path: 'order', loadComponent: () => import('./pages/admin/admin-order/admin-order').then(m => m.AdminOrder) },
      { path: 'order-add', loadComponent: () => import('./pages/admin/admin-order-add/admin-order-add').then(m => m.AdminOrderAdd) },
      { path: 'order-detail/:id', loadComponent: () => import('./pages/admin/admin-order-detail/admin-order-detail').then(m => m.AdminOrderDetail) },
      { path: 'customer', loadComponent: () => import('./pages/admin/admin-customer/admin-customer').then(m => m.AdminCustomer) },
      { path: 'customer-detail/:id', loadComponent: () => import('./pages/admin/admin-customer-detail/admin-customer-detail').then(m => m.AdminCustomerDetail) },
      { path: 'customer-add', loadComponent: () => import('./pages/admin/admin-customer-add/admin-customer-add').then(m => m.AdminCustomerAdd) },
      { path: '', redirectTo: 'main', pathMatch: 'full' }
    ]
  },

  // User layout + trang công khai
  {
    path: '',
    loadComponent: () => import('./pages/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      { path: '', loadComponent: () => import('./pages/homepage/homepage').then(m => m.Homepage) },

      // Danh sách thuê xe
      { path: 'rent', loadComponent: () => import('./pages/rent/rent').then(m => m.RentPage) },

      // Trang chi tiết sản phẩm: /rent/:id
      { path: 'rent/:id', loadComponent: () => import('./pages/product-detail/product-detail').then(m => m.ProductDetail) },

      // Khi nào có thì mở
      // { path: 'blog',  loadComponent: () => import('./pages/blog/blog').then(m => m.Blog) },
      // { path: 'offers', loadComponent: () => import('./pages/blog/blog-offers/blog-offers').then(m => m.BlogOffersComponent) }
      // BLOG
      {
        path: 'blog',
        loadComponent: () => import('./pages/blog/blog').then(m => m.Blog),
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'offers' }, // ← vào /blog tự tới Ưu đãi
          {
            path: 'offers',
            data: { breadcrumb: 'Ưu đãi' },                       // ← label breadcrumb
            loadComponent: () => import('./pages/blog/blog-offers/blog-offers').then(m => m.BlogOffersComponent),
          },
          {
            path: 'products',
            data: { breadcrumb: 'Sản phẩm mới' },
            loadComponent: () => import('./pages/blog/blog-products/blog-products').then(m => m.BlogProducts),
          },
          {
            path: 'news',
            data: { breadcrumb: 'Tin tức' },
            loadComponent: () => import('./pages/blog/blog-news/blog-news').then(m => m.BlogNews),
          },
        ],
      },
      // { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
    ]
  },

  { path: '**', redirectTo: '' }
];
