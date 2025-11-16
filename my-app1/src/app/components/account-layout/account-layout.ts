// src/app/components/account-layout/account-layout.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// Thêm RouterLink và RouterLinkActive để xử lý menu
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
// Import service của bạn (điều chỉnh lại đường dẫn nếu cần)
import { ProfileService } from '../../services/profile.services'; 
import { LoginService } from '../../services/login/login.service'; // <-- THÊM
@Component({
  selector: 'app-account-layout', // Tên thẻ <app-account-layout>
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Thêm RouterLinkActive
  templateUrl: './account-layout.html',
  styleUrl: './account-layout.css',

  // Chúng ta sẽ dùng chung file CSS từ trang cha (profile.css)
  // nên không cần 'styleUrls'
})
export class AccountLayout implements OnInit {
  
  private profileService = inject(ProfileService);
  public userFullname = signal('Khách EcoMove');

  private loginService = inject(LoginService); // <-- THÊM
  private router = inject(Router); // <-- THÊM
  isLogoutModalVisible = signal(false); // <-- THÊM

  ngOnInit(): void {
    this.loadProfileName();
  }

  private loadProfileName(): void {
    // Tự load profile để lấy tên
    this.profileService.loadProfile().subscribe(profile => {
      if (profile && profile.fullname) {
        this.userFullname.set(profile.fullname);
      }
    });
  }
  logout(): void {
    this.isLogoutModalVisible.set(true);
  }

  confirmLogout(): void {
    this.isLogoutModalVisible.set(false);
    this.loginService.logout();
    this.router.navigate(['/']);
  }

  cancelLogout(): void {
    this.isLogoutModalVisible.set(false);
  }
}
