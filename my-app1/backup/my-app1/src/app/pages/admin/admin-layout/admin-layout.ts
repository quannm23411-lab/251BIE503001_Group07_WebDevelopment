import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Auth, AuthUser } from '../../../services/auth/auth'; 

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterOutlet, 
    RouterLink 
  ], 
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css'
})
export class AdminLayout implements OnInit {
  
  private auth = inject(Auth); 
  private router = inject(Router); 

  currentUser: AuthUser | null = null; 
  isMobileMenuOpen: boolean = false; 

  // 🔽 THÊM MỚI: Biến cho popup
  showLogoutConfirmPopup: boolean = false;

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser(); 
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  /**
   * 🔽 THAY ĐỔI: Hàm này giờ chỉ mở popup
   */
  logout() {
    this.showLogoutConfirmPopup = true;
  }

  /**
   * 🔽 THÊM MỚI: Hàm hủy đăng xuất
   */
  cancelLogout() {
    this.showLogoutConfirmPopup = false;
  }

  /**
   * 🔽 THÊM MỚI: Hàm xác nhận đăng xuất
   */
  confirmLogout() {
    this.showLogoutConfirmPopup = false;
    this.auth.logout(); 
    this.router.navigate(['/login']);
  }
}