// src/app/components/account-layout/account-layout.component.ts

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// Thêm RouterLink và RouterLinkActive để xử lý menu
import { RouterLink, RouterLinkActive } from '@angular/router';
// Import service của bạn (điều chỉnh lại đường dẫn nếu cần)
import { ProfileService } from '../../services/profile.services'; 

@Component({
  selector: 'app-account-layout', // Tên thẻ <app-account-layout>
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // Thêm RouterLinkActive
  templateUrl: './account-layout.html',
  styleUrl: './account-layout.css'

  // Chúng ta sẽ dùng chung file CSS từ trang cha (profile.css)
  // nên không cần 'styleUrls'
})
export class AccountLayout implements OnInit {
  
  private profileService = inject(ProfileService);
  public userFullname = signal('Khách EcoMove');
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
}
