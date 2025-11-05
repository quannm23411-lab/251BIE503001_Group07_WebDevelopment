import { Routes } from '@angular/router';

// Import các layout VÀ các trang
import { MainLayout } from './layouts/main-layout/main-layout';
import { Homepage } from './homepage/homepage'; 
import { Login } from './login/login';
import { Register } from './register/register';

export const routes: Routes = [
  
  // === CÁC TRANG XÁC THỰC (Không có Header/Footer) ===
  // Đặt chúng ở cấp cao nhất
  {
    path: 'login',
    component: Login 
  },
  {
    path: 'register',
    component: Register
  },

  // === CÁC TRANG CHÍNH CỦA ỨNG DỤNG (Có Header/Footer) ===
  // Đặt route này ở CUỐI CÙNG.
  // Nó sẽ là route mặc định cho trang chủ (path: '')
  {
    path: '', // <-- KHÔNG có khoảng trắng
    component: MainLayout, // Tải MainLayout (có header/footer)
    children: [
      // Khi ở trang chủ (path: ''), tải Homepage vào <router-outlet> của MainLayout
      { path: '', component: Homepage }, // <-- KHÔNG có khoảng trắng
      
      // Sau này bạn có thể thêm:
      // { path: 'blog', component: BlogComponent },
      // { path: 'about', component: AboutComponent },
    ]
  }
];