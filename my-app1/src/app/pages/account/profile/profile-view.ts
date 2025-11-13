import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface AccountProfile {
  avatar: string;
  fullname: string;
  email: string;
  password?: string;
  tier?: 'EcoGold' | 'EcoSilver' | 'EcoBasic';
}

@Component({
  selector: 'profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile.css']
})
export class ProfileView {
  private router = inject(Router);

  user: AccountProfile = {
    avatar: '/assets/images/avatar/default.png',
    fullname: 'Khách EcoMove',
    email: '',
    tier: 'EcoBasic'
  };

  showPwd = false;
  userPassword = '';

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem('eco_profile');
      if (raw) {
        try {
          const data = JSON.parse(raw) as AccountProfile;
          this.user = {
            avatar: data.avatar || this.user.avatar,
            fullname: data.fullname || this.user.fullname,
            email: data.email || this.user.email,
            tier: data.tier || this.user.tier
          };
          this.userPassword = data.password || '';
        } catch {
          // nếu parse lỗi thì dùng mặc định
        }
      }
    }
  }

  togglePwd() {
    this.showPwd = !this.showPwd;
  }

  edit() {
    this.router.navigateByUrl('/account/profile/edit');
  }
}
