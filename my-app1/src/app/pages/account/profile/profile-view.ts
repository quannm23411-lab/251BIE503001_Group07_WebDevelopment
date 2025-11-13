import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'profile-view',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile-view.html',
  styleUrls: ['./profile.css']
})
export class ProfileView {
  private router = inject(Router);

  user = {
    avatar: '/assets/images/avatars/default.png',
    fullname: 'Hồng Phúc',
    email: 'phucvh.work@gmail.com',
    tier: 'EcoGold'
  };
  
    showPwd = false;
  // có thể lấy từ user nếu bạn lưu mật khẩu
  userPassword = '12345678';

  togglePwd() {
    this.showPwd = !this.showPwd;
  }



  edit() { this.router.navigateByUrl('/account/profile/edit'); }
}
