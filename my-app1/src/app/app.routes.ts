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

  // Khi render phía server thì cho qua, không redirect gì hết
  if (!isBrowser) return true;

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  if (!auth.isAdmin()) {
    router.navigate(['/']);
    return false;
  }

  return true;
};

export const routes: Routes = [
  // Auth
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login').then(m => m.Login),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register').then(m => m.Register),
  },

  // Admin
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-layout/admin-layout').then(
        m => m.AdminLayout
      ),
    canActivate: [requireAdmin],
    canActivateChild: [requireAdmin],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/admin-dashboard/admin-dashboard').then(
            m => m.AdminDashboard
          ),
      },
      {
        path: 'bike',
        loadComponent: () =>
          import('./pages/admin/admin-bike/admin-bike').then(
            m => m.AdminBike
          ),
      },
      {
        path: 'bike-detail/:id',
        loadComponent: () =>
          import('./pages/admin/admin-bike-detail/admin-bike-detail').then(
            m => m.AdminBikeDetail
          ),
      },
      {
        path: 'bike-add',
        loadComponent: () =>
          import('./pages/admin/admin-bike-add/admin-bike-add').then(
            m => m.AdminBikeAdd
          ),
      },
      {
        path: 'order',
        loadComponent: () =>
          import('./pages/admin/admin-order/admin-order').then(
            m => m.AdminOrder
          ),
      },
      {
        path: 'order-add',
        loadComponent: () =>
          import('./pages/admin/admin-order-add/admin-order-add').then(
            m => m.AdminOrderAdd
          ),
      },
      {
        path: 'order-detail/:id',
        loadComponent: () =>
          import('./pages/admin/admin-order-detail/admin-order-detail').then(
            m => m.AdminOrderDetail
          ),
      },
      {
        path: 'customer',
        loadComponent: () =>
          import('./pages/admin/admin-customer/admin-customer').then(
            m => m.AdminCustomer
          ),
      },
      {
        path: 'customer-detail/:id',
        loadComponent: () =>
          import('./pages/admin/admin-customer-detail/admin-customer-detail').then(
            m => m.AdminCustomerDetail
          ),
      },
      {
        path: 'customer-add',
        loadComponent: () =>
          import('./pages/admin/admin-customer-add/admin-customer-add').then(
            m => m.AdminCustomerAdd
          ),
      },
      {
        path: 'promotion',
        loadComponent: () =>
          import('./pages/admin/admin-promotion/admin-promotion').then(
            m => m.AdminPromotion
          ),
      },
      {
        path: 'promotion-add',
        loadComponent: () =>
          import('./pages/admin/admin-promotion-add/admin-promotion-add').then(
            m => m.AdminPromotionAdd
          ),
      },
      {
        path: 'homepage',
        loadComponent: () =>
          import('./pages/homepage/homepage').then(
            m => m.Homepage
          ),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // User layout + trang công khai
  {
    path: '',
    loadComponent: () =>
      import('./pages/main-layout/main-layout').then(m => m.MainLayout),
    children: [
      // Homepage
      {
        path: '',
        loadComponent: () =>
          import('./pages/homepage/homepage').then(m => m.Homepage),
      },

      // Danh sách thuê xe
      {
        path: 'rent',
        loadComponent: () =>
          import('./pages/rent/rent').then(m => m.RentPage),
      },

      // Trang chi tiết sản phẩm: /rent/:id
      {
        path: 'rent/:id',
        loadComponent: () =>
          import('./pages/product-detail/product-detail').then(
            m => m.ProductDetail
          ),
      },

      // Trang giỏ hàng: /cart
      {
        path: 'cart',
        loadComponent: () =>
          import('./pages/cart/cart').then(m => m.CartPage),
      },

      // Trang tài khoản khách hàng
      {
        path: 'account',
        children: [
          { path: '', redirectTo: 'profile', pathMatch: 'full' },
          {
            path: 'profile',
            loadComponent: () =>
              import('./pages/account/profile/profile-view').then(
                m => m.ProfileView
              ),
          },
          {
            path: 'profile/edit',
            loadComponent: () =>
              import('./pages/account/profile/profile-edit').then(
                m => m.ProfileEdit
              ),
          },
          {
            path: 'orders',
            loadComponent: () =>
              import('./pages/account/orders/orders').then(
                m => m.AccountOrders
              ),
          },
          {
            path: 'review/:id',
            loadComponent: () =>
              import('./pages/account/review/review').then(
                m => m.AccountReview
              ),
          },
        ],
      },

      // BLOG
      {
        path: 'blog',
        loadComponent: () =>
          import('./pages/blog/blog').then(m => m.Blog),
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'offers',
          },
          {
            path: 'offers',
            data: { breadcrumb: 'Ưu đãi' },
            loadComponent: () =>
              import('./pages/blog/blog-offers/blog-offers').then(
                m => m.BlogOffersComponent
              ),
          },
          {
            path: 'products',
            data: { breadcrumb: 'Sản phẩm mới' },
            loadComponent: () =>
              import('./pages/blog/blog-products/blog-products').then(
                m => m.BlogProducts
              ),
          },
          {
            path: 'news',
            data: { breadcrumb: 'Tin tức' },
            loadComponent: () =>
              import('./pages/blog/blog-news/blog-news').then(
                m => m.BlogNews
              ),
          },
          {
            path: 'details/:type/:id',
            loadComponent: () =>
              import('./pages/blog/blog-details/blog-details').then(
                m => m.BlogDetails
              ),
          },
        ],
      },

      // Sau này có about thì mở thêm
      // { path: 'about', loadComponent: () => import('./pages/about/about').then(m => m.About) },
    ],
  },

  { path: '**', redirectTo: '' },
];
