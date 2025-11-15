import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
// Import RouterLinkActive, chúng ta vẫn cần nó
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth, AuthUser } from '../../../services/auth/auth';
import { LoginService } from '../../../services/login/login.service';
// THÊM MỚI: Import NavigationEnd và filter
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive // Giữ lại
  ],
  templateUrl: './admin-layout.html',
  styleUrls: ['./admin-layout.css']
})
export class AdminLayout implements OnInit {

  private auth = inject(Auth);
  private loginService = inject(LoginService);
  private router = inject(Router);

  currentUser: AuthUser | null = null;
  isMobileMenuOpen: boolean = false;
  showLogoutConfirmPopup: boolean = false;
  
  // === THÊM MỚI: Biến lưu URL hiện tại ===
  public currentUrl: string = '';

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();

    // === THÊM MỚI: Lắng nghe thay đổi URL ===
    this.currentUrl = this.router.url; // Lấy URL ban đầu khi tải trang
    this.router.events.pipe(
      // Lọc các sự kiện, chỉ lấy NavigationEnd
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentUrl = event.urlAfterRedirects; // Cập nhật URL khi chuyển trang
    });
    // === HẾT THÊM MỚI ===
  }

  // === THÊM MỚI: Hàm kiểm tra active thủ công ===
  isLinkActive(basePath: string): boolean {
    // Ví dụ: basePath = '/admin/bike'
    // currentUrl = '/admin/bike-add' -> true (vì bắt đầu bằng /admin/bike)
    // currentUrl = '/admin/bike-detail/V001' -> true
    // currentUrl = '/admin/bike' -> true
    // currentUrl = '/admin/order' -> false
    return this.currentUrl.startsWith(basePath);
  }
  // === HẾT THÊM MỚI ===

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  logout() {
    this.showLogoutConfirmPopup = true;
  }

  cancelLogout() {
    this.showLogoutConfirmPopup = false;
  }

  confirmLogout() {
    this.showLogoutConfirmPopup = false;
    this.loginService.logout();  // clear authUser + eco_profile
    this.router.navigate(['/login']);
  }
}