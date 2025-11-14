import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { Auth, AuthUser } from '../../../services/auth/auth';
import { LoginService } from '../../../services/login/login.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink
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

  // Biến cho popup confirm logout
  showLogoutConfirmPopup: boolean = false;

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
  }

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
